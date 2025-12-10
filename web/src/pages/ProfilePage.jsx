import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ArrowLeft, Upload, Info } from "lucide-react";
import "../css/ProfilePage.css";
import { useNavigate } from "react-router-dom";
import useInactivityLogout from "../hooks/useInactivityLogout";

const API_BASE = "https://backend-production-4aa1.up.railway.app/api";


const ProfilePage = () => {
  const navigate = useNavigate();
  
  const { InactivityModal } = useInactivityLogout("STUDENT");

  // ====== Edit Mode State ======
  const [isEditMode, setIsEditMode] = useState(false);

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

        setInitialTextSnapshot({
          fullname: payload.fullname,
          mobileNumber: payload.mobileNumber,
          studentDepartment: payload.studentDepartment,
          studentIdNumber: payload.studentIdNumber,
        });
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
    if (!initialTextSnapshot || !isEditMode) return false;
    
    if (selectedFile) return true;
    
    return (
      formData.fullname !== initialTextSnapshot.fullname ||
      formData.mobileNumber !== initialTextSnapshot.mobileNumber ||
      formData.studentDepartment !== initialTextSnapshot.studentDepartment ||
      formData.studentIdNumber !== initialTextSnapshot.studentIdNumber ||
      (formData.password && formData.password.trim().length > 0)
    );
  }, [formData, initialTextSnapshot, selectedFile, isEditMode]);

  // ====== Controlled inputs with validation ======
  const handleChange = (e) => {
    if (!isEditMode) return;
    
    const { name, value } = e.target;
    
    if (name === "fullname" && value.length > 60) return;
    if (name === "mobileNumber") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 11) return;
    }
    if (name === "studentIdNumber") {
      if (!/^[\d-]*$/.test(value)) return;
      if (value.length > 11) return;
    }
    if (name === "studentDepartment" && value.length > 10) return;
    if (name === "password" && value.length > 30) return;
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ====== Handle avatar selection ======
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

  // ====== Toggle Edit Mode ======
  const handleEditToggle = () => {
    if (isEditMode) {
      setFormData((prev) => ({
        ...prev,
        fullname: initialTextSnapshot.fullname,
        mobileNumber: initialTextSnapshot.mobileNumber,
        studentDepartment: initialTextSnapshot.studentDepartment,
        studentIdNumber: initialTextSnapshot.studentIdNumber,
        password: "",
      }));
      setSelectedFile(null);
    }
    setIsEditMode(!isEditMode);
  };

  // ====== Save profile updates ======
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
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);

        await axios.put(`${API_BASE}/user/profile/avatar`, fd, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

      setInitialTextSnapshot({
        fullname,
        mobileNumber,
        studentDepartment,
        studentIdNumber,
      });

      showToast("Profile updated successfully!", "success");
      setFormData((prev) => ({ ...prev, password: "" }));
      setIsEditMode(false);
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
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}

      {/* Header Section */}
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

            {/* Upload Button - Only in Edit Mode */}
            {isEditMode && (
              <label className="upload-avatar-btn">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarPick}
                />
              </label>
            )}

            {uploading && <div className="uploading-hint">Uploading photo…</div>}
          </div>

          <div>
            <h2>{formData.fullname}</h2>
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="profile-body">
        <div className="profile-card">
          <div className="card-header">
            <div>
              <h3>Profile Information</h3>
              <p className="subtitle">View and manage your personal information</p>
            </div>
            {!isEditMode && (
              <button className="edit-profile-btn" onClick={handleEditToggle}>
                Edit Profile
              </button>
            )}
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                  maxLength={60}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-group">
                <label className="label-with-info">
                  EMAIL ADDRESS
                  <div className="info-icon-wrapper">
                    <Info size={16} className="info-icon" />
                    <div className="info-tooltip">
                      To change your email, contact the administrator at{" "}
                      <strong>jaysoncan413@gmail.com</strong>. Email changes require verification for security.
                    </div>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>PHONE NUMBER</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="e.g., 09123456789"
                  maxLength={11}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-group">
                <label>STUDENT ID</label>
                <input
                  type="text"
                  name="studentIdNumber"
                  value={formData.studentIdNumber}
                  onChange={handleChange}
                  placeholder="e.g., 23-4231-312"
                  maxLength={11}
                  disabled={!isEditMode}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>DEPARTMENT</label>
                <input
                  type="text"
                  name="studentDepartment"
                  value={formData.studentDepartment}
                  onChange={handleChange}
                  placeholder="e.g., CCS, CEA"
                  maxLength={10}
                  disabled={!isEditMode}
                />
              </div>

              <div className="form-group">
                <label>MEMBER SINCE</label>
                <input
                  type="text"
                  name="createdAt"
                  value={formData.createdAt}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>

            {/* Password Field - Full Width */}
            <div className="form-group full-width">
              <label>
                NEW PASSWORD
                {formData.authMethod === "GOOGLE" && (
                  <span className="google-warning">
                    This is a Google account - password changes are managed through Google settings
                  </span>
                )}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={formData.authMethod === "GOOGLE" ? "Managed by Google" : "Enter new password"}
                maxLength={30}
                disabled={!isEditMode || formData.authMethod === "GOOGLE"}
                className={formData.authMethod === "GOOGLE" ? "google-disabled" : ""}
              />
            </div>

            {isEditMode && (
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleEditToggle}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
                  disabled={saving || uploading || !hasChanges}
                >
                  {saving || uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Inactivity Modal */}
      {InactivityModal}
    </div>
  );
};

export default ProfilePage;