import { Code2, Database, Layers, Server } from "lucide-react";

// Display metadata for interview modes and difficulty levels stored on sessions
export const MODE_META = {
  DATA_ENGINEER: { label: "Data Engineer", icon: Database, color: "from-sky-500 to-cyan-500" },
  BACKEND_ENGINEER: { label: "Backend Engineer", icon: Server, color: "from-indigo-500 to-violet-500" },
  FULL_STACK_ENGINEER: { label: "Full-Stack Engineer", icon: Layers, color: "from-fuchsia-500 to-pink-500" },
  SOFTWARE_ENGINEER: { label: "Software Engineer", icon: Code2, color: "from-emerald-500 to-teal-500" },
};

export const MODE_LABELS = Object.fromEntries(
  Object.entries(MODE_META).map(([id, meta]) => [id, meta.label])
);

export const DIFFICULTY_META = {
  EASY: { label: "Easy", description: "Fundamentals and core concepts", badge: "green" },
  MEDIUM: { label: "Medium", description: "Applied scenarios and trade-offs", badge: "yellow" },
  HARD: { label: "Hard", description: "Senior-level deep dives at scale", badge: "red" },
};

export const DIFFICULTY_LABELS = Object.fromEntries(
  Object.entries(DIFFICULTY_META).map(([id, meta]) => [id, meta.label])
);
