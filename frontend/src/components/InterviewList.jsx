import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import Badge from "./ui/Badge";
import ScoreRing from "./ui/ScoreRing";
import { DIFFICULTY_META, MODE_META } from "../utils/interviewLabels";
import { formatDate } from "../utils/session";

function InterviewList({ sessions }) {
  return (
    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
      {sessions.map((session) => {
        const mode = MODE_META[session.mode] || MODE_META.SOFTWARE_ENGINEER;
        const difficulty = DIFFICULTY_META[session.difficulty];
        const Icon = mode.icon;
        const inProgress = session.status === "IN_PROGRESS";

        return (
          <li key={session.id}>
            <Link
              to={`/interviews/${session.id}`}
              className="group flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mode.color} text-white shadow-sm`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">
                    {session.jobTitle || mode.label}
                  </p>
                  {inProgress ? (
                    <Badge color="indigo">In progress</Badge>
                  ) : (
                    <Badge color="gray">Completed</Badge>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{mode.label}</span>
                  {difficulty && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>{difficulty.label}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{formatDate(session.createdAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{session.summary.answered} answered</span>
                </p>
              </div>

              <ScoreRing
                score={session.summary.averageScore}
                size="sm"
                label={
                  session.summary.averageScore !== null
                    ? `Average score ${session.summary.averageScore} out of 10`
                    : "No scores yet"
                }
              />
              <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default InterviewList;
