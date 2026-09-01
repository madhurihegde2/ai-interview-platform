function InterviewHistoryCard({ history }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold">
        Interview History
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500 mt-3">
          No interviews yet.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {history.map((session) => (
            <div
              key={session.id}
              className="border rounded-lg p-3"
            >
              <p className="font-semibold">
                Interview #{session.id}
              </p>

              <p className="text-sm text-gray-500">
                Resume: {session.resume.originalName}
              </p>

              <p className="text-sm text-gray-500">
                Questions: {session.questions.length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewHistoryCard;