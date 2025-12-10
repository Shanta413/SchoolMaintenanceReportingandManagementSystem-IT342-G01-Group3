import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT = 1 * 60 * 1000; // 1 minute in milliseconds (for testing)
const SESSION_EXPIRED_FLAG = "sessionExpiredModalShowing"; // Flag to track if modal is showing

export default function useInactivityLogout(onlyForRole = "STUDENT") {
  const navigate = useNavigate();
  const timer = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check dark mode on mount and listen for changes
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Check on mount if modal was showing before refresh
  useEffect(() => {
    const wasModalShowing = sessionStorage.getItem(SESSION_EXPIRED_FLAG);

    if (wasModalShowing === "true") {
      console.log("🔄 Page refreshed while modal was showing - clearing token and redirecting");

      sessionStorage.removeItem(SESSION_EXPIRED_FLAG);

      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
      return;
    }
  }, [navigate]);

  // Main inactivity logic
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (!token || role !== onlyForRole) return;

    const handleInactivity = () => {
      console.log("🔒 Inactivity detected - showing modal");
      sessionStorage.setItem(SESSION_EXPIRED_FLAG, "true");
      setShowModal(true);

      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };

    const resetTimer = () => {
      if (showModal) return;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(handleInactivity, INACTIVITY_LIMIT);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [onlyForRole, showModal]);

  // Handle back/forward button ONLY when modal is showing
  useEffect(() => {
    if (showModal) {
      const handlePopState = () => {
        console.log("🔙 Back/Forward button pressed while modal showing - clearing token");

        sessionStorage.removeItem(SESSION_EXPIRED_FLAG);

        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      };

      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [showModal, navigate]);

  // Handler for login redirect - clear storage when button is clicked
  const handleLoginRedirect = () => {
    console.log("🔵 Login Again button clicked - clearing session and navigating");

    sessionStorage.removeItem(SESSION_EXPIRED_FLAG);

    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");

    setShowModal(false);

    navigate("/login", { replace: true });
  };

  // Modal component with dark mode support
  const InactivityModal = showModal ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        pointerEvents: "auto"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          backgroundColor: isDarkMode ? "#1e293b" : "white",
          padding: "40px",
          borderRadius: "12px",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: isDarkMode 
            ? "0 10px 25px rgba(0, 0, 0, 0.5)" 
            : "0 10px 25px rgba(0, 0, 0, 0.2)",
          pointerEvents: "auto",
          border: isDarkMode ? "1px solid #334155" : "none"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            margin: "0 auto 20px",
            borderRadius: "50%",
            backgroundColor: isDarkMode ? "#3b1f1f" : "#fee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "32px"
          }}
        >
          ⏱️
        </div>

        <h2
          style={{
            marginBottom: "15px",
            color: isDarkMode ? "#f1f5f9" : "#333",
            fontSize: "24px",
            fontWeight: "600"
          }}
        >
          Session Expired
        </h2>

        <p
          style={{
            marginBottom: "30px",
            color: isDarkMode ? "#94a3b8" : "#666",
            fontSize: "16px",
            lineHeight: "1.5"
          }}
        >
          You have been inactive for a while. Please log in again to continue.
        </p>

        <button
          type="button"
          onClick={handleLoginRedirect}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            padding: "12px 32px",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s",
            width: "100%"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3b82f6";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Login Again
        </button>
      </div>
    </div>
  ) : null;

  return { InactivityModal };
}