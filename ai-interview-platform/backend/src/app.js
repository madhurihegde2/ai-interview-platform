const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { config } = require("./config/env");

const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: config.corsOrigins,
  })
);

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to AI Interview Platform Backend 🚀");
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/interviews", interviewRoutes);

// Error handler: always respond with JSON, never leak stack traces
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum size is 5 MB."
        : err.message;

    return res.status(400).json({ message });
  }

  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error("UNHANDLED ERROR:", err);

  return res.status(500).json({
    message: "Internal Server Error",
  });
});

module.exports = app;