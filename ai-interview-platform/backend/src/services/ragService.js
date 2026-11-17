const prisma = require("../config/prisma");
const {
  embedTexts,
  embedText,
  toVectorLiteral,
} = require("./embeddingService");

const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 150;

/**
 * Split text into overlapping chunks, preferring paragraph/line boundaries.
 */
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const normalized = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const pieces = normalized
    .split(/\n{2,}|\n/)
    .map((piece) => piece.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const piece of pieces) {
    if (current && current.length + piece.length + 1 > size) {
      chunks.push(current);
      // carry the tail of the previous chunk over for context continuity
      current = current.slice(-overlap);
    }

    // a single very long line gets hard-split
    if (piece.length > size) {
      if (current) {
        chunks.push(current);
        current = "";
      }

      for (let i = 0; i < piece.length; i += size - overlap) {
        chunks.push(piece.slice(i, i + size));

        if (i + size >= piece.length) {
          break;
        }
      }
      continue;
    }

    current = current ? `${current}\n${piece}` : piece;
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}

/**
 * Chunk and embed the resume and job description, storing vectors in pgvector.
 */
async function indexSessionDocuments(sessionId, { resumeText, jobDescription }) {
  const docs = [
    ...chunkText(resumeText).map((content) => ({ source: "RESUME", content })),
    ...chunkText(jobDescription).map((content) => ({
      source: "JOB_DESCRIPTION",
      content,
    })),
  ];

  const vectors = await embedTexts(docs.map((doc) => doc.content));

  await prisma.$transaction(
    docs.map(
      (doc, i) => prisma.$executeRaw`
        INSERT INTO "DocumentChunk" ("source", "content", "embedding", "sessionId")
        VALUES (${doc.source}, ${doc.content}, ${toVectorLiteral(vectors[i])}::vector, ${sessionId})
      `
    )
  );

  return docs.length;
}

/**
 * Return the chunks most similar to the query (cosine distance).
 */
async function retrieveRelevantChunks(sessionId, query, limit = 4) {
  const vector = toVectorLiteral(await embedText(query));

  return prisma.$queryRaw`
    SELECT "id", "source", "content",
           1 - ("embedding" <=> ${vector}::vector) AS "similarity"
    FROM "DocumentChunk"
    WHERE "sessionId" = ${sessionId} AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `;
}

function formatChunks(chunks) {
  return chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] (${chunk.source === "RESUME" ? "Resume" : "Job description"})\n${chunk.content}`
    )
    .join("\n\n");
}

module.exports = {
  chunkText,
  indexSessionDocuments,
  retrieveRelevantChunks,
  formatChunks,
};
