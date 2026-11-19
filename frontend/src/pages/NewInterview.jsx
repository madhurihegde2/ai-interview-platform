import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Check,
  FileText,
  Play,
  UploadCloud,
} from "lucide-react";

import Card from "../components/ui/Card";
import Button, { ButtonLink } from "../components/ui/Button";
import { EmptyState, Skeleton, Spinner } from "../components/ui/Feedback";
import { Input, Label, Textarea } from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { getLatestResume } from "../api/resumeApi";
import { createInterview, getInterviewOptions } from "../api/interviewApi";
import { useToast } from "../context/toast";
import { DIFFICULTY_META, MODE_META } from "../utils/interviewLabels";

const PREPARING_STEPS = [
  "Reading your resume",
  "Generating role-specific questions",
  "Indexing your resume for follow-ups",
];

function StepHeading({ number, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
        {number}
      </span>
      <div>
        <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
    </div>
  );
}

function PreparingOverlay() {
  const [step, setStep] = useState(0);

  // Advance the checklist while the server works; the last step stays active
  useEffect(() => {
    const timer = setInterval(
      () => setStep((current) => Math.min(current + 1, PREPARING_STEPS.length - 1)),
      1600
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-sm p-8 text-center animate-slide-up" role="status" aria-live="polite">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
          <BrainCircuit className="h-7 w-7 animate-pulse" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
          Preparing your interview
        </h2>
        <ul className="mt-6 space-y-3 text-left">
          {PREPARING_STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              {i < step ? (
                <Check className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              ) : i === step ? (
                <Spinner className="h-5 w-5" />
              ) : (
                <span className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700" aria-hidden="true" />
              )}
              <span className={i <= step ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                {label}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function NewInterview() {
  const navigate = useNavigate();
  const toast = useToast();

  const [options, setOptions] = useState(null);
  const [resume, setResume] = useState(undefined);
  const [form, setForm] = useState({
    mode: "",
    difficulty: "",
    jobTitle: "",
    jobDescription: "",
  });
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    getInterviewOptions()
      .then((response) => {
        setOptions(response.data);
        setForm((current) => ({
          ...current,
          mode: current.mode || response.data.defaults.mode,
          difficulty: current.difficulty || response.data.defaults.difficulty,
        }));
      })
      .catch(() => toast.error("Could not load interview options. Please refresh."));

    getLatestResume()
      .then((response) => setResume(response.data.resume))
      .catch(() => setResume(null));
  }, [toast]);

  const update = (changes) => setForm((current) => ({ ...current, ...changes }));

  const descriptionLength = form.jobDescription.trim().length;
  const descriptionTooShort = descriptionLength > 0 && descriptionLength < 50;
  const selectedMode = MODE_META[form.mode];
  const selectedDifficulty = DIFFICULTY_META[form.difficulty];

  async function handleStart() {
    try {
      setIsStarting(true);

      const response = await createInterview({
        resumeId: resume.id,
        mode: form.mode,
        difficulty: form.difficulty,
        jobTitle: form.jobTitle.trim(),
        jobDescription: form.jobDescription.trim(),
      });

      navigate(`/interviews/${response.data.session.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to start the interview.");
      setIsStarting(false);
    }
  }

  if (resume === undefined || !options) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <Card className="mx-auto max-w-lg animate-slide-up">
        <EmptyState
          icon={UploadCloud}
          title="Upload your resume first"
          description="Questions are generated from your resume, so add it on the dashboard before starting an interview."
          action={<ButtonLink to="/dashboard">Go to dashboard</ButtonLink>}
        />
      </Card>
    );
  }

  return (
    <div className="animate-slide-up">
      {isStarting && <PreparingOverlay />}

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          New mock interview
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Choose your track and difficulty. Adding the job description makes questions even more targeted.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <StepHeading number={1} title="Interview track" description="What role are you preparing for?" />
            <div className="grid gap-3 sm:grid-cols-2">
              {options.modes.map((mode) => {
                const meta = MODE_META[mode.id];
                const Icon = meta.icon;
                const selected = form.mode === mode.id;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => update({ mode: mode.id })}
                    aria-pressed={selected}
                    className={`relative flex gap-3 rounded-xl p-4 text-left ring-1 transition ${
                      selected
                        ? "bg-indigo-50 ring-2 ring-indigo-600 dark:bg-indigo-500/10 dark:ring-indigo-500"
                        : "ring-slate-200 hover:ring-slate-300 dark:ring-slate-700 dark:hover:ring-slate-600"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.color} text-white`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{mode.label}</p>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{mode.description}</p>
                    </div>
                    {selected && (
                      <Check className="absolute right-3 top-3 h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <StepHeading number={2} title="Difficulty" description="Questions and scoring are calibrated to this level." />
            <div className="grid gap-3 sm:grid-cols-3">
              {options.difficulties.map((level) => {
                const meta = DIFFICULTY_META[level.id];
                const selected = form.difficulty === level.id;

                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => update({ difficulty: level.id })}
                    aria-pressed={selected}
                    className={`rounded-xl p-4 text-left ring-1 transition ${
                      selected
                        ? "bg-indigo-50 ring-2 ring-indigo-600 dark:bg-indigo-500/10 dark:ring-indigo-500"
                        : "ring-slate-200 hover:ring-slate-300 dark:ring-slate-700 dark:hover:ring-slate-600"
                    }`}
                  >
                    <Badge color={meta.badge}>{meta.label}</Badge>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{meta.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <StepHeading number={3} title="Job details" description="Optional, but recommended for the most relevant questions." />
            <div>
              <Label htmlFor="job-title" optional="optional">Job title</Label>
              <Input
                id="job-title"
                value={form.jobTitle}
                onChange={(event) => update({ jobTitle: event.target.value })}
                placeholder={selectedMode?.label}
              />
            </div>
            <div>
              <Label htmlFor="job-description" optional="optional">Job description</Label>
              <Textarea
                id="job-description"
                rows={7}
                value={form.jobDescription}
                onChange={(event) => update({ jobDescription: event.target.value })}
                placeholder="Paste the full job posting here"
              />
              <p className={`mt-1.5 text-xs ${descriptionTooShort ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                {descriptionTooShort
                  ? `Paste the full posting (at least 50 characters) or leave it empty · ${descriptionLength}/50`
                  : descriptionLength > 0
                    ? `${descriptionLength.toLocaleString()} characters`
                    : "Leave empty to practice the track's core topics"}
              </p>
            </div>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-10 lg:self-start">
          <Card className="p-6">
            <h2 className="font-semibold text-slate-900 dark:text-white">Summary</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Track</dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-white">{selectedMode?.label}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Difficulty</dt>
                <dd className="mt-1">
                  {selectedDifficulty && <Badge color={selectedDifficulty.badge}>{selectedDifficulty.label}</Badge>}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Resume</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
                  <FileText className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                  <span className="truncate">{resume.originalName}</span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Job description</dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-white">
                  {descriptionLength >= 50 ? "Included" : "Not included"}
                </dd>
              </div>
            </dl>

            <Button
              size="lg"
              className="mt-6 w-full"
              icon={Play}
              onClick={handleStart}
              disabled={descriptionTooShort || isStarting}
            >
              Start interview
            </Button>
            <p className="mt-3 text-center text-xs text-slate-400">
              5 questions plus tailored follow-ups
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default NewInterview;
