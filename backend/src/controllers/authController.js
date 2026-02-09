// The login endpoint intelligently handles new users by auto-registering them
// and enforcing email verification before granting access.
// Session creation is atomic to prevent race conditions.

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const Session = require("../models/Session");
const sendEmail = require("../utils/sendEmail");

/* ======================
   REGISTER USER
====================== */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });

    // User exists & verified
    if (existingUser && existingUser.isVerified) {
      return res
        .status(400)
        .json({ message: "User already exists and is verified" });
    }

    // User exists but not verified → resend mail
    if (existingUser && !existingUser.isVerified) {
      await VerificationToken.deleteMany({ userId: existingUser._id });

      const token = crypto.randomBytes(32).toString("hex");

      await VerificationToken.create({
        userId: existingUser._id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

      await sendEmail(
        existingUser.email,
        "Verify your email",
        `<p>Please verify your email:</p>
         <a href="${verifyLink}">Verify Email</a>`
      );

      return res.json({
        message: "User exists but not verified. Verification email resent.",
      });
    }

    // New user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const token = crypto.randomBytes(32).toString("hex");

    await VerificationToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

    await sendEmail(
      email,
      "Verify your email",
      `<p>Click to verify:</p>
       <a href="${verifyLink}">Verify Email</a>`
    );

    return res.status(201).json({
      message: "User registered. Verification email sent.",
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================
   VERIFY EMAIL
====================== */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const record = await VerificationToken.findOne({ token });
    if (!record) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await User.findByIdAndUpdate(record.userId, { isVerified: true });
    await VerificationToken.deleteOne({ _id: record._id });

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};

/* ======================
   LOGIN (RACE-CONDITION SAFE)
====================== */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    let user = await User.findOne({ email });

    /* ========= CASE 1: USER NOT EXISTS ========= */
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        email,
        password: hashedPassword,
        isVerified: false,
      });

      const token = crypto.randomBytes(32).toString("hex");

      await VerificationToken.create({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

      await sendEmail(
        email,
        "Verify your email",
        `<p>Account created. Please verify your email:</p>
         <a href="${verifyLink}">Verify Email</a>`
      );

      return res.status(201).json({
        message:
          "Account created. Verification email sent. Please verify to login.",
      });
    }

    /* ========= CASE 2: USER EXISTS BUT NOT VERIFIED ========= */
    if (!user.isVerified) {
      await VerificationToken.deleteMany({ userId: user._id });

      const token = crypto.randomBytes(32).toString("hex");

      await VerificationToken.create({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const verifyLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

      await sendEmail(
        user.email,
        "Verify your email",
        `<p>Please verify your email to continue:</p>
         <a href="${verifyLink}">Verify Email</a>`
      );

      return res.status(403).json({
        message: "Email not verified. Verification email resent.",
      });
    }

    /* ========= CASE 3: USER VERIFIED ========= */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    /* ========= STEP 11.2: ATOMIC SESSION CREATION ========= */

    const deviceHash = crypto
      .createHash("sha256")
      .update(req.headers["user-agent"] + req.ip)
      .digest("hex");

    const mongoSession = await mongoose.startSession();
    let sessionId;

    try {
      mongoSession.startTransaction();

      // Deactivate existing active session for same device
      await Session.updateMany(
        {
          userId: user._id,
          deviceHash,
          isActive: true,
        },
        { isActive: false },
        { session: mongoSession }
      );

      // Create new session atomically
      const newSession = await Session.create(
        [
          {
            userId: user._id,
            sessionId: uuidv4(),
            deviceHash,
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            isActive: true,
          },
        ],
        { session: mongoSession }
      );

      sessionId = newSession[0].sessionId;

      await mongoSession.commitTransaction();
    } catch (err) {
      await mongoSession.abortTransaction();

      if (err.code === 11000) {
        return res.status(409).json({
          message: "Concurrent login detected. Please try again.",
        });
      }

      throw err;
    } finally {
      mongoSession.endSession();
    }

    /* ========= JWT ISSUE ========= */
    const jwtToken = jwt.sign(
      { userId: user._id, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.json({
      message: "Login successful",
      token: jwtToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================
   EXPORTS
====================== */
module.exports = {
  register,
  verifyEmail,
  login,
};
