const prisma = require("../config/prisma");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume.",
      });
    }

    const resume = await prisma.resume.create({
      data: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Resume uploaded successfully.",
      resume,
    });
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  uploadResume,
};