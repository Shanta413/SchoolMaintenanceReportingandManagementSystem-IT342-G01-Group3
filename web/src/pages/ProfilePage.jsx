import React, { useState, useEffect } from "react";
import axios from "axios";
import { Mail, Phone, Calendar, MapPin, User, ArrowLeft } from "lucide-react";
import "../css/ProfilePage.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobileNumber: "",
    studentIdNumber: "",
    studentDepartment: "",
    createdAt: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🟢 Fetch profile from backend
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:8080/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setFormData({
          fullname: res.data.fullname || "",
          email: res.data.email || "",
          mobileNumber: res.data.mobileNumber || "",
          studentIdNumber: res.data.studentIdNumber || "",
          studentDepartment: res.data.studentDepartment || "",
          createdAt: res.data.createdAt
            ? new Date(res.data.createdAt).toLocaleDateString()
            : "",
          password: "",
        });
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        alert("Session expired. Please login again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🟢 Update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("authToken");
    if (!token) return alert("Not authenticated!");

    try {
      await axios.put("http://localhost:8080/api/user/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Error updating profile. Try again later.");
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      {/* ===== Header Section ===== */}
      <div
        className="profile-header"
        style={{ backgroundImage: `url(/loginpic.jpg)` }}
      >
        <div className="profile-header-overlay"></div>

        {/* Back Button */}
        <button className="back-button" onClick={() => navigate("/buildings")}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="profile-header-content">
          <div className="avatar-circle">{getInitials(formData.fullname)}</div>
          <div>
            <h2>{formData.fullname}</h2>
            <p>{formData.studentDepartment}</p>
            <p className="email">{formData.email}</p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* ===== Profile Information Section ===== */}
      <div className="profile-body">
        <div className="profile-card">
          <h3>Profile Information</h3>
          <p className="subtitle">View and manage your personal information</p>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <div className="icon-input">
                  <User size={16} />
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="icon-input">
                  <Mail size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <div className="icon-input">
                  <Phone size={16} />
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  name="studentIdNumber"
                  value={formData.studentIdNumber}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <div className="icon-input">
                  <MapPin size={16} />
                  <input
                    type="text"
                    name="studentDepartment"
                    value={formData.studentDepartment}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Member Since</label>
                <div className="icon-input">
                  <Calendar size={16} />
                  <input
                    type="text"
                    name="createdAt"
                    value={formData.createdAt}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
