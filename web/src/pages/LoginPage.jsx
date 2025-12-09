import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CitfixLogo from "../components/CitfixLogo";
import "../css/AuthPage.css";
import api from "../api/axios"; // ← use shared axios instance
import useAuthToken from "../api/useAuthToken";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validating, setValidating] = useState(true);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useAuthToken(); // handle Google OAuth redirect flow

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole");

      if (!token || !role) {
        setValidating(false);
        return;
      }

      try {
        await api.get("/user/profile"); // 🔥 Railway backend
        console.log("Token validated successfully");

        if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
          navigate("/staff/dashboard", { replace: true });
        } else {
          navigate("/buildings", { replace: true });
        }
      } catch (error) {
        console.log("Token invalid → clearing localStorage");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");
        setValidating(false);
      }
    };

    validateToken();
  }, [navigate]);

  // Email Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);

      const userObject = {
        id: data.id || data.userId,
        email: data.email,
        fullname: data.fullname || data.username,
        avatarUrl: data.avatarUrl || null,
      };

      localStorage.setItem("user", JSON.stringify(userObject));

      if (data.role === "ADMIN" || data.role === "MAINTENANCE_STAFF") {
        navigate("/staff/dashboard");
      } else {
        navigate("/buildings");
      }
    } catch (err) {
      showToast("Login failed. Please check your credentials.", "error");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const handleGoogleLogin = () => {
    window.location.href =
      "https://backend-production-4aa1.up.railway.app/oauth2/authorization/google";
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  // Show validating overlay
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
                  border: "4px solid #ccc",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              />
              <p style={{ marginTop: "1rem", color: "#666" }}>Validating session...</p>
            </div>

            {/* spinner animation */}
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
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
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <span>OR</span>
              <div className="divider-line" />
            </div>

            <button type="button" className="btn btn-outline" onClick={handleGoogleLogin}>
              Continue with Google
            </button>
          </form>

          <div className="auth-footer-text">
            Don't have an account?{" "}
            <a href="#" onClick={handleRegisterClick} className="auth-link">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
