import API from "./client";

export const createInterview = (resumeId) => {
  return API.post("/interviews", { resumeId });
};

export const getInterviewHistory = () => {
  return API.get("/interviews");
};
