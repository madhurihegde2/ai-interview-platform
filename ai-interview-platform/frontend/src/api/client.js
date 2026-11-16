import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:3001/api",
});

// Attach the JWT to every request when the user is logged in
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// A 401 on an authenticated request means the token is missing or expired:
// clear the session and send the user back to the login page.
// (Login itself also returns 401 for a wrong password; that must not redirect.)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.Authorization);

    if (error.response?.status === 401 && sentToken) {
      clearSession();
      window.location.assign("/?expired=1");
    }

    return Promise.reject(error);
  }
);

export default API;
