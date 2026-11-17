import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import AnswerEvaluation from "../components/AnswerEvaluation";

import {
  getInterview,
  submitAnswer,
  completeInterview,
} from "../api/interviewApi";

const POLL_INTERVAL_MS = 2000;

function Interview() {
  const { id } = useParams();

  const [session, setSession] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadSession = useCallback(async () => {
    try {
      const response = await getInterview(id);
      setSession(response.data.session);
      setLoadError("");
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Could not load this interview."
      );
    }
  }, [id]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Scores arrive asynchronously from the Kafka worker; poll while any are pending
  const pending = session?.summary.pending ?? 0;

  useEffect(() => {
    if (pending === 0) {
      return undefined;
    }

    const timer = setInterval(loadSession, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pending, loadSession]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!answerText.trim() || !currentQuestion) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const response = await submitAnswer(
        id,
        currentQuestion.id,
        answerText.trim()
      );

      setSession(response.data.session);
      setAnswerText("");
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Could not submit your answer."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEnd() {
    if (!window.confirm("End this interview now?")) {
      return;
    }

    try {
      const response = await completeInterview(id);
      setSession(response.data.session);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || "Could not end the interview."
      );
    }
  }

  if (loadError) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-red-600">{loadError}</p>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Back to dashboard
          </Link>
        </main>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-10 text-gray-500">
          Loading interview...
        </main>
      </>
    );
  }

  const currentQuestion = session.questions.find(
    (q) => q.id === session.currentQuestionId
  );
  const answered = session.questions.filter((q) => q.answer);
  const mainIndex = currentQuestion
    ? session.questions
        .filter((q) => !q.isFollowUp)
        .findIndex((q) => q.position === currentQuestion.position) + 1
    : 0;

  return (
    <>
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to dashboard
        </Link>

        <div className="flex justify-between items-start mt-3 gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {session.jobTitle || `Interview #${session.id}`}
            </h1>
            <p className="text-gray-500 mt-1">
              Resume: {session.resume.originalName}
            </p>
          </div>

          {session.status === "IN_PROGRESS" && (
            <button
              type="button"
              onClick={handleEnd}
              className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 shrink-0"
            >
              End interview
            </button>
          )}
        </div>

        {currentQuestion ? (
          <section className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex gap-2 items-center text-sm text-gray-500">
              <span>
                Question {mainIndex} of {session.summary.mainQuestions}
              </span>
              {currentQuestion.isFollowUp && (
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Follow-up
                </span>
              )}
              <span>
                • {currentQuestion.category}
                {currentQuestion.difficulty && ` • ${currentQuestion.difficulty}`}
              </span>
            </div>

            <p className="text-xl font-medium mt-3">
              {currentQuestion.question}
            </p>

            <form onSubmit={handleSubmit} className="mt-4">
              <textarea
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                rows={7}
                maxLength={5000}
                placeholder="Type your answer as you would say it in the interview"
                disabled={isSubmitting}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {submitError && (
                <p className="text-sm text-red-600 mt-2">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !answerText.trim()}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit answer"}
              </button>
            </form>
          </section>
        ) : (
          <section className="bg-white rounded-xl shadow p-6 mt-6">
            <h2 className="text-xl font-bold">Interview complete 🎉</h2>
            <p className="text-gray-600 mt-2">
              You answered {session.summary.answered} question
              {session.summary.answered === 1 ? "" : "s"}.
              {session.summary.averageScore !== null &&
                ` Average score: ${session.summary.averageScore}/10.`}
              {session.summary.pending > 0 &&
                " Some answers are still being scored..."}
            </p>
          </section>
        )}

        {answered.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold">Your answers</h2>

            <div className="mt-4 space-y-4">
              {answered.map((question) => (
                <div
                  key={question.id}
                  className={`bg-white rounded-xl shadow p-5 ${
                    question.isFollowUp ? "ml-6 border-l-4 border-purple-200" : ""
                  }`}
                >
                  <p className="text-sm text-gray-500">
                    {question.isFollowUp ? "Follow-up" : question.category}
                  </p>
                  <p className="font-medium mt-1">{question.question}</p>
                  <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                    {question.answer.text}
                  </p>

                  <AnswerEvaluation answer={question.answer} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default Interview;
