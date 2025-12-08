import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CitfixLogo from "../components/CitfixLogo";
import "../css/AuthPage.css";
import api from "../api/axios";
import useAuthToken from "../api/useAuthToken";

export function RegisterPage() { // NAMED EXPORT SAME AS LOGIN
  useAuthToken(); // Handle Google redirect

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : "https://backend-production-4aa1.up.railway.app");

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        fullname: fullName,
        email,
        password,
        mobileNumber: phoneNumber,
        studentIdNumber: studentId,
        studentDepartment: department,
      });

      showToast("Registration successful!", "success");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Registration failed! Please try again.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="auth-container">
      {toast.show && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <div
        className="auth-background"
        style={{ backgroundImage: "url(/loginpic.jpg)" }}
      />
      <div className="auth-overlay" />

      <div className="auth-card-wrapper register-card-wrapper">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-logo-container">
              <CitfixLogo size="lg" />
            </div>
            <p className="auth-subtitle">
              Create your account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            
            <input
              type="text"
              placeholder="Full Name"
              className="form-input"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Student ID"
              className="form-input"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />

            <input
              type="text"
              placeholder="Department"
              className="form-input"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <input
              type="email"
              placeholder="Email"
              className="form-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="form-input"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="form-input"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="divider">OR</div>

            <button type="button" className="btn btn-outline" onClick={handleGoogleRegister}>
              Register with Google
            </button>

            <div className="auth-footer-text">
              Already have an account?{" "}
              <a href="#" className="auth-link" onClick={handleLoginClick}>
                Login here
              </a>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
