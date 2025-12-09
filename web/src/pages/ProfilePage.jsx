import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  Upload,
  Info,
} from "lucide-react";
import "../css/ProfilePage.css";
import { useNavigate } from "react-router-dom";
import useInactivityLogout from "../hooks/useInactivityLogout"; // ← ADD THIS

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://backend-production-4aa1.up.railway.app/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  
  // ← ADD THIS
  const { InactivityModal } = useInactivityLogout("STUDENT");

  // ====== State hooks ======
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobileNumber: "",
    studentIdNumber: "",
    studentDepartment: "",
    createdAt: "",
    password: "",
    avatarUrl: "",
    authMethod: "",
  });

  const [initialTextSnapshot, setInitialTextSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarBust, setAvatarBust] = useState(Date.now());

  // ====== Toast notification state & function ======
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // ====== Helper: initials ======
  const getInitials = (nameOrEmail) =>
    (nameOrEmail || "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  // ====== Fetch user profile ======
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const d = res.data || {};
        const payload = {
          fullname: d.fullname || "",
          email: d.email || "",
          mobileNumber: d.mobileNumber || "",
          studentIdNumber: d.studentIdNumber || "",
          studentDepartment: d.studentDepartment || "",
          createdAt: d.createdAt
            ? new Date(d.createdAt).toLocaleDateString()
            : "",
          password: "",
          avatarUrl: d.avatarUrl || "",
          authMethod: d.authMethod || "LOCAL",
        };
        setFormData(payload);

        // keep a snapshot of text fields only (to detect changes later)
        setInitialTextSnapshot({
          fullname: payload.fullname,
          mobileNumber: payload.mobileNumber,
          studentDepartment: payload.studentDepartment,
          studentIdNumber: payload.studentIdNumber,
        });

        setAvatarBust(Date.now());
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        showToast("Session expired. Please login again.", "error");
        localStorage.removeItem("authToken");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // ====== Detect if any non-avatar field changed ======
  const hasChanges = useMemo(() => {
    if (!initialTextSnapshot) return false;
    
    // Check if avatar file is selected
    if (selectedFile) return true;
    
    // Check text fields
    return (
      formData.fullname !== initialTextSnapshot.fullname ||
      formData.mobileNumber !== initialTextSnapshot.mobileNumber ||
      formData.studentDepartment !== initialTextSnapshot.studentDepartment ||
      formData.studentIdNumber !== initialTextSnapshot.studentIdNumber ||
      (formData.password && formData.password.trim().length > 0)
    );
  }, [formData, initialTextSnapshot, selectedFile]);

  // ====== Controlled inputs with validation ======
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Full name - limit to 60 characters
    if (name === "fullname" && value.length > 60) {
      return;
    }
    
    // Phone number - only numbers, max 11
    if (name === "mobileNumber") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 11) return;
    }
    
    // Student ID - only numbers and dashes, max 11
    if (name === "studentIdNumber") {
      if (!/^[\d-]*$/.test(value)) return;
      if (value.length > 11) return;
    }
    
    // Department - max 10 characters
    if (name === "studentDepartment" && value.length > 10) {
      return;
    }
    
    // Password - max 30 characters
    if (name === "password" && value.length > 30) {
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ====== Handle avatar selection (enabled for LOCAL and GOOGLE) ======
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Max file size is 5MB.", "error");
      return;
    }
    setSelectedFile(file);
  };

  // ====== Save profile updates (text + optional avatar) ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      showToast("Not authenticated!", "error");
      setSaving(false);
      return;
    }

    try {
      // 1) If a new avatar is picked, upload it first
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);

        await axios.put(`${API_BASE}/user/profile/avatar`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // IMPORTANT: re-fetch the fresh profile so state has the new Supabase URL
        const refreshed = await axios.get(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData((prev) => ({
          ...prev,
          fullname: refreshed.data.fullname || prev.fullname,
          mobileNumber: refreshed.data.mobileNumber || prev.mobileNumber,
          studentDepartment:
            refreshed.data.studentDepartment || prev.studentDepartment,
          studentIdNumber: refreshed.data.studentIdNumber || prev.studentIdNumber,
          avatarUrl: refreshed.data.avatarUrl || prev.avatarUrl,
          authMethod: refreshed.data.authMethod || prev.authMethod,
        }));
        setSelectedFile(null);
      }

      // 2) Send ONLY text updates (do NOT include avatarUrl)
      const {
        password,
        fullname,
        mobileNumber,
        studentDepartment,
        studentIdNumber,
        authMethod,
      } = formData;
      const payload = {
        fullname,
        mobileNumber,
        studentDepartment,
        studentIdNumber,
      };
      if (
        password &&
        password.trim().length > 0 &&
        authMethod !== "GOOGLE"
      ) {
        payload.password = password;
      }

      await axios.put(`${API_BASE}/user/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update snapshot after successful save
      setInitialTextSnapshot({
        fullname,
        mobileNumber,
        studentDepartment,
        studentIdNumber,
      });

      showToast("Profile updated successfully!", "success");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error("Failed to update profile:", err);
      showToast("Error updating profile. Try again later.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-page">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      {/* ===== Toast Notification ===== */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

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
          <div className="avatar-container">
            {formData.avatarUrl || selectedFile ? (
              <img
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : formData.avatarUrl
                }
                alt="avatar"
                className="avatar-img"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  const src = e.currentTarget.src || "";
                  if (
                    src.includes("lh3.googleusercontent.com") &&
                    !src.includes("=s256-c")
                  ) {
                    e.currentTarget.src = src.replace(/=s\d+-c$/, "=s256-c");
                    return;
                  }
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="avatar-circle">
                {getInitials(formData.fullname || formData.email)}
              </div>
            )}

            {/* Upload Button */}
            <label className="upload-avatar-btn">
              <Upload size={16} />
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarPick}
              />
            </label>

            {uploading && <div className="uploading-hint">Uploading photo…</div>}
          </div>

          <div>
            <h2>{formData.fullname}</h2>
          </div>
        </div>
      </div>

      {/* ===== Profile Info Section ===== */}
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
                    maxLength={60}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label-with-info">
                  Email Address
                  <div className="info-icon-wrapper">
                    <Info size={16} className="info-icon" />
                    <div className="info-tooltip">
                      To change your email, please contact the administrator at{" "}
                      <strong>jaysoncan413@gmail.com</strong>. Email changes require verification for security purposes.
                    </div>
                  </div>
                </label>
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
                    placeholder="e.g., 09123456789 (11 digits)"
                    maxLength={11}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Student ID</label>
                <input
                  type="text"
                  name="studentIdNumber"
                  value={formData.studentIdNumber}
                  onChange={handleChange}
                  placeholder="e.g., 23-4231-312"
                  maxLength={11}
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
                    onChange={handleChange}
                    placeholder="e.g., CCS, CEA, CASE, CNAS, CCI"
                    maxLength={10}
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

            {/* Password change — disabled for Google users */}
            <div className="form-group full-width">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                maxLength={30}
                disabled={formData.authMethod === "GOOGLE"}
                style={formData.authMethod === "GOOGLE" ? { background: "#f3f4f6", cursor: "not-allowed" } : {}}
              />
              {formData.authMethod === "GOOGLE" && (
                <small className="hint">
                  Password changes are <b>disabled</b> for Google accounts.
                </small>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
                disabled={saving || uploading || !hasChanges}
              >
                {saving || uploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Inactivity Modal - ADD THIS */}
      {InactivityModal}
    </div>
  );
};

export default ProfilePage;