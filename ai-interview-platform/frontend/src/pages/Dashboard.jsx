import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import ResumeCard from "../components/ResumeCard";
import AIQuestionCard from "../components/AIQuestionCard";
import MockInterviewCard from "../components/MockInterviewCard";
import InterviewHistoryCard from "../components/InterviewHistoryCard";

import { uploadResume, getLatestResume } from "../api/resumeApi";
import { clearSession } from "../api/client";
import {
  createInterview,
  getInterviewHistory,
} from "../api/interviewApi";

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [resumeId, setResumeId] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [history, setHistory] = useState([]);

  function handleLogout() {
    clearSession();

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
      setResumeId(response.data.resume.id);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      setUploadError(
        error.response?.data?.message ||
          "Resume upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);

      event.target.value = "";
    }
  }

  async function handleGenerateInterview() {
    if (!resumeId) {
      alert("Please upload a resume first.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await createInterview(resumeId);

      console.log("INTERVIEW RESPONSE:", response.data);

      setQuestions(response.data.session.questions);

      loadInterviewHistory();
    } catch (error) {
      console.error("GENERATE INTERVIEW ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to generate interview."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function loadInterviewHistory() {
    try {
      const response = await getInterviewHistory();

      setHistory(response.data.sessions);
    } catch (error) {
      console.error("HISTORY ERROR:", error);
    }
  }

  async function loadLatestResume() {
    try {
      const response = await getLatestResume();
      const resume = response.data.resume;

      if (resume) {
        setResumeId(resume.id);
        setUploadedFileName(resume.originalName);
      }
    } catch (error) {
      console.error("LOAD RESUME ERROR:", error);
    }
  }

  useEffect(() => {
    loadLatestResume();
    loadInterviewHistory();
  }, []);

  return (
    <>
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
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

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

          <ResumeCard
            isUploading={isUploading}
            uploadMessage={uploadMessage}
            uploadError={uploadError}
            uploadedFileName={uploadedFileName}
            onUploadClick={handleUploadButtonClick}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />

          <AIQuestionCard
            questions={questions}
            isGenerating={isGenerating}
            onGenerateInterview={handleGenerateInterview}
          />

          <MockInterviewCard />

          <InterviewHistoryCard
            history={history}
          />

        </div>
      </main>
    </>
  );
}

export default Dashboard;