import { useEffect, useMemo, useState } from "react";
import { History as HistoryIcon, PlusCircle, Search } from "lucide-react";

import Card from "../components/ui/Card";
import { ButtonLink } from "../components/ui/Button";
import { EmptyState, Skeleton } from "../components/ui/Feedback";
import { Input } from "../components/ui/Input";
import InterviewList from "../components/InterviewList";
import { getInterviewHistory } from "../api/interviewApi";
import { MODE_META } from "../utils/interviewLabels";

const SELECT =
  "rounded-lg border-0 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 dark:bg-slate-900 dark:text-white dark:ring-slate-700";

function History() {
  const [sessions, setSessions] = useState(null);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  useEffect(() => {
    getInterviewHistory()
      .then((response) => setSessions(response.data.sessions))
      .catch(() => setSessions([]));
  }, []);

  const filtered = useMemo(() => {
    if (!sessions) return [];
    const needle = query.trim().toLowerCase();

    return sessions.filter(
      (session) =>
        (mode === "ALL" || session.mode === mode) &&
        (status === "ALL" || session.status === status) &&
        (!needle ||
          (session.jobTitle || "").toLowerCase().includes(needle) ||
          (MODE_META[session.mode]?.label || "").toLowerCase().includes(needle))
    );
  }, [sessions, query, mode, status]);

  return (
    <div className="animate-slide-up">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Interview history
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Review past interviews, scores and feedback.
          </p>
        </div>
        <ButtonLink to="/interviews/new" icon={PlusCircle}>New interview</ButtonLink>
      </header>

      <Card>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by job title or track"
              className="pl-9"
              aria-label="Search interviews"
            />
          </div>
          <select value={mode} onChange={(event) => setMode(event.target.value)} className={SELECT} aria-label="Filter by track">
            <option value="ALL">All tracks</option>
            {Object.entries(MODE_META).map(([id, meta]) => (
              <option key={id} value={id}>{meta.label}</option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={SELECT} aria-label="Filter by status">
            <option value="ALL">Any status</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {!sessions ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No interviews yet"
            description="Your completed and in-progress interviews will appear here."
            action={<ButtonLink to="/interviews/new" icon={PlusCircle}>Start an interview</ButtonLink>}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="No matches" description="Try a different search or filter." />
        ) : (
          <>
            <p className="px-6 pt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
              {filtered.length} interview{filtered.length === 1 ? "" : "s"}
            </p>
            <InterviewList sessions={filtered} />
          </>
        )}
      </Card>
    </div>
  );
}

export default History;
