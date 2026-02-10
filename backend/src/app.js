const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const logoutRoutes = require("./routes/logoutRoutes");

const app = express();

/* ========= CORS (RENDER SAFE) ========= */
app.use(
  cors({
    origin: true, // 🔥 allow all origins safely
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/logout", logoutRoutes);

/* ========= HEALTH CHECK ========= */
app.get("/", (req, res) => {
  res.status(200).send("Backend is live 🚀");
});

module.exports = app;
