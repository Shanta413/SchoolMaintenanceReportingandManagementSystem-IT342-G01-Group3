// src/api/axios.js
import axios from "axios";

// ✅ Base backend URL
const BASE_URL = "http://localhost:8080/api";

// ✅ Create Axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Automatically attach JWT token for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors globally
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Session expired or unauthorized. Redirecting to login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Optionally handle 403 (forbidden)
    if (error.response && error.response.status === 403) {
      alert("Access denied. You do not have permission to perform this action.");
    }

    return Promise.reject(error);
  }
);

export default api;
