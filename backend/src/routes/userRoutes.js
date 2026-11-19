const express = require("express");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const {
  getProfile,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile", authenticateUser, getProfile);

module.exports = router;
