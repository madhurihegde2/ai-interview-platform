import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

import { Skeleton } from "./ui/Feedback";

function AnswerEvaluation({ answer }) {
  if (answer.status === "PENDING") {
    return (
      <div className="mt-4 space-y-2" aria-live="polite">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Scoring your answer...
        </p>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    );
  }

  if (answer.status === "FAILED") {
    return (
      <p className="mt-4 flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {answer.feedback || "This answer could not be scored."}
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      {answer.feedback && (
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {answer.feedback}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {answer.strengths?.length > 0 && (
          <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Strengths
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-emerald-900/80 dark:text-emerald-100/80">
              {answer.strengths.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        {answer.improvements?.length > 0 && (
          <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-500/10">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              To improve
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-amber-900/80 dark:text-amber-100/80">
              {answer.improvements.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnswerEvaluation;
