import axios from "axios";

const BASE_URL = "https://backend-production-4aa1.up.railway.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ====================================================
// REQUEST INTERCEPTOR
// ====================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    // Logging request details
    console.log("📤 API Request:", {
      url: config.baseURL + config.url,
      method: config.method,
      hasToken: !!token,
      headers: config.headers,
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found in localStorage!");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// ====================================================
// RESPONSE INTERCEPTOR
// ====================================================
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response) {
      // 401 Unauthorized → Session expired
      if (error.response.status === 401) {
        console.warn("⚠️ 401 Unauthorized - Clearing auth and redirecting to login");

        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      // 403 Forbidden
      if (error.response.status === 403) {
        console.error("⛔ 403 Forbidden - Access denied");
        alert("Access denied. You do not have permission to perform this action.");
      }
    } else if (error.request) {
      console.error("🌐 Network error - No response from server");
      alert("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
