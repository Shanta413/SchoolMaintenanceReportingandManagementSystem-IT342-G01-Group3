import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CitfixLogo from "../components/CitfixLogo";
import "../css/AuthPage.css";
import api from "../api/axios"; // ✅ Axios instance

export function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Toast notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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

      showToast(response.data.message || "Registration successful!", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 500
          ? "Email is already used!"
          : "Error during registration.");
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="auth-container">
      {/* ✅ Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

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
            <p className="auth-subtitle">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentId" className="form-label">
                    Student ID
                  </label>
                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter your student ID"
                    className="form-input"
                    maxLength={11}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Enter your department"
                    className="form-input"
                      maxLength={10}   
                    required
                  />
                </div>
              </div>

              <div className="form-column">
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
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="form-input"
                    maxLength={11}   // 👈 Phone: 11
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Registering..." : "Register"}
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
