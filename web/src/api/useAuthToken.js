import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useAuthToken() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role  = params.get("role"); // <-- from backend

    if (token) {
      localStorage.setItem("authToken", token);
      if (role) localStorage.setItem("userRole", role);

      // clean URL
      window.history.replaceState({}, "", "/login");

      // redirect by role
      if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
        navigate("/staff/dashboard");
      } else {
        navigate("/buildings");
      }
    }
  }, [navigate]);
}
