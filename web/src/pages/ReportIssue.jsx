// src/pages/ReportIssue.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createIssue } from "../api/issues";
import { getAllBuildings } from "../api/building";
import Header from "../components/Header";
import { Upload, CheckCircle } from "lucide-react";
import "../css/AuthPage.css";
import "../css/ReportIssue.css";

function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();

  const buildingFromState = location.state?.buildingCode || "";

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [buildingCode, setBuildingCode] = useState(buildingFromState);
  const [locationText, setLocationText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", message: "" });

  useEffect(() => {
    setLoading(true);
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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validFile = validateFile(file);
      setPhoto(validFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !priority || !description || !buildingCode || !locationText) {
      showToast("error", "Please fill all required fields.");
      return;
    }
    if (description.length > 500) {
      showToast("error", "Description too long.");
      return;
    }
    
    setSubmitting(true);

    const selectedBuilding = buildings.find(
      (b) => b.buildingCode === buildingCode
    );
    if (!selectedBuilding) {
      showToast("error", "Building not found.");
      setSubmitting(false);
      return;
    }

    try {
      await createIssue(
        {
          issueTitle: title,
          issueDescription: description,
          issueLocation: locationText,
          issuePriority: priority,
          buildingId: selectedBuilding.id,
        },
        photo
      );
      showToast("success", "Issue reported successfully!");
      setTimeout(() => {
        navigate(`/buildings/${buildingCode}`);
      }, 1100);
    } catch (err) {
      showToast("error", "Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (buildingCode) {
      navigate(`/buildings/${buildingCode}`);
    } else {
      navigate("/buildings");
    }
  };

  return (
    <div className="report-issue-page">
      <Header />
      <div className="auth-container">
        <div className="auth-card-wrapper">
          <div className="report-card">
            <div className="report-header">
              <h2>Report New Issue</h2>
              <p className="report-subtitle">
                Fill out the form below to submit a maintenance issue
              </p>
            </div>

            <div className="report-form-container" onSubmit={handleSubmit}>
              {/* Issue Title */}
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
                  required
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
                  required
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
                  placeholder="Provide detailed description of the issue..."
                  maxLength={500}
                  required
                  rows={4}
                />
                <div className="char-count">
                  Maximum 500 characters
                  <span className={description.length > 500 ? "over-limit" : ""}>
                    {description.length}/500
                  </span>
                </div>
              </div>

              {/* Building and Location Row */}
              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label">
                    Building <span className="required">*</span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={buildingCode}
                    onChange={(e) => setBuildingCode(e.target.value)}
                    required
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
                    required
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">Add Image (Optional)</label>
                <div
                  className={`file-upload-area ${dragActive ? "drag-active" : ""} ${
                    photo ? "has-file" : ""
                  }`}
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
                      <div className="file-upload-hint">
                        PNG, JPG, GIF up to 5MB
                      </div>
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

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Issue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.message && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}

export default ReportIssue;