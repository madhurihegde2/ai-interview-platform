import API from "./client";

export const createInterview = ({ resumeId, jobTitle, jobDescription }) => {
  return API.post("/interviews", { resumeId, jobTitle, jobDescription });
};

export const getInterviewHistory = () => {
  return API.get("/interviews");
};

export const getInterview = (id) => {
  return API.get(`/interviews/${id}`);
};

export const submitAnswer = (id, questionId, answer) => {
  return API.post(`/interviews/${id}/questions/${questionId}/answer`, {
    answer,
  });
};

export const completeInterview = (id) => {
  return API.post(`/interviews/${id}/complete`);
};
