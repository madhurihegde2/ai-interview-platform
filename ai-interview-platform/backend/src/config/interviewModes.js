// Interview modes and difficulty levels. The frontend loads these from
// GET /api/interviews/options so there is one source of truth.

const INTERVIEW_MODES = {
  DATA_ENGINEER: {
    label: "Data Engineer",
    description: "SQL, data modeling, pipelines, streaming and warehousing.",
    focusAreas: [
      "Advanced SQL (joins, window functions, query optimization)",
      "Data modeling (star/snowflake schemas, normalization, slowly changing dimensions)",
      "Batch and streaming pipelines (ETL/ELT, Spark, Kafka)",
      "Data warehousing and lakehouse design",
      "Orchestration and scheduling (e.g. Airflow), idempotency and backfills",
      "Data quality, testing, and observability",
    ],
  },
  BACKEND_ENGINEER: {
    label: "Backend Engineer",
    description: "APIs, databases, caching, distributed systems and reliability.",
    focusAreas: [
      "REST/API design, versioning, and error handling",
      "Relational and NoSQL databases, indexing, transactions",
      "Caching strategies and consistency",
      "Concurrency, queues, and event-driven architecture",
      "Distributed systems, scalability, and fault tolerance",
      "Security, authentication, and observability",
    ],
  },
  FULL_STACK_ENGINEER: {
    label: "Full-Stack Engineer",
    description: "Frontend architecture, APIs, data, auth and performance end to end.",
    focusAreas: [
      "Frontend architecture, components, and state management (e.g. React)",
      "Browser performance, rendering, and accessibility",
      "API design and frontend-backend integration",
      "Databases and data modeling for product features",
      "Authentication, sessions, and web security (XSS, CSRF)",
      "Deployment, CI/CD, and debugging production issues",
    ],
  },
  SOFTWARE_ENGINEER: {
    label: "Software Engineer",
    description: "Data structures, algorithms, design, testing and fundamentals.",
    focusAreas: [
      "Data structures and algorithms, time/space complexity",
      "Object-oriented design and design patterns",
      "Testing strategies and code quality",
      "Debugging and problem-solving approach",
      "System design fundamentals",
      "Collaboration and engineering behaviors",
    ],
  },
};

const DIFFICULTY_LEVELS = {
  EASY: {
    label: "Easy",
    guidance:
      "Entry-level: fundamentals, definitions, and straightforward applied questions. " +
      "Expect a clear explanation of core concepts.",
  },
  MEDIUM: {
    label: "Medium",
    guidance:
      "Mid-level: applied scenarios, trade-offs, and reasoning about real projects. " +
      "Expect concrete examples and justified decisions.",
  },
  HARD: {
    label: "Hard",
    guidance:
      "Senior-level: deep dives, system design at scale, edge cases, failure modes, " +
      "and ambiguous problems. Expect depth, precision, and strong trade-off analysis.",
  },
};

const DEFAULT_MODE = "SOFTWARE_ENGINEER";
const DEFAULT_DIFFICULTY = "MEDIUM";

function getInterviewOptions() {
  return {
    modes: Object.entries(INTERVIEW_MODES).map(([id, mode]) => ({
      id,
      label: mode.label,
      description: mode.description,
    })),
    difficulties: Object.entries(DIFFICULTY_LEVELS).map(([id, level]) => ({
      id,
      label: level.label,
    })),
    defaults: { mode: DEFAULT_MODE, difficulty: DEFAULT_DIFFICULTY },
  };
}

module.exports = {
  INTERVIEW_MODES,
  DIFFICULTY_LEVELS,
  DEFAULT_MODE,
  DEFAULT_DIFFICULTY,
  getInterviewOptions,
};
