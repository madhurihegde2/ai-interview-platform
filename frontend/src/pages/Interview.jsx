import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CornerDownRight,
  FileText,
  Flag,
  PartyPopper,
  PlusCircle,
  Send,
} from "lucide-react";

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button, { ButtonLink } from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import ScoreRing from "../components/ui/ScoreRing";
import { EmptyState, ProgressBar, Skeleton } from "../components/ui/Feedback";
import { Textarea } from "../components/ui/Input";
import AnswerEvaluation from "../components/AnswerEvaluation";
import { getInterview, submitAnswer, completeInterview } from "../api/interviewApi";
import { useToast } from "../context/toast";
import { DIFFICULTY_META, MODE_META } from "../utils/interviewLabels";

const POLL_INTERVAL_MS = 2000;
const MAX_ANSWER_LENGTH = 5000;
const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

// Drafts survive a page refresh; storage may be unavailable, so never throw
const draftKey = (questionId) => `answer-draft:${questionId}`;
function readDraft(questionId) {
  try {
    return localStorage.getItem(draftKey(questionId)) || "";
  } catch {
    return "";
  }
}
function writeDraft(questionId, text) {
  try {
    if (text) localStorage.setItem(draftKey(questionId), text);
    else localStorage.removeItem(draftKey(questionId));
  } catch {
    // ignore
  }
}

