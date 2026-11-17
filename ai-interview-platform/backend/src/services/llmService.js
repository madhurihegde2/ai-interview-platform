const { config } = require("../config/env");

const { apiKey, baseUrl, chatModel } = config.openRouter;

async function openRouterRequest(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "AI Interview Platform",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || response.statusText;
    throw new Error(`OpenRouter ${path} failed (${response.status}): ${message}`);
  }

  return data;
}

function parseJSON(text) {
  // Some models wrap JSON in ```json fences despite instructions
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/, "")
    .trim();

  return JSON.parse(cleaned);
}

/**
 * Ask the chat model for a JSON object.
 */
async function chatJSON({ system, user, temperature = 0.4, maxTokens = 1500 }) {
  const data = await openRouterRequest("/chat/completions", {
    model: chatModel,
    temperature,
    // cap the response so OpenRouter doesn't reserve the model's full output limit
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned an empty response.");
  }

  return parseJSON(content);
}

module.exports = {
  openRouterRequest,
  chatJSON,
};
