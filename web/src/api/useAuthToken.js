import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthToken() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");  // ⭐ ADD THIS LINE

    if (!token) return;

    // Save token AND role immediately
    localStorage.setItem("authToken", token);
    if (role) {
      localStorage.setItem("userRole", role);  // ⭐ ADD THIS LINE
    }

    // Clean URL so token is not visible
    window.history.replaceState({}, "", "/login");

    /** 
     * Fetch user profile using the token 
     */
    fetch("https://backend-production-4aa1.up.railway.app/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load user profile");
        return res.json();
      })
      .then(user => {
        console.log("Google login user:", user);

        // Store full user object
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role (use the role from URL if available)
        const userRole = role || user.role;
        if (userRole === "ADMIN" || userRole === "MAINTENANCE_STAFF") {
          navigate("/staff/dashboard");
        } else {
          navigate("/buildings");
        }
      })
      .catch(err => {
        console.error("Google OAuth profile fetch failed:", err);
        alert("Google login failed. Please try again.");
      });

  }, [navigate]);
}