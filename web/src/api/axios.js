import axios from "axios";

// ✅ Set your actual backend URL here!
const BASE_URL = "https://backend-production-4aa1.up.railway.app/api";

// ✅ Create Axios instance with baseURL
const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Automatically attach JWT token for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set Content-Type to JSON if it's not FormData
    // Axios will automatically set the correct Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 → clear auth and send to login
      if (error.response.status === 401) {
        console.warn("⚠️ Session expired or unauthorized. Redirecting to login...");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        window.location.href = "/login";
      }
      // 403 → forbidden
      if (error.response.status === 403) {
        alert("Access denied. You do not have permission to perform this action.");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
