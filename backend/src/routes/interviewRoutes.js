const express = require("express");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const {
  getOptions,
  createInterviewSession,
  getInterviewHistory,
  getInterviewById,
  submitAnswer,
  completeInterview,
} = require("../controllers/interviewController");

const router = express.Router();

router.use(authenticateUser);

// must come before "/:id"
router.get("/options", getOptions);
router.post("/", createInterviewSession);
router.get("/", getInterviewHistory);
router.get("/:id", getInterviewById);
router.post("/:id/questions/:questionId/answer", submitAnswer);
router.post("/:id/complete", completeInterview);

module.exports = router;
