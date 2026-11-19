const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

// Emails are stored lowercased so "A@x.com" and "a@x.com" are the same account
const normalizeEmail = (email) => String(email).trim().toLowerCase();

// Case-insensitive lookup so accounts created before normalization still match
const findUserByEmail = (email) =>
  prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

const registerUser = async (req, res) => {
  try {
    const { fullName, password } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    // Never send password back
    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};



const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email ? normalizeEmail(req.body.email) : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};