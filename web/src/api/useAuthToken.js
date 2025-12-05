import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthToken() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window. location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (! token) return;

    console.log("🔑 Token received:", token);
    console.log("👤 Role received:", role);

    // Save token AND role immediately
    localStorage.setItem("authToken", token);
    if (role) {
      localStorage. setItem("userRole", role);
    }

    // Clean URL so token is not visible
    window.history.replaceState({}, "", "/login");

    // 🔥 Determine API base URL (localhost vs production)
    const API_BASE_URL = import.meta.env.VITE_API_URL || 
                         (window.location.hostname === "localhost" 
                           ? "http://localhost:8080" 
                           : "https://backend-production-4aa1.up.railway.app");

    console.log("🌐 Using API URL:", API_BASE_URL);

    /** 
     * Fetch user profile using the token 
     */
    fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        console.log("📡 Response status:", res.status);
        
        if (!res.ok) {
          return res.text().then(text => {
            throw new Error(`Failed to load user profile: ${res.status} - ${text}`);
          });
        }
        
        return res.json();
      })
      .then(data => {
        console.log("✅ Google login user from API:", data);

        // 🔥 NORMALIZE THE USER OBJECT (id is UUID String)
        const userObject = {
          id: data.id,  // ⭐ UUID String from backend - CRITICAL for issue filtering
          email: data.email,
          fullname: data. fullname,
          username: data.fullname || data.email.split('@')[0], // Fallback for Header display
          role: role || data.role || "STUDENT",
          avatarUrl: data.avatarUrl || null,
          mobileNumber: data.mobileNumber || null,
          studentDepartment: data.studentDepartment || null,
          studentIdNumber: data.studentIdNumber || null,
          isActive: data.isActive,
          createdAt: data. createdAt,
          authMethod: data.authMethod
        };

        console.log("💾 Storing normalized user object:", userObject);

        // Store normalized user object
        localStorage.setItem("user", JSON.stringify(userObject));

        // Redirect based on role
        if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
          navigate("/staff/dashboard");
        } else {
          navigate("/buildings");
        }
      })
      .catch(err => {
        console.error("❌ Google OAuth profile fetch failed:", err);
        alert(`Google login failed: ${err.message}\n\nPlease try again. `);
        
        // Clear invalid data
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage. removeItem("user");
      });

  }, [navigate]);
}