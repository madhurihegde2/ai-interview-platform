import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  ClipboardList,
  MessageSquareText,
  PlusCircle,
  Sparkles,
  Trophy,
} from "lucide-react";

import Card, { CardHeader } from "../components/ui/Card";
import { ButtonLink } from "../components/ui/Button";
import { EmptyState, Skeleton } from "../components/ui/Feedback";
import StatCard from "../components/StatCard";
import InterviewList from "../components/InterviewList";
import ResumeUploader from "../components/ResumeUploader";
import { getLatestResume } from "../api/resumeApi";
import { getInterviewHistory } from "../api/interviewApi";
import { MODE_META } from "../utils/interviewLabels";
import { getStoredUser } from "../utils/session";

function computeStats(sessions) {
  const scoredAnswers = sessions.flatMap((session) =>
    session.questions
      .map((question) => question.answer)
      .filter((answer) => answer?.status === "SCORED")
  );

  const averageScore = scoredAnswers.length
    ? Math.round(
        (scoredAnswers.reduce((sum, answer) => sum + answer.score, 0) /
          scoredAnswers.length) *
          10
      ) / 10
    : null;

  // Best track = highest average score among tracks with scored answers
  const byMode = {};
  for (const session of sessions) {
    for (const question of session.questions) {
      if (question.answer?.status !== "SCORED") continue;
      byMode[session.mode] ??= { total: 0, count: 0 };
      byMode[session.mode].total += question.answer.score;
      byMode[session.mode].count += 1;
    }
  }

  const bestMode = Object.entries(byMode)
    .map(([mode, { total, count }]) => ({ mode, average: total / count }))
    .sort((a, b) => b.average - a.average)[0];

  return {
    total: sessions.length,
    completed: sessions.filter((s) => s.status === "COMPLETED").length,
    answered: sessions.reduce((sum, s) => sum + s.summary.answered, 0),
    averageScore,
    bestMode,
  };
}

function Dashboard() {
  const user = getStoredUser();
  const firstName = user?.fullName?.split(" ")[0] || "there";

  const [resume, setResume] = useState(null);
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    getLatestResume()
      .then((response) => setResume(response.data.resume))
      .catch((error) => console.error("LOAD RESUME ERROR:", error));

    getInterviewHistory()
      .then((response) => setSessions(response.data.sessions))
      .catch((error) => {
        console.error("HISTORY ERROR:", error);
        setSessions([]);
      });
  }, []);

  const stats = useMemo(() => (sessions ? computeStats(sessions) : null), [sessions]);
  const inProgress = sessions?.find((s) => s.status === "IN_PROGRESS");

  return (
    <div className="space-y-8 animate-slide-up">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Ready to practice for your next interview?
          </p>
        </div>
        <ButtonLink to="/interviews/new" size="lg" icon={PlusCircle}>
          New interview
        </ButtonLink>
      </header>

      {inProgress && (
        <Link
          to={`/interviews/${inProgress.id}`}
          className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-xl"
        >
          <Sparkles className="h-6 w-6 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-semibold">You have an interview in progress</p>
            <p className="text-sm text-indigo-100">
              {inProgress.jobTitle} · {inProgress.summary.answered} answered so far
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold">
            Continue
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      )}

      <section aria-label="Your stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!stats ? (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={ClipboardList}
              label="Interviews"
              value={stats.total}
              hint={`${stats.completed} completed`}
            />
            <StatCard
              icon={MessageSquareText}
              label="Answers given"
              value={stats.answered}
              hint="Across all interviews"
              accent="from-sky-500 to-cyan-500"
            />
            <StatCard
              icon={Award}
              label="Average score"
              value={stats.averageScore !== null ? `${stats.averageScore}/10` : "–"}
              hint={stats.averageScore !== null ? "All scored answers" : "Answer a question to see it"}
              accent="from-emerald-500 to-teal-500"
            />
            <StatCard
              icon={Trophy}
              label="Strongest track"
              value={stats.bestMode ? MODE_META[stats.bestMode.mode]?.label.split(" ")[0] : "–"}
              hint={
                stats.bestMode
                  ? `${MODE_META[stats.bestMode.mode]?.label} · ${stats.bestMode.average.toFixed(1)}/10`
                  : "Not enough data yet"
              }
              accent="from-amber-500 to-orange-500"
            />
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent interviews"
            description="Pick up where you left off or review feedback."
            action={
              sessions?.length > 0 && (
                <Link to="/history" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  View all
                </Link>
              )
            }
          />
          <div className="mt-4 pb-2">
            {!sessions ? (
              <div className="space-y-3 px-6 pb-4">
                {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : sessions.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No interviews yet"
                description="Start your first mock interview to see your progress here."
                action={
                  <ButtonLink to="/interviews/new" icon={PlusCircle}>
                    Start an interview
                  </ButtonLink>
                }
              />
            ) : (
              <InterviewList sessions={sessions.slice(0, 5)} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Your resume"
            description="Questions are tailored to this resume."
          />
          <div className="p-6">
            <ResumeUploader resume={resume} onUploaded={setResume} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
