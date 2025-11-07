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
  useAuthToken(); // ✅ Google OAuth token handler

  // 🟢 If already logged in, redirect by role
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    if (token && role) {
      if (role === "ADMIN") navigate("/staff/dashboard");
      else navigate("/buildings");
    }
  }, [navigate]);

  // 🧩 Handle login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();

      // ✅ Store auth info
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role);

      // ✅ Redirect by role
      if (data.role === "ADMIN") navigate("/staff/dashboard");
      else navigate("/buildings");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    navigate("/register");
  };

  return (
    <div className="auth-container">
      <div className="auth-background" style={{ backgroundImage: `url(/loginpic.jpg)` }} />
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
              <label htmlFor="email" className="form-label">Email</label>
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
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="form-footer only-link">
              <a href="#" onClick={handleRegisterClick} className="register-link">
                Register
              </a>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text"><span>OR</span></div>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoogleLogin}
            >
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
