import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CitfixLogo from "../components/CitfixLogo";
import "../css/AuthPage.css";
import api from "../api/axios";
import useAuthToken from "../api/useAuthToken"; // 👈 IMPORTANT

export function RegisterPage() { // 👈 NAMED EXPORT
  useAuthToken(); // 👈 Handle Google redirect if triggered

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast message
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
      showToast("Passwords do not match!", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        fullname: fullName,
        email,
        password,
        mobileNumber: phoneNumber,
        studentIdNumber: studentId,
        studentDepartment: department,
      });

      showToast(
        response.data.message || "Registration successful!",
        "success"
      );

      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.status === 500
          ? "Email is already registered!"
          : "Error during registration.");

      showToast(message, "error");

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
            <p className="auth-subtitle">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">

            {/* ===================================== */}
            {/* ROW LEFT + RIGHT INPUTS */}
            {/* ===================================== */}
            <div className="form-grid">
              {/* LEFT COLUMN */}
              <div className="form-column">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter student ID"
                    className="form-input"
                    maxLength={11}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., CCS, CEA, CASE"
                    className="form-input"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="form-column">

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="form-input"
                    maxLength={11}
                    required
                  />
                </div>
              </div>
            </div>

            {/* ====================== PASSWORD ====================== */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ================= CONFIRM PASSWORD ================= */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="password-toggle"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* ============= SUBMIT ================= */}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text">OR</div>
            </div>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleGoogleRegister}
            >
              Register with Google
            </button>

            <div className="auth-footer-text">
              Already have an account?{" "}
              <a href="#" onClick={handleLoginClick} className="auth-link">
                Login here
              </a>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
