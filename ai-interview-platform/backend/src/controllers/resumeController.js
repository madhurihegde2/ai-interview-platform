const fs = require("fs");
const prisma = require("../config/prisma");
const {
  extractTextFromPDF,
} = require("../services/pdfService");

const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please upload a PDF resume.",
    });
  }

  try {
    // Parse first so a corrupt PDF never leaves a half-created Resume row
    let extractedText;

    try {
      extractedText = await extractTextFromPDF(req.file.path);
    } catch (parseError) {
      console.error("PDF PARSE ERROR:", parseError);

      fs.unlink(req.file.path, () => {});

      return res.status(400).json({
        message: "Could not read this PDF. Please upload a valid PDF resume.",
      });
    }

    const resume = await prisma.resume.create({
      data: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        resumeText: extractedText,
        userId: req.user.userId,
      },
    });

    return res.status(201).json({
      message: "Resume uploaded and processed successfully.",
      resume,
    });
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);

    fs.unlink(req.file.path, () => {});

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getLatestResume = async (req, res) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        uploadedAt: "desc",
      },
      select: {
        id: true,
        originalName: true,
        uploadedAt: true,
      },
    });

    return res.status(200).json({
      resume,
    });
  } catch (error) {
    console.error("GET LATEST RESUME ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  uploadResume,
  getLatestResume,
};
