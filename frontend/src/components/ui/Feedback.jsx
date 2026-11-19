import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <Loader2
      className={`animate-spin text-indigo-600 dark:text-indigo-400 ${className}`}
      aria-hidden="true"
    />
  );
}

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`}
      aria-hidden="true"
    />
  );
}

export function ProgressBar({ value, className = "" }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 rounded-full bg-indigo-50 p-3 dark:bg-indigo-500/10">
          <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
        </div>
      )}
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
