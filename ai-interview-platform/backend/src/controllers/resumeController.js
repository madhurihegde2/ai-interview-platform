const prisma = require("../config/prisma");
const {
  extractTextFromPDF,
} = require("../services/pdfService");

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


    const extractedText = await extractTextFromPDF(req.file.path);

    const updatedResume = await prisma.resume.update({
    where: {
        id: resume.id,
        },
    data: {
        resumeText: extractedText,
        },
    });

    console.log("========== RESUME TEXT ==========");
    console.log(extractedText);
    console.log("================================");

    return res.status(201).json({
        message: "Resume uploaded and processed successfully.",
        resume: updatedResume,
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