import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { uploadResume } from "../api/resumeApi";

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  function handleUploadButtonClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");
      setUploadMessage("");

      const response = await uploadResume(file);

      setUploadMessage(response.data.message);
      setUploadedFileName(response.data.resume.originalName);
    } catch (error) {
      setUploadError(
        error.response?.data?.message ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);

      // Allows the same PDF to be selected again if needed.
      event.target.value = "";
    }
  }

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">
              Welcome, {user?.fullName || "User"} 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Ready to practice for your next interview?
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="border border-red-500 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              Resume
            </h2>

            <p className="mt-2 text-gray-600">
              Upload your latest PDF resume.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleUploadButtonClick}
              disabled={isUploading}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </button>

            {uploadedFileName && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500">
                    Current Resume
                  </p>

                  <p className="font-medium text-green-600">
                    {uploadedFileName}
                  </p>
                </div>
              )}

            {uploadError && (
              <p className="mt-3 text-red-600">
                {uploadError}
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              AI Questions
            </h2>

            <p className="mt-2 text-gray-600">
              Generate personalized interview questions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              Mock Interview
            </h2>

            <p className="mt-2 text-gray-600">
              Practice an interview with AI.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              Interview History
            </h2>

            <p className="mt-2 text-gray-600">
              Review your previous sessions.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default Dashboard;