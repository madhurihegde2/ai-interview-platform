function AIQuestionCard({
  questions,
  isGenerating,
  onGenerateInterview,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold">
        AI Questions
      </h2>

      <p className="mt-2 text-gray-600">
        Generate interview questions.
      </p>

      <button
        type="button"
        onClick={onGenerateInterview}
        disabled={isGenerating}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {isGenerating
          ? "Generating..."
          : "Generate Interview"}
      </button>

      {questions.length > 0 && (
        <div className="mt-5 space-y-3">
          {questions.map((question) => (
            <div
              key={question.id}
              className="border rounded-lg p-3"
            >
              <p className="font-medium">
                {question.question}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {question.category} • {question.difficulty}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AIQuestionCard;