const { chatJSON } = require("./llmService");

const MAX_RESUME_CHARS = 12_000;
const MAX_JD_CHARS = 8_000;

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function clip(text, max) {
  return text.length > max ? `${text.slice(0, max)}\n[truncated]` : text;
}

function clampScore(value) {
  const score = Math.round(Number(value));
  if (!Number.isFinite(score)) return null;
  return Math.min(10, Math.max(1, score));
}

function toStringList(value) {
  return Array.isArray(value)
    ? value.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 5)
    : [];
}

/**
 * Generate role-specific interview questions from the resume and job description.
 */
async function generateInterviewQuestions({
  resumeText,
  jobTitle,
  jobDescription,
  count,
}) {
  const result = await chatJSON({
    temperature: 0.7,
    system:
      "You are an experienced technical interviewer. You write realistic, " +
      "role-specific interview questions that connect the candidate's actual " +
      "experience to the requirements of the job. Respond only with JSON.",
    user: `Write exactly ${count} interview questions for this candidate.

Job title: ${jobTitle}

Job description:
${clip(jobDescription, MAX_JD_CHARS)}

Candidate resume:
${clip(resumeText, MAX_RESUME_CHARS)}

Requirements:
- Mix technical, project-deep-dive, and behavioral questions.
- Reference specific projects, tools, or experience from the resume where relevant.
- Target the skills the job description emphasizes.
- Order from easier warm-up questions to harder ones.

Return JSON in this shape:
{"questions": [{"question": "...", "category": "Technical | Projects | Behavioral | System Design | ...", "difficulty": "Easy | Medium | Hard"}]}`,
  });

  const questions = Array.isArray(result.questions) ? result.questions : [];

  const cleaned = questions
    .filter((q) => q && typeof q.question === "string" && q.question.trim())
    .slice(0, count)
    .map((q) => ({
      question: q.question.trim(),
      category: String(q.category || "General").trim(),
      difficulty: DIFFICULTIES.includes(q.difficulty) ? q.difficulty : "Medium",
    }));

  if (cleaned.length === 0) {
    throw new Error("The model did not return any interview questions.");
  }

  return cleaned;
}

/**
 * Decide whether the answer deserves a follow-up, grounded in retrieved
 * resume/job-description context. Returns the follow-up text or null.
 */
async function generateFollowUp({ jobTitle, question, answer, context }) {
  const result = await chatJSON({
    temperature: 0.6,
    system:
      "You are an experienced interviewer conducting a live mock interview. " +
      "You ask one sharp, tailored follow-up when an answer is vague, " +
      "incomplete, or opens an interesting thread worth probing. Respond only with JSON.",
    user: `Role: ${jobTitle}

Relevant context retrieved from the candidate's resume and the job description:
${context || "(no context retrieved)"}

Interview question:
${question}

Candidate's answer:
${answer}

Decide whether a follow-up question is warranted. If it is, write ONE concise
follow-up that digs deeper into the answer and ties it to the resume or the
job requirements above. Do not repeat the original question.

Return JSON: {"needsFollowUp": true|false, "followUp": "..." or null, "category": "..."}`,
  });

  if (!result.needsFollowUp || typeof result.followUp !== "string") {
    return null;
  }

  const followUp = result.followUp.trim();

  return followUp
    ? { question: followUp, category: String(result.category || "Follow-up").trim() }
    : null;
}

/**
 * Score an answer from 1 to 10 with feedback, grounded in retrieved context.
 */
async function evaluateAnswer({ jobTitle, question, answer, context }) {
  const result = await chatJSON({
    temperature: 0.2,
    system:
      "You are a fair, specific interview coach. You score answers against " +
      "what a strong candidate for the role would say, and give actionable " +
      "feedback. Respond only with JSON.",
    user: `Role: ${jobTitle}

Relevant context from the candidate's resume and the job description:
${context || "(no context retrieved)"}

Question:
${question}

Candidate's answer:
${answer}

Score the answer from 1 (very weak) to 10 (excellent), considering relevance,
depth, structure, and how well it demonstrates the skills the role needs.

Return JSON:
{"score": <1-10>, "feedback": "2-4 sentence summary", "strengths": ["..."], "improvements": ["..."]}`,
  });

  const score = clampScore(result.score);

  if (score === null) {
    throw new Error("The model did not return a valid score.");
  }

  return {
    score,
    feedback: String(result.feedback || "").trim(),
    strengths: toStringList(result.strengths),
    improvements: toStringList(result.improvements),
  };
}

module.exports = {
  generateInterviewQuestions,
  generateFollowUp,
  evaluateAnswer,
};
