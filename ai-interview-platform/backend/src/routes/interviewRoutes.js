const express = require("express");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const {
  createInterviewSession,
  getInterviewHistory,
  getInterviewById,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/", authenticateUser, createInterviewSession);

router.get("/", authenticateUser, getInterviewHistory);

router.get("/:id", authenticateUser, getInterviewById);

module.exports = router;