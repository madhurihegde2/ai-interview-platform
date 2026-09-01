import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const createInterview = (resumeId) => {
  const token = localStorage.getItem("token");

  return API.post(
    "/interviews",
    {
      resumeId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getInterviewHistory = () => {
  const token = localStorage.getItem("token");

  return API.get("/interviews", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};