// src/pages/ReportIssue.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createIssue, updateIssue } from "../api/issues";
import { getAllBuildings } from "../api/building";
import Header from "../components/Header";
import { Upload, CheckCircle } from "lucide-react";
import "../css/AuthPage.css";
import "../css/ReportIssue.css";
import useInactivityLogout from "../hooks/useInactivityLogout"; // ← ADD THIS

export default function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ← ADD THIS
  const { InactivityModal } = useInactivityLogout("STUDENT");

  // Detect Edit mode
  const isEdit = location.state?.edit === true;
  const issueData = location.state || null;
  const buildingFromState = location.state?.buildingCode || "";

  // Form fields
  const [title, setTitle] = useState(issueData?.issueTitle || "");
  const [priority, setPriority] = useState(issueData?.issuePriority || "");
  const [description, setDescription] = useState(issueData?.issueDescription || "");
  const [buildingCode, setBuildingCode] = useState(issueData?.issueLocation || buildingFromState);
  const [locationText, setLocationText] = useState(issueData?.exactLocation || "");
  const [photo, setPhoto] = useState(null);

  const [dragActive, setDragActive] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  // Load buildings
  useEffect(() => {
    getAllBuildings()
      .then((data) => setBuildings(data))
      .catch(() => setBuildings([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "", message: "" }), 2500);
  };

  const validateFile = (file) => {
    if (!file) return null;
    if (!["image/png", "image/jpeg", "image/gif"].includes(file.type)) {
      showToast("error", "Only PNG, JPG, GIF allowed.");
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Max file size is 5MB.");
      return null;
    }
    return file;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const validFile = validateFile(file);
    setPhoto(validFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const validFile = validateFile(e.dataTransfer.files[0]);
      setPhoto(validFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !priority || !description || !buildingCode || !locationText) {
      showToast("error", "Please fill all required fields.");
      return;
    }

    const selectedBuilding = buildings.find((b) => b.buildingCode === buildingCode);
    if (!selectedBuilding) {
      showToast("error", "Building not found.");
      return;
    }

    try {
      setSubmitting(true);

      if (isEdit) {
        await updateIssue(
          issueData.id,
          {
            issueTitle: title,
            issueDescription: description,
            issuePriority: priority,
            issueLocation: buildingCode,
            exactLocation: locationText,
            buildingCode: buildingCode,
          },
          photo
        );

        showToast("success", "Issue updated successfully!");
      } else {
        await createIssue(
          {
            issueTitle: title,
            issueDescription: description,
            issuePriority: priority,
            issueLocation: buildingCode,
            exactLocation: locationText,
            buildingId: selectedBuilding.id,
          },
          photo
        );

        showToast("success", "Issue reported successfully!");
      }

      setTimeout(() => navigate(`/buildings/${buildingCode}`), 1100);
    } catch (err) {
      console.error("Submit error:", err);
      showToast("error", "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/buildings/${buildingCode || ""}`);
  };

  return (
    <div className="report-issue-page">
      <Header />
      <div className="auth-container">
        <div className="auth-card-wrapper">
          <div className="report-card">
            <div className="report-header">
              <h2>{isEdit ? "Edit Issue" : "Report New Issue"}</h2>
              <p className="report-subtitle">
                {isEdit
                  ? "Update the details of this issue"
                  : "Fill out the form below to submit a maintenance issue"}
              </p>
            </div>

            {/* Form */}
            <form className="report-form-container" onSubmit={handleSubmit}>
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Issue Title <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Broken AC in Room 301"
                />
              </div>

              {/* Priority */}
              <div className="form-group">
                <label className="form-label">
                  Priority <span className="required">*</span>
                </label>
                <select
                  className="form-input form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="">Select priority level</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  Describe the Issue <span className="required">*</span>
                </label>
                <textarea
                  className="form-input form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
              </div>

              {/* Building + Exact Location */}
              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label">
                    Building <span className="required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={buildingCode}
                    onChange={(e) => setBuildingCode(e.target.value)}
                  >
                    <option value="">Select building</option>
                    {buildings.map((b) => (
                      <option key={b.buildingCode} value={b.buildingCode}>
                        {b.buildingName} ({b.buildingCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Exact Location <span className="required">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    maxLength={100}
                    placeholder="e.g., Room 301, 3rd Floor"
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">Add Image (Optional)</label>
                <div
                  className={`file-upload-area ${
                    dragActive ? "drag-active" : ""
                  } ${photo ? "has-file" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  {!photo ? (
                    <>
                      <div className="file-upload-icon">
                        <Upload size={24} />
                      </div>
                      <div className="file-upload-text">
                        <span className="highlight">Click to upload</span> or drag and drop
                      </div>
                      <div className="file-upload-hint">PNG, JPG, GIF up to 5MB</div>
                    </>
                  ) : (
                    <div className="selected-file">
                      <CheckCircle size={20} className="selected-file-icon" />
                      <span>{photo.name}</span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhoto(null);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-submit" disabled={submitting}>
                  {submitting ? "Saving..." : isEdit ? "Update Issue" : "Submit Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.message && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      {/* Inactivity Modal - ADD THIS */}
      {InactivityModal}
    </div>
  );
}