function AnsweredQuestion({ question, index }) {
  const [open, setOpen] = useState(question.answer.status !== "SCORED");
  const { answer } = question;

  return (
    <li className={question.isFollowUp ? "ml-6" : ""}>
      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          {answer.status === "PENDING" ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" aria-label="Scoring" />
            </div>
          ) : (
            <ScoreRing score={answer.score} size="sm" />
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              {question.isFollowUp ? (
                <>
                  <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" /> Follow-up
                </>
              ) : (
                `Question ${index} · ${question.category}`
              )}
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-white">{question.question}</p>
          </div>
        </button>

        {open && (
          <div className="border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your answer</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{answer.text}</p>
            <AnswerEvaluation answer={answer} />
          </div>
        )}
      </Card>
    </li>
  );
}

function Interview() {
  const { id } = useParams();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const textareaRef = useRef(null);

  const loadSession = useCallback(async () => {
    try {
      const response = await getInterview(id);
      setSession(response.data.session);
      setLoadError("");
    } catch (error) {
      setLoadError(error.response?.data?.message || "Could not load this interview.");
    }
  }, [id]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Scores arrive asynchronously from the Kafka worker; poll while any are pending
  const pending = session?.summary.pending ?? 0;

  useEffect(() => {
    if (pending === 0) return undefined;
    const timer = setInterval(loadSession, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pending, loadSession]);

  const currentQuestion = session?.questions.find((q) => q.id === session.currentQuestionId);
  const currentId = currentQuestion?.id;

  // Restore the draft for the current question and focus the editor
  useEffect(() => {
    if (!currentId) return;
    setAnswerText(readDraft(currentId));
    textareaRef.current?.focus();
  }, [currentId]);

  function handleChange(event) {
    setAnswerText(event.target.value);
    writeDraft(currentId, event.target.value);
  }

  async function handleSubmit(event) {
    event?.preventDefault();
    const text = answerText.trim();
    if (!text || !currentQuestion || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await submitAnswer(id, currentQuestion.id, text);
      writeDraft(currentQuestion.id, "");
      setSession(response.data.session);
      setAnswerText("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit your answer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEnd() {
    setConfirmEnd(false);
    try {
      const response = await completeInterview(id);
      setSession(response.data.session);
      toast.info("Interview ended.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not end the interview.");
    }
  }

  if (loadError) {
    return (
      <Card className="mx-auto max-w-lg">
        <EmptyState
          icon={Flag}
          title="Interview not available"
          description={loadError}
          action={<ButtonLink to="/dashboard" variant="secondary">Back to dashboard</ButtonLink>}
        />
      </Card>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  const mode = MODE_META[session.mode] || MODE_META.SOFTWARE_ENGINEER;
  const difficulty = DIFFICULTY_META[session.difficulty];
  const mainQuestions = session.questions.filter((q) => !q.isFollowUp);
  const answeredMain = mainQuestions.filter((q) => q.answer).length;
  const answered = session.questions.filter((q) => q.answer);
  const isComplete = session.status === "COMPLETED" || !currentQuestion;
  const currentMainIndex = currentQuestion
    ? mainQuestions.findIndex((q) => q.position === currentQuestion.position) + 1
    : mainQuestions.length;
  const progress = isComplete ? 100 : (answeredMain / mainQuestions.length) * 100;
  const ModeIcon = mode.icon;

  // Number main questions for the answer timeline
  let mainCounter = 0;
  const numbered = answered.map((question) => ({
    question,
    index: question.isFollowUp ? null : ++mainCounter,
  }));

  return (
    <div className="animate-slide-up">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Dashboard
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${mode.color} text-white shadow-sm sm:flex`}>
            <ModeIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {session.jobTitle || mode.label}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge color="indigo">{mode.label}</Badge>
              {difficulty && <Badge color={difficulty.badge}>{difficulty.label}</Badge>}
              <span className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                {session.resume.originalName}
              </span>
            </div>
          </div>
        </div>

        {!isComplete && (
          <Button variant="secondary" icon={Flag} onClick={() => setConfirmEnd(true)}>
            End interview
          </Button>
        )}
      </header>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {isComplete ? "Interview complete" : `Question ${currentMainIndex} of ${mainQuestions.length}`}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>

      {isComplete ? (
        <Card className="mt-8 overflow-hidden">
          <div className="flex flex-col items-center gap-6 bg-gradient-to-br from-indigo-50 to-violet-50 p-8 text-center sm:flex-row sm:text-left dark:from-indigo-500/10 dark:to-violet-500/10">
            <ScoreRing
              score={session.summary.averageScore}
              size="lg"
              label={session.summary.averageScore !== null ? `Average score ${session.summary.averageScore} out of 10` : "No scores yet"}
            />
            <div className="flex-1">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 sm:justify-start dark:text-white">
                <PartyPopper className="h-6 w-6 text-indigo-500" aria-hidden="true" />
                Interview complete
              </h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                You answered {session.summary.answered} question{session.summary.answered === 1 ? "" : "s"}
                {session.summary.averageScore !== null && <> with an average score of <strong>{session.summary.averageScore}/10</strong></>}.
                {session.summary.pending > 0 && " Some answers are still being scored..."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                <ButtonLink to="/interviews/new" icon={PlusCircle}>Start another</ButtonLink>
                <ButtonLink to="/dashboard" variant="secondary">Back to dashboard</ButtonLink>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="mt-8 p-6 sm:p-8" key={currentQuestion.id}>
          <div className="flex flex-wrap items-center gap-2 animate-fade-in">
            {currentQuestion.isFollowUp ? (
              <Badge color="purple" icon={CornerDownRight}>Follow-up on your answer</Badge>
            ) : (
              <Badge color="gray">{currentQuestion.category}</Badge>
            )}
          </div>
          <p className="mt-4 text-xl font-semibold leading-relaxed text-slate-900 animate-slide-up sm:text-2xl dark:text-white">
            {currentQuestion.question}
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="answer" className="sr-only">Your answer</label>
            <Textarea
              id="answer"
              ref={textareaRef}
              value={answerText}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) handleSubmit(event);
              }}
              rows={8}
              maxLength={MAX_ANSWER_LENGTH}
              placeholder="Answer as you would out loud: give context, what you did, and the result."
              disabled={isSubmitting}
            />
            <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                {answerText.length.toLocaleString()} / {MAX_ANSWER_LENGTH.toLocaleString()} ·{" "}
                <kbd className="rounded border border-slate-300 px-1 font-sans dark:border-slate-600">{isMac ? "⌘" : "Ctrl"}</kbd>
                {" + "}
                <kbd className="rounded border border-slate-300 px-1 font-sans dark:border-slate-600">Enter</kbd> to submit · draft saved automatically
              </p>
              <Button type="submit" icon={Send} loading={isSubmitting} disabled={!answerText.trim()}>
                {isSubmitting ? "Submitting..." : "Submit answer"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {answered.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your answers</h2>
            {session.summary.pending > 0 && (
              <span className="text-sm text-indigo-600 dark:text-indigo-400">
                Scoring {session.summary.pending} answer{session.summary.pending === 1 ? "" : "s"}...
              </span>
            )}
          </div>
          <ol className="space-y-3">
            {numbered
              .slice()
              .reverse()
              .map(({ question, index }) => (
                <AnsweredQuestion key={question.id} question={question} index={index} />
              ))}
          </ol>
        </section>
      )}

      <Modal
        open={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        title="End this interview?"
        description="You won't be able to answer the remaining questions. Answers you've already submitted will still be scored."
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmEnd(false)}>Keep going</Button>
            <Button variant="danger" onClick={handleEnd}>End interview</Button>
          </>
        }
      />
    </div>
  );
}

export default Interview;
