import { useRef, useState } from "react";
import { FileText, RefreshCw, UploadCloud } from "lucide-react";

import Button from "./ui/Button";
import { Spinner } from "./ui/Feedback";
import { uploadResume } from "../api/resumeApi";
import { useToast } from "../context/toast";
import { formatDate } from "../utils/session";

const MAX_BYTES = 5 * 1024 * 1024;

function ResumeUploader({ resume, onUploaded }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF file.");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("That file is larger than 5 MB.");
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadResume(file);
      onUploaded(response.data.resume);
      toast.success("Resume uploaded and processed.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Resume upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept=".pdf,application/pdf"
      className="hidden"
      onChange={(event) => handleFile(event.target.files?.[0])}
    />
  );

  if (resume && !isUploading) {
    return (
      <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:ring-slate-700">
        {fileInput}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
            {resume.originalName}
          </p>
          {resume.uploadedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uploaded {formatDate(resume.uploadedAt)}
            </p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={() => inputRef.current?.click()}
        >
          Replace
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !isUploading && inputRef.current?.click()}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !isUploading) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${
        isDragging
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
          : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-slate-800/50"
      }`}
    >
      {fileInput}
      {isUploading ? (
        <>
          <Spinner className="h-8 w-8" />
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            Uploading and reading your resume...
          </p>
        </>
      ) : (
        <>
          <UploadCloud className="h-10 w-10 text-indigo-500" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            Drop your resume here, or click to browse
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            PDF only, up to 5 MB
          </p>
        </>
      )}
    </div>
  );
}

export default ResumeUploader;
