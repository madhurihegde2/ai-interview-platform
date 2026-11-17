// Re-embed every stored resume/job-description chunk with the current
// EMBEDDING_MODEL. Run after changing the embedding model, since vectors
// from different models can't be compared:  npm run reembed
const { requireEnv } = require("../config/env");

requireEnv(["DATABASE_URL", "OPENROUTER_API_KEY"]);

const prisma = require("../config/prisma");
const { embedTexts, toVectorLiteral } = require("../services/embeddingService");

const BATCH_SIZE = 32;

async function main() {
  const chunks = await prisma.documentChunk.findMany({
    select: { id: true, content: true },
    orderBy: { id: "asc" },
  });

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vectors = await embedTexts(batch.map((chunk) => chunk.content));

    await prisma.$transaction(
      batch.map(
        (chunk, j) => prisma.$executeRaw`
          UPDATE "DocumentChunk"
          SET "embedding" = ${toVectorLiteral(vectors[j])}::vector
          WHERE "id" = ${chunk.id}
        `
      )
    );
  }

  console.log(`Re-embedded ${chunks.length} chunk(s).`);
}

main()
  .catch((error) => {
    console.error("Re-embedding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
