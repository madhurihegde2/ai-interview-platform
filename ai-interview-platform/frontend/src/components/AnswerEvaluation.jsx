function AnswerEvaluation({ answer }) {
  if (answer.status === "PENDING") {
    return (
      <p className="mt-2 text-sm text-gray-500 animate-pulse">
        Scoring your answer...
      </p>
    );
  }

  if (answer.status === "FAILED") {
    return (
      <p className="mt-2 text-sm text-red-600">
        {answer.feedback || "This answer could not be scored."}
      </p>
    );
  }

  const scoreColor =
    answer.score >= 8
      ? "bg-green-100 text-green-800"
      : answer.score >= 5
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <div className="mt-3 space-y-2">
      <span
        className={`inline-block text-sm font-semibold px-2 py-1 rounded ${scoreColor}`}
      >
        Score: {answer.score}/10
      </span>

      {answer.feedback && (
        <p className="text-sm text-gray-700">{answer.feedback}</p>
      )}

      {answer.strengths?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-green-700">Strengths</p>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {answer.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {answer.improvements?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-orange-700">To improve</p>
          <ul className="list-disc ml-5 text-sm text-gray-700">
            {answer.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AnswerEvaluation;
