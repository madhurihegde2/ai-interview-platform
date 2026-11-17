const { config } = require("../config/env");
const { openRouterRequest } = require("./llmService");

/**
 * Embed a list of texts. Returns one vector per input, in order.
 */
async function embedTexts(texts) {
  if (texts.length === 0) {
    return [];
  }

  const data = await openRouterRequest("/embeddings", {
    model: config.openRouter.embeddingModel,
    input: texts,
    dimensions: config.embeddingDimensions,
  });

  const vectors = [...data.data]
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  for (const vector of vectors) {
    if (vector.length !== config.embeddingDimensions) {
      throw new Error(
        `Embedding model returned ${vector.length} dimensions; ` +
          `the database expects ${config.embeddingDimensions}.`
      );
    }
  }

  return vectors;
}

async function embedText(text) {
  const [vector] = await embedTexts([text]);
  return vector;
}

// pgvector accepts the literal form '[0.1,0.2,...]'
function toVectorLiteral(vector) {
  return `[${vector.join(",")}]`;
}

module.exports = {
  embedTexts,
  embedText,
  toVectorLiteral,
};
