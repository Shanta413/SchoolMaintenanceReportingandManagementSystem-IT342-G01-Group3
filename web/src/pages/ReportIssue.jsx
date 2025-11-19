// src/pages/ReportIssue.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createIssue } from "../api/issues";
import { getAllBuildings } from "../api/building";
import Header from "../components/Header";
import "../css/AuthPage.css"; // for form, buttons, toast
import "../css/ReportIssue.css"; // (if any)

function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();

  // Accept buildingId from previous page (if any)
  const buildingFromState = location.state?.buildingId || "";

  // Form state
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [building, setBuilding] = useState(buildingFromState); // This will be buildingId (UUID)
  const [locationText, setLocationText] = useState("");
  const [photo, setPhoto] = useState(null);

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  // Fetch all buildings for dropdown
  useEffect(() => {
    setLoading(true);
    getAllBuildings()
      .then((data) => setBuildings(data))
      .catch(() => setBuildings([]))
      .finally(() => setLoading(false));
  }, []);

  // Toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 2500);
  };

  // Handle file input
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return setPhoto(null);

    if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      showToast("error", "Only PNG, JPG, GIF allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Max file size is 5MB.");
      return;
    }
    setPhoto(file);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !priority || !description || !building || !locationText) {
      showToast("error", "Please fill all required fields.");
      return;
    }
    if (description.length > 500) {
      showToast("error", "Description too long.");
      return;
    }
    setSubmitting(true);
    try {
      await createIssue(
        {
          issueTitle: title,
          issuePriority: priority,
          issueDescription: description,
          issueLocation: locationText,
          buildingId: building, // SENDS THE UUID!
        },
        photo
      );
      showToast("success", "Issue reported successfully!");
      setTimeout(() => {
        // Go back to the selected building detail page
        navigate(`/buildings/${building}`);
      }, 1200);
    } catch (err) {
      showToast("error", "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel button
  const handleCancel = () => {
    if (building) {
      navigate(`/buildings/${building}`);
    } else {
      navigate("/buildings");
    }
  };

  return (
    <div className="report-issue-page">
      <Header />
      <div className="auth-container">
        <div className="auth-card-wrapper">
          <div className="auth-card" style={{ maxWidth: 600 }}>
            <div className="auth-header">
              <h2>Report New Issue</h2>
              <div className="auth-subtitle">
                Fill out the form below to submit a maintenance issue
              </div>
            </div>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">
                  Issue Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Broken AC in Room 301"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Priority <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="">Select priority level</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Describe the Issue <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed description of the issue..."
                  maxLength={500}
                  required
                  rows={4}
                  style={{ resize: "vertical" }}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: 12,
                    color: description.length > 500 ? "#dc2626" : "#6b7280",
                  }}
                >
                  {description.length}/500
                </div>
              </div>
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">
                      Building <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <select
                      className="form-input"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      required
                    >
                      <option value="">Select building</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.buildingName} ({b.buildingCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-column">
                  <div className="form-group">
                    <label className="form-label">
                      Exact Location <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      className="form-input"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      maxLength={100}
                      placeholder="e.g., Room 301, 3rd Floor"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Add Image (Optional)</label>
                <input
                  className="form-input"
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handlePhotoChange}
                />
                {photo && (
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    Selected: {photo.name}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ minWidth: 120 }}
                >
                  {submitting ? "Submitting..." : "Submit Issue"}
                </button>
              </div>
            </form>
            {toast.message && (
              <div className={`toast ${toast.type}`}>{toast.message}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
