import { Navigate, Outlet } from "react-router-dom";
import { BrainCircuit, MessagesSquare, Sparkles, Target } from "lucide-react";

import ThemeToggle from "../components/ThemeToggle";

const HIGHLIGHTS = [
  {
    icon: Target,
    title: "Role-specific questions",
    text: "Generated from your resume and the job you're targeting.",
  },
  {
    icon: MessagesSquare,
    title: "Tailored follow-ups",
    text: "The interviewer digs deeper based on what you actually said.",
  },
  {
    icon: Sparkles,
    title: "Real-time feedback",
    text: "Every answer is scored with strengths and what to improve.",
  },
];

function AuthLayout() {
  // Already signed in: skip the login/register screens
  if (localStorage.getItem("token")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center gap-2 text-lg font-bold">
          <BrainCircuit className="h-7 w-7" aria-hidden="true" />
          AI Interview Platform
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Practice the interview before the interview.
          </h1>
          <p className="mt-4 text-lg text-indigo-100">
            Realistic mock interviews for data, backend, full-stack and software engineering roles.
          </p>

          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-indigo-100">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-indigo-200">
          Built with React, Node.js, PostgreSQL, pgvector and Kafka.
        </p>
      </aside>

      <main className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8 flex items-center gap-2 text-lg font-bold text-indigo-600 lg:hidden dark:text-indigo-400">
            <BrainCircuit className="h-7 w-7" aria-hidden="true" />
            AI Interview Platform
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
