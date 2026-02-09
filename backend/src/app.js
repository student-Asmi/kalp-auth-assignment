const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const logoutRoutes = require("./routes/logoutRoutes");

const app = express();

/* ========= CORS (🔥 MUST BE FIRST) ========= */
app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ========= BODY PARSER ========= */
app.use(express.json());

/* ========= ROUTES ========= */
app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/logout", logoutRoutes);

module.exports = app;
