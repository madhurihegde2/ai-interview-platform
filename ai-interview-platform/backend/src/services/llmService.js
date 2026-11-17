const { config } = require("../config/env");

const { apiKey, baseUrl, chatModels } = config.openRouter;

const RETRY_DELAYS_MS = [2000, 5000];
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

class OpenRouterError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    throw new OpenRouterError(
      `OpenRouter ${path} failed (${response.status}): ${message}`,
      response.status
    );
  }

  return data;
}

function isRetryable(error) {
  return (
    RETRYABLE_STATUS.has(error.status) ||
    error.name === "TimeoutError" ||
    error.message === "The model did not return valid JSON."
  );
}

/**
 * Run an OpenRouter call, retrying transient failures (rate limits,
 * timeouts, provider errors) that are common with free models.
 */
async function withRetry(task) {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === RETRY_DELAYS_MS.length) break;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

function parseJSON(text) {
  // Some models wrap JSON in ```json fences or add text around it
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // fall through to the retryable error below
      }
    }

    throw new Error("The model did not return valid JSON.");
  }
}

/**
 * Ask the chat model for a JSON object. Free models are often rate-limited
 * or occasionally return nothing, so transient failures are retried and
 * OpenRouter falls back through the configured model list.
 */
async function chatJSON({ system, user, temperature = 0.4, maxTokens = 4000 }) {
  const body = {
    model: chatModels[0],
    temperature,
    // reasoning tokens count toward max_tokens; keep thinking short so the
    // answer itself always fits
    max_tokens: maxTokens,
    reasoning: { effort: "low", exclude: true },
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };

  if (chatModels.length > 1) {
    body.models = chatModels;
  }

  return withRetry(async () => {
    const data = await openRouterRequest("/chat/completions", body);
    const content = data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      throw new OpenRouterError("OpenRouter returned an empty response.", 502);
    }

    return parseJSON(content);
  });
}

module.exports = {
  openRouterRequest,
  withRetry,
  chatJSON,
};
