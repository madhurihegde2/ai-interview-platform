import { Link } from "react-router-dom";

import { MODE_LABELS, DIFFICULTY_LABELS } from "../utils/interviewLabels";

function InterviewHistoryCard({ history }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold">Interview History</h2>

      {history.length === 0 ? (
        <p className="text-gray-500 mt-3">No interviews yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {history.map((session) => (
            <Link
              key={session.id}
              to={`/interviews/${session.id}`}
              className="block border rounded-lg p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start gap-3">
                <p className="font-semibold">
                  {session.jobTitle || `Interview #${session.id}`}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                    session.status === "COMPLETED"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {session.status === "COMPLETED" ? "Completed" : "In progress"}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {MODE_LABELS[session.mode]} •{" "}
                {DIFFICULTY_LABELS[session.difficulty]} •{" "}
                {new Date(session.createdAt).toLocaleDateString()} •{" "}
                {session.summary.answered} answered
                {session.summary.averageScore !== null &&
                  ` • Avg score ${session.summary.averageScore}/10`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewHistoryCard;
