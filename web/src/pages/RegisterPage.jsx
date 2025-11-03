import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CitfixLogo from '../components/CitfixLogo';
import "../css/AuthPage.css";

export function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setPhoneNumber(value);
  };

  const handleStudentIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setStudentId(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleGoogleRegister = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-background" style={{ backgroundImage: "url(/loginpic.jpg)" }} />
      <div className="auth-overlay" />

      <div className="auth-card-wrapper register-card-wrapper">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-logo-container">
              <CitfixLogo size="lg" />
            </div>
            <p className="auth-subtitle">Create your account to get started</p>
          </div>

          {showSuccess && (
            <div className="success-message">
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Two-column grid for: 
                Left: Full Name, Student ID, Department
                Right: Email, Phone Number
            */}
            <div className="form-grid">
              {/* Left column */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
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
                  <label htmlFor="studentId" className="form-label">Student ID</label>
                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={handleStudentIdChange}
                    placeholder="Enter your student ID"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department" className="form-label">Department</label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Enter your department"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
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
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="Enter your phone number"
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Full-width: Password, Confirm Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
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
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
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

            <button type="submit" className="btn btn-primary">Register</button>

            <div className="divider">
              <div className="divider-line" />
              <div className="divider-text"><span>OR</span></div>
            </div>

            <button type="button" className="btn btn-outline" onClick={handleGoogleRegister}>
              Register with Google
            </button>

            <div className="auth-footer-text">
              Already have an account?{' '}
              <a href="#" onClick={handleLoginClick} className="auth-link">Login here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
