function StartInterviewCard({
  options,
  hasResume,
  form,
  onChange,
  onStart,
  isStarting,
  error,
}) {
  const { mode, difficulty, jobTitle, jobDescription } = form;
  const selectedMode = options?.modes.find((m) => m.id === mode);
  const descriptionTooShort =
    jobDescription.trim().length > 0 && jobDescription.trim().length < 50;
  const canStart = hasResume && options && !descriptionTooShort;

  return (
    <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
      <h2 className="text-xl font-bold">Mock Interview</h2>

      <p className="mt-2 text-gray-600">
        Pick an interview track and difficulty. Questions are tailored to your
        resume, and to the job description if you add one.
      </p>

      {!options ? (
        <p className="mt-4 text-sm text-gray-500">Loading interview options...</p>
      ) : (
        <form
          className="mt-5 space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onStart();
          }}
        >
          <fieldset>
            <legend className="font-medium mb-2">Interview track</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.modes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChange({ mode: option.id })}
                  aria-pressed={mode === option.id}
                  className={`text-left border rounded-lg p-3 transition ${
                    mode === option.id
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-medium mb-2">Difficulty</legend>
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              {options.difficulties.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onChange({ difficulty: option.id })}
                  aria-pressed={difficulty === option.id}
                  className={`px-4 py-2 text-sm ${
                    difficulty === option.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label className="block font-medium mb-1" htmlFor="job-title">
              Job title <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(event) => onChange({ jobTitle: event.target.value })}
              placeholder={selectedMode?.label}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="job-description">
              Job description{" "}
              <span className="text-gray-400 font-normal">
                (optional, recommended)
              </span>
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) =>
                onChange({ jobDescription: event.target.value })
              }
              placeholder="Paste the job posting to get questions matched to it"
              rows={5}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {descriptionTooShort && (
              <p className="text-sm text-gray-500 mt-1">
                Paste the full posting (at least 50 characters) or leave it empty.
              </p>
            )}
          </div>

          {!hasResume && (
            <p className="text-sm text-gray-500">Upload your resume first.</p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canStart || isStarting}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? "Preparing your interview..." : "Start Mock Interview"}
          </button>
        </form>
      )}
    </div>
  );
}

export default StartInterviewCard;
