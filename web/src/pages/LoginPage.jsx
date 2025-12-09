import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CitfixLogo from "../components/CitfixLogo";
import "../css/AuthPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // ✅ Handle OAuth callback (token in URL)
  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlRole = searchParams.get("role");

    if (urlToken && urlRole) {
      console.log("✅ OAuth login detected, storing token and redirecting...");

      localStorage.setItem("authToken", urlToken);
      localStorage.setItem("userRole", urlRole);

      // Clear URL params and redirect immediately
      if (urlRole === "ADMIN" || urlRole === "MAINTENANCE_STAFF") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/buildings", { replace: true });
      }
      return;
    }
  }, [searchParams, navigate]);

  // If user already logged in → redirect
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (token && role) {
      if (role === "ADMIN" || role === "MAINTENANCE_STAFF") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/buildings", { replace: true });
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/buildings", { replace: true });
      }
    } catch (err) {
      showToast("Login failed. Please check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://backend-production-4aa1.up.railway.app/oauth2/authorization/google";
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

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
            <div className="auth-logo-container">
              <CitfixLogo size="lg" />
            </div>
            <p className="auth-subtitle">Report and track campus issues</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text">
                <span>OR</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoogleLogin}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ flexShrink: 0 }}
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="auth-footer-text" style={{ marginTop: '1.5rem' }}>
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
