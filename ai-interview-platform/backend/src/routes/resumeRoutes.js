const express = require("express");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  uploadResume,
  getLatestResume,
} = require("../controllers/resumeController");

const router = express.Router();

router.post(
  "/upload",
  authenticateUser,
  upload.single("resume"),
  uploadResume
);

router.get("/latest", authenticateUser, getLatestResume);

module.exports = router;