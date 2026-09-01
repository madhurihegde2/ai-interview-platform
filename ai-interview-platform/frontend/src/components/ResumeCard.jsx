function ResumeCard({
  isUploading,
  uploadMessage,
  uploadError,
  uploadedFileName,
  onUploadClick,
  fileInputRef,
  onFileChange,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold">Resume</h2>

      <p className="mt-2 text-gray-600">
        Upload your latest PDF resume.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={onFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={onUploadClick}
        disabled={isUploading}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload Resume"}
      </button>

      {uploadedFileName && (
        <p className="mt-3 text-sm text-green-600">
          Current Resume: {uploadedFileName}
        </p>
      )}

      {uploadMessage && (
        <p className="mt-2 text-sm text-green-600">
          {uploadMessage}
        </p>
      )}

      {uploadError && (
        <p className="mt-2 text-sm text-red-600">
          {uploadError}
        </p>
      )}
    </div>
  );
}

export default ResumeCard;