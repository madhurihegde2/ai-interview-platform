function StartInterviewCard({
  hasResume,
  jobTitle,
  jobDescription,
  onJobTitleChange,
  onJobDescriptionChange,
  onStart,
  isStarting,
  error,
}) {
  const canStart =
    hasResume && jobTitle.trim() && jobDescription.trim().length >= 50;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold">Mock Interview</h2>

      <p className="mt-2 text-gray-600">
        Paste the job you&apos;re applying for. Questions are generated from
        your resume and this job description.
      </p>

      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <input
          type="text"
          value={jobTitle}
          onChange={(event) => onJobTitleChange(event.target.value)}
          placeholder="Job title, e.g. Backend Engineer"
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          value={jobDescription}
          onChange={(event) => onJobDescriptionChange(event.target.value)}
          placeholder="Paste the full job description"
          rows={6}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {!hasResume && (
          <p className="text-sm text-gray-500">
            Upload your resume first.
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!canStart || isStarting}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStarting
            ? "Preparing your interview..."
            : "Start Mock Interview"}
        </button>
      </form>
    </div>
  );
}

export default StartInterviewCard;
