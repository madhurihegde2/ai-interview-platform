const express = require("express");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to AI Interview Platform Backend 🚀");
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;