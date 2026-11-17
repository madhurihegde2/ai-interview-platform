// Kafka consumer that scores interview answers asynchronously, so the
// interview flow never waits on evaluation.
const { config, requireEnv } = require("../config/env");

requireEnv(["DATABASE_URL", "OPENROUTER_API_KEY"]);

const prisma = require("../config/prisma");
const { kafka, TOPICS, ensureTopics } = require("../config/kafka");
const { evaluateAnswer } = require("../services/interviewAI");
const {
  retrieveRelevantChunks,
  formatChunks,
} = require("../services/ragService");

const consumer = kafka.consumer({ groupId: "answer-scoring" });

async function scoreAnswer(answerId) {
  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: {
      question: {
        include: { session: true },
      },
    },
  });

  if (!answer) {
    console.warn(`Answer ${answerId} no longer exists; skipping.`);
    return;
  }

  if (answer.status === "SCORED") {
    // already handled (e.g. message redelivered after a restart)
    return;
  }

  const { question } = answer;
  const { session } = question;

  try {
    const chunks = await retrieveRelevantChunks(
      session.id,
      `${question.question}\n${answer.text}`
    );

    const evaluation = await evaluateAnswer({
      jobTitle: session.jobTitle || "the target role",
      mode: session.mode,
      difficulty: session.difficulty,
      question: question.question,
      answer: answer.text,
      context: formatChunks(chunks),
    });

    await prisma.answer.update({
      where: { id: answer.id },
      data: {
        status: "SCORED",
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        evaluatedAt: new Date(),
      },
    });

    console.log(`Scored answer ${answer.id}: ${evaluation.score}/10`);
  } catch (error) {
    console.error(`SCORING ERROR (answer ${answer.id}):`, error.message);

    await prisma.answer.update({
      where: { id: answer.id },
      data: {
        status: "FAILED",
        feedback: "This answer could not be scored. Please try again later.",
        evaluatedAt: new Date(),
      },
    });
  }
}

async function start() {
  await ensureTopics();
  await consumer.connect();
  // With no committed offset yet, start from the earliest message so answers
  // published before this worker joined are not skipped. Scoring is
  // idempotent (already-scored answers are ignored), so replays are safe.
  await consumer.subscribe({
    topic: TOPICS.ANSWER_SUBMITTED,
    fromBeginning: true,
  });

  await consumer.run({
    // score several answers in parallel across partitions
    partitionsConsumedConcurrently: 3,
    eachMessage: async ({ message }) => {
      let answerId;

      try {
        answerId = Number(JSON.parse(message.value.toString()).answerId);
      } catch {
        answerId = NaN;
      }

      // Skip malformed messages instead of retrying them forever
      if (!Number.isInteger(answerId) || answerId <= 0) {
        console.warn("Skipping malformed message:", message.value?.toString());
        return;
      }

      await scoreAnswer(answerId);
    },
  });

  console.log(
    `Scoring worker listening on "${TOPICS.ANSWER_SUBMITTED}" (brokers: ${config.kafka.brokers.join(", ")})`
  );
}

async function shutdown() {
  await consumer.disconnect().catch(() => {});
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((error) => {
  console.error("Scoring worker failed to start:", error);
  process.exit(1);
});
