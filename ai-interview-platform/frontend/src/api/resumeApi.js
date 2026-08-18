import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

export const uploadResume = (file) => {
  const formData = new FormData();

  formData.append("resume", file);

  const token = localStorage.getItem("token");

  return API.post("/resumes/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};