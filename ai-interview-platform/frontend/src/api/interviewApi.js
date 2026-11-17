import API from "./client";

export const getInterviewOptions = () => {
  return API.get("/interviews/options");
};

export const createInterview = ({
  resumeId,
  mode,
  difficulty,
  jobTitle,
  jobDescription,
}) => {
  return API.post("/interviews", {
    resumeId,
    mode,
    difficulty,
    jobTitle,
    jobDescription,
  });
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
