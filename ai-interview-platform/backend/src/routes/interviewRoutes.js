const express = require("express");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const {
  createInterviewSession,
  getInterviewHistory,
  getInterviewById,
  submitAnswer,
  completeInterview,
} = require("../controllers/interviewController");

const router = express.Router();

router.use(authenticateUser);

router.post("/", createInterviewSession);
router.get("/", getInterviewHistory);
router.get("/:id", getInterviewById);
router.post("/:id/questions/:questionId/answer", submitAnswer);
router.post("/:id/complete", completeInterview);

module.exports = router;
