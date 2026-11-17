const { config, requireEnv } = require("./config/env");

// Fail fast instead of returning 500s at request time
requireEnv(["DATABASE_URL", "JWT_SECRET", "OPENROUTER_API_KEY"]);

const app = require("./app");
const { disconnectProducer } = require("./config/kafka");

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

async function shutdown() {
  server.close();
  await disconnectProducer();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
