const prisma = require("../config/prisma");

const createInterviewSession = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const userId = req.user.userId;

    if (!resumeId) {
      return res.status(400).json({
        message: "resumeId is required.",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: Number(resumeId),
        userId,
      },
    });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found.",
      });
    }

    const sampleQuestions = [
      {
        question: "Tell me about yourself.",
        category: "Behavioral",
        difficulty: "Easy",
      },
      {
        question: "Describe one technical project you are proud of.",
        category: "Projects",
        difficulty: "Medium",
      },
      {
        question: "Explain the difference between SQL and NoSQL databases.",
        category: "Databases",
        difficulty: "Medium",
      },
      {
        question: "How would you improve the performance of a slow API?",
        category: "Backend",
        difficulty: "Medium",
      },
      {
        question: "Describe a time you solved a difficult technical problem.",
        category: "Behavioral",
        difficulty: "Medium",
      },
    ];

    const session = await prisma.interviewSession.create({
      data: {
        resumeId: resume.id,

        questions: {
          create: sampleQuestions,
        },
      },

      include: {
        questions: true,
      },
    });

    return res.status(201).json({
      message: "Interview session created successfully.",
      session,
    });
  } catch (error) {
    console.error("CREATE INTERVIEW ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sessions = await prisma.interviewSession.findMany({
      where: {
        resume: {
          userId,
        },
      },
      include: {
        resume: {
          select: {
            id: true,
            originalName: true,
          },
        },
        questions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      sessions,
    });
  } catch (error) {
    console.error("GET INTERVIEW HISTORY ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const interviewId = Number(req.params.id);

    if (!Number.isInteger(interviewId) || interviewId <= 0) {
      return res.status(400).json({
        message: "Invalid interview id.",
      });
    }

    const session = await prisma.interviewSession.findFirst({
      where: {
        id: interviewId,
        resume: {
          userId,
        },
      },
      include: {
        resume: {
          select: {
            id: true,
            originalName: true,
          },
        },
        questions: true,
      },
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found.",
      });
    }

    return res.status(200).json({
      session,
    });
  } catch (error) {
    console.error("GET INTERVIEW ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createInterviewSession,
  getInterviewHistory,
  getInterviewById,
};