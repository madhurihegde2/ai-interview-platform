const express = require("express");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  uploadResume,
} = require("../controllers/resumeController");

const router = express.Router();

router.post(
  "/upload",
  authenticateUser,
  upload.single("resume"),
  uploadResume
);

module.exports = router;