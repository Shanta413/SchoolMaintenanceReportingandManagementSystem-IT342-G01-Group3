import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CitfixLogo from "../components/CitfixLogo";
import "../css/AuthPage.css";
import useAuthToken from "../api/useAuthToken";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validating, setValidating] = useState(true);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useAuthToken();

  useEffect(() => {
    document.body.classList.add("auth-page");
    document.documentElement.classList.remove("dark");

    return () => document.body.classList.remove("auth-page");
  }, []);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");

      if (!token || !role) {
        setValidating(false);
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        // 🔥 UPDATED FOR RAILWAY
        const response = await fetch(
          "https://backend-production-4aa1.up.railway.app/api/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log("Token validated successfully");

          if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
            navigate("/staff/dashboard", { replace: true });
          } else {
            navigate("/buildings", { replace: true });
          }
        } else {
          console.log("Invalid token, clearing session");
          localStorage.clear();
          setValidating(false);
        }
      } catch (error) {
        console.log("Error validating token:", error.message);
        localStorage.clear();
        setValidating(false);
      }
    };

    validateToken();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔥 UPDATED FOR RAILWAY
      const res = await fetch(
        "https://backend-production-4aa1.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);

      const userObject = {
        id: data.id || data.userId,
        email: data.email,
        fullname: data.fullname || data.username,
        avatarUrl: data.avatarUrl || data.avatar_url || null,
      };

      localStorage.setItem("user", JSON.stringify(userObject));

      if (data.role === "ADMIN" || data.role === "MAINTENANCE_STAFF") {
        navigate("/staff/dashboard");
      } else {
        navigate("/buildings");
      }
    } catch (err) {
      console.error("Login error:", err);
      showToast("Login failed. Please check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 UPDATED FOR RAILWAY
  const handleGoogleLogin = () => {
    window.location.href =
      "https://backend-production-4aa1.up.railway.app/oauth2/authorization/google";
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div
          className="auth-background"
          style={{ backgroundImage: `url(/loginpic.jpg)` }}
        />
        <div className="auth-overlay" />
        <div className="auth-card-wrapper">
          <div className="auth-card" style={{ textAlign: "center", padding: "3rem" }}>
            <CitfixLogo size="lg" />
            <div style={{ marginTop: "2rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #e0e0e0",
                  borderTop: "4px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ marginTop: "1rem", color: "#666" }}>Validating session...</p>
            </div>

            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div
        className="auth-background"
        style={{ backgroundImage: `url(/loginpic.jpg)` }}
      />
      <div className="auth-overlay" />

      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <CitfixLogo size="lg" />
            <p className="auth-subtitle">Report and track campus issues</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                className="form-input"
                placeholder="Enter your email"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Logging in..." : "Login"}
            </button>

            <button type="button" className="btn btn-outline" onClick={handleGoogleLogin}>
              Continue with Google
            </button>
          </form>

          <div className="auth-footer-text">
            Don't have an account? <a onClick={handleRegisterClick}>Register</a>
          </div>
        </div>
      </div>
    </div>
  );
}
