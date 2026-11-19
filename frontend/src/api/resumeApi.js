import API from "./client";

export const uploadResume = (file) => {
  const formData = new FormData();

  formData.append("resume", file);

  return API.post("/resumes/upload", formData);
};

export const getLatestResume = () => {
  return API.get("/resumes/latest");
};
