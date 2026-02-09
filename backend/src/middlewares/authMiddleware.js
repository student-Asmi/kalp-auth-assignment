const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Session = require("../models/Session");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1️⃣ Header check
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    // 2️⃣ JWT verify (ONLY JWT errors here)
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.log("JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const { userId, sessionId } = decoded;

  // 3️⃣ Session check (OUTSIDE jwt try/catch)
  const session = await Session.findOne({
    sessionId,
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
  });

  if (!session) {
    console.log("SESSION NOT FOUND:", { userId, sessionId });
    return res.status(401).json({ message: "Session expired or revoked" });
  }

  // 4️⃣ Attach user
  req.user = { userId, sessionId };

  // 5️⃣ All good
  next();
};

module.exports = authMiddleware;

