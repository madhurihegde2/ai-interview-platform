const prisma = require("../config/prisma");
const { config } = require("../config/env");
const { TOPICS, publishEvent } = require("../config/kafka");
const {
  generateInterviewQuestions,
  generateFollowUp,
} = require("../services/interviewAI");
const {
  indexSessionDocuments,
  retrieveRelevantChunks,
  formatChunks,
} = require("../services/ragService");

const MAX_ANSWER_LENGTH = 5000;

// Main questions in order, each immediately followed by its follow-up (if any)
const QUESTION_ORDER = [
  { position: "asc" },
  { isFollowUp: "asc" },
  { id: "asc" },
];

const sessionInclude = {
  resume: {
    select: { id: true, originalName: true },
  },
  questions: {
    orderBy: QUESTION_ORDER,
    include: { answer: true },
  },
};

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Shape a session for the client: add the current question and a summary
function serializeSession(session) {
  const current = session.questions.find((q) => !q.answer) || null;
  const answered = session.questions.filter((q) => q.answer);
  const scored = answered.filter((q) => q.answer.status === "SCORED");

  const averageScore = scored.length
    ? Math.round(
        (scored.reduce((sum, q) => sum + q.answer.score, 0) / scored.length) * 10
      ) / 10
    : null;

  return {
    ...session,
    currentQuestionId:
      session.status === "IN_PROGRESS" && current ? current.id : null,
    summary: {
      mainQuestions: session.questions.filter((q) => !q.isFollowUp).length,
      answered: answered.length,
      scored: scored.length,
      pending: answered.filter((q) => q.answer.status === "PENDING").length,
      averageScore,
    },
  };
}

async function findUserSession(sessionId, userId) {
  return prisma.interviewSession.findFirst({
    where: { id: sessionId, resume: { userId } },
    include: sessionInclude,
  });
}

const createInterviewSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const resumeId = parseId(req.body.resumeId);
    const jobTitle = String(req.body.jobTitle || "").trim();
    const jobDescription = String(req.body.jobDescription || "").trim();

    if (!resumeId) {
      return res.status(400).json({ message: "resumeId is required." });
    }

    if (!jobTitle) {
      return res.status(400).json({ message: "Job title is required." });
    }

    if (jobDescription.length < 50) {
      return res.status(400).json({
        message: "Please paste the job description (at least 50 characters).",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    if (!resume.resumeText || resume.resumeText.trim().length < 50) {
      return res.status(400).json({
        message:
          "No text could be read from this resume. Please upload a text-based PDF.",
      });
    }

    const questions = await generateInterviewQuestions({
      resumeText: resume.resumeText,
      jobTitle,
      jobDescription,
      count: config.interview.mainQuestionCount,
    });

    const created = await prisma.interviewSession.create({
      data: {
        resumeId: resume.id,
        jobTitle,
        jobDescription,
        questions: {
          create: questions.map((q, i) => ({ ...q, position: i + 1 })),
        },
      },
    });

    try {
      await indexSessionDocuments(created.id, {
        resumeText: resume.resumeText,
        jobDescription,
      });
    } catch (indexError) {
      // Without embeddings the RAG follow-ups can't work, so roll back
      await prisma.interviewSession.delete({ where: { id: created.id } });
      throw indexError;
    }

    const session = await findUserSession(created.id, userId);

    return res.status(201).json({
      message: "Interview session created successfully.",
      session: serializeSession(session),
    });
  } catch (error) {
    console.error("CREATE INTERVIEW ERROR:", error);

    return res.status(502).json({
      message:
        "Could not generate the interview right now. Please try again in a moment.",
    });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { resume: { userId: req.user.userId } },
      include: sessionInclude,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      sessions: sessions.map(serializeSession),
    });
  } catch (error) {
    console.error("GET INTERVIEW HISTORY ERROR:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interviewId = parseId(req.params.id);

    if (!interviewId) {
      return res.status(400).json({ message: "Invalid interview id." });
    }

    const session = await findUserSession(interviewId, req.user.userId);

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    return res.status(200).json({ session: serializeSession(session) });
  } catch (error) {
    console.error("GET INTERVIEW ERROR:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const userId = req.user.userId;
    const interviewId = parseId(req.params.id);
    const questionId = parseId(req.params.questionId);
    const text = String(req.body.answer || "").trim();

    if (!interviewId || !questionId) {
      return res.status(400).json({ message: "Invalid interview or question id." });
    }

    if (!text) {
      return res.status(400).json({ message: "Answer cannot be empty." });
    }

    if (text.length > MAX_ANSWER_LENGTH) {
      return res.status(400).json({
        message: `Answer is too long (max ${MAX_ANSWER_LENGTH} characters).`,
      });
    }

    const session = await findUserSession(interviewId, userId);

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    if (session.status !== "IN_PROGRESS") {
      return res.status(409).json({ message: "This interview has already ended." });
    }

    const current = session.questions.find((q) => !q.answer);

    if (!current || current.id !== questionId) {
      return res.status(409).json({
        message: "This is not the current question. Please refresh the page.",
      });
    }

    const answer = await prisma.answer.create({
      data: { text, questionId: current.id },
    });

    // Hand scoring to the Kafka worker so the interview never waits on it
    try {
      await publishEvent(TOPICS.ANSWER_SUBMITTED, session.id, {
        answerId: answer.id,
        questionId: current.id,
        sessionId: session.id,
        submittedAt: answer.createdAt,
      });
    } catch (publishError) {
      console.error("KAFKA PUBLISH ERROR:", publishError.message);

      await prisma.answer.update({
        where: { id: answer.id },
        data: {
          status: "FAILED",
          feedback: "The scoring service is unavailable, so this answer was not scored.",
          evaluatedAt: new Date(),
        },
      });
    }

    // One tailored follow-up per main question, grounded in retrieved context
    if (!current.isFollowUp) {
      try {
        const chunks = await retrieveRelevantChunks(
          session.id,
          `${current.question}\n${text}`
        );

        const followUp = await generateFollowUp({
          jobTitle: session.jobTitle || "the target role",
          question: current.question,
          answer: text,
          context: formatChunks(chunks),
        });

        if (followUp) {
          await prisma.interviewQuestion.create({
            data: {
              question: followUp.question,
              category: followUp.category,
              difficulty: current.difficulty,
              position: current.position,
              isFollowUp: true,
              parentId: current.id,
              sessionId: session.id,
            },
          });
        }
      } catch (followUpError) {
        // A failed follow-up shouldn't stop the interview; move on
        console.error("FOLLOW-UP ERROR:", followUpError.message);
      }
    }

    let updated = await findUserSession(session.id, userId);

    if (!updated.questions.some((q) => !q.answer)) {
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      updated = await findUserSession(session.id, userId);
    }

    return res.status(201).json({
      message: "Answer submitted.",
      session: serializeSession(updated),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "This question has already been answered.",
      });
    }

    console.error("SUBMIT ANSWER ERROR:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const completeInterview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const interviewId = parseId(req.params.id);

    if (!interviewId) {
      return res.status(400).json({ message: "Invalid interview id." });
    }

    const session = await findUserSession(interviewId, userId);

    if (!session) {
      return res.status(404).json({ message: "Interview session not found." });
    }

    if (session.status === "IN_PROGRESS") {
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }

    const updated = await findUserSession(session.id, userId);

    return res.status(200).json({ session: serializeSession(updated) });
  } catch (error) {
    console.error("COMPLETE INTERVIEW ERROR:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createInterviewSession,
  getInterviewHistory,
  getInterviewById,
  submitAnswer,
  completeInterview,
};
