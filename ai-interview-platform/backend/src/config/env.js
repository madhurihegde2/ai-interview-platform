// Central place for configuration so every process (API server, worker)
// validates the same variables and fails fast with a clear message.
require("dotenv").config();

function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "Copy backend/.env.example to backend/.env and fill them in."
    );
    process.exit(1);
  }
}

const config = {
  port: Number(process.env.PORT) || 3001,
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim()),

  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    chatModel: process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini",
    embeddingModel:
      process.env.EMBEDDING_MODEL || "openai/text-embedding-3-small",
  },

  // Must match the vector(N) column in prisma/schema.prisma
  embeddingDimensions: 1536,

  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || "ai-interview-platform",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092")
      .split(",")
      .map((broker) => broker.trim()),
  },

  interview: {
    mainQuestionCount: Number(process.env.INTERVIEW_QUESTION_COUNT) || 5,
  },
};

module.exports = { config, requireEnv };
