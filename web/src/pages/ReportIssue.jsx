// src/pages/ReportIssue.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createIssue, updateIssue } from "../api/issues";
import { getAllBuildings } from "../api/building";
import Header from "../components/Header";
import { Upload, CheckCircle, Info } from "lucide-react";
import "../css/AuthPage.css";
import "../css/ReportIssue.css";
import useInactivityLogout from "../hooks/useInactivityLogout";

// Help Modal Component
const IssueTitleHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const goodTitleExamples = [
    "Broken Air Conditioner",
    "Door Handle Loose",
    "Lights Not Working",
    "Projector Not Turning On",
    "Leaking Sink",
    "Window Glass Cracked"
  ];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="help-modal-close" onClick={onClose}>×</button>
        
        <div className="help-modal-header">
          <div className="help-modal-icon">
            <Info size={32} />
          </div>
          <h2>How to Write the Issue Title</h2>
          <p className="help-modal-subtitle">
            The Issue Title should be a short, clear description of what is wrong.
          </p>
        </div>

        <div className="help-modal-body">
          <div className="help-section">
            <div className="help-section-title">
              <span className="help-check-icon">✓</span>
              Examples of Good Titles
            </div>
            <div className="help-examples-grid">
              {goodTitleExamples.map((example, index) => (
                <div key={index} className="help-example-item">
                  <span className="help-example-icon">✓</span>
                  {example}
                </div>
              ))}
            </div>
          </div>

          <div className="help-tips">
            <div className="help-tip">
              <span className="help-tip-icon">⚡</span>
              <div>
                <strong>Keep it Brief:</strong> 2-3 words is enough
              </div>
            </div>
            <div className="help-tip">
              <span className="help-tip-icon">ℹ️</span>
              <div>
                <strong>Be Specific:</strong> Name the exact item or problem
              </div>
            </div>
            <div className="help-tip">
              <span className="help-tip-icon">💬</span>
              <div>
                <strong>Avoid Details:</strong> Save details for the description field
              </div>
            </div>
          </div>
        </div>

        <div className="help-modal-footer">
          <button className="help-modal-got-it" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Priority Help Modal Component
const PriorityHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content priority-help-content" onClick={(e) => e.stopPropagation()}>
        <button className="help-modal-close" onClick={onClose}>×</button>
        
        <div className="priority-help-cards">
          {/* High Priority Card */}
          <div className="priority-card priority-high">
            <div className="priority-card-header">
              <h3>High Priority</h3>
            </div>
            <p className="priority-subtitle">Urgent - Needs attention ASAP</p>
            <p className="priority-description">
              Choose High if the issue affects safety, electricity, water, or makes the room unusable.
            </p>
            <div className="priority-examples">
              <div className="priority-examples-title">
                <span className="check-icon">✓</span> Examples:
              </div>
              <ul>
                <li>Exposed electrical wires</li>
                <li>Major water leak or flooding</li>
              </ul>
            </div>
            <div className="priority-when">
              <span className="when-icon">⚡</span>
              <div>
                <strong>When to use:</strong> Use High when the issue can cause harm or stop classes from continuing.
              </div>
            </div>
          </div>

          {/* Medium Priority Card */}
          <div className="priority-card priority-medium">
            <div className="priority-card-header">
              <h3>Medium Priority</h3>
            </div>
            <p className="priority-subtitle">Important but not dangerous</p>
            <p className="priority-description">
              Choose Medium if the issue affects comfort or function, but the area is still usable.
            </p>
            <div className="priority-examples">
              <div className="priority-examples-title">
                <span className="check-icon">✓</span> Examples:
              </div>
              <ul>
                <li>Aircon not cooling well</li>
                <li>Projector not working</li>
              </ul>
            </div>
            <div className="priority-when">
              <span className="when-icon">⚡</span>
              <div>
                <strong>When to use:</strong> Use Medium when it should be fixed soon, but it's not an emergency.
              </div>
            </div>
          </div>

          {/* Low Priority Card */}
          <div className="priority-card priority-low">
            <div className="priority-card-header">
              <h3>Low Priority</h3>
            </div>
            <p className="priority-subtitle">Minor inconvenience</p>
            <p className="priority-description">
              Choose Low if the issue does not affect safety or class operations.
            </p>
            <div className="priority-examples">
              <div className="priority-examples-title">
                <span className="check-icon">✓</span> Examples:
              </div>
              <ul>
                <li>Small cosmetic damage (scratches, faded paint)</li>
                <li>Light cover missing but bulb works</li>
              </ul>
            </div>
            <div className="priority-when">
              <span className="when-icon">⚡</span>
              <div>
                <strong>When to use:</strong> Use Low for non-urgent issues that can be scheduled later.
              </div>
            </div>
          </div>
        </div>

        <div className="help-modal-footer">
          <button className="help-modal-got-it" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Building Map Modal Component (reusing CampusMapModal pattern)
const BuildingMapModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>
          ×
        </button>
        <img 
          src="/citbuildings.jpg" 
          alt="CIT Campus Map - Building Locator" 
          className="map-modal-image"
        />
      </div>
    </div>
  );
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  
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
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPriorityHelp, setShowPriorityHelp] = useState(false);
  const [showBuildingMap, setShowBuildingMap] = useState(false);

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
              {/* Title with Help Link */}
              <div className="form-group">
                <label className="form-label">
                  Issue Title <span className="required">*</span>
                  <button
                    type="button"
                    className="help-icon-btn"
                    onClick={() => setShowHelpModal(true)}
                    title="Need help writing the issue title?"
                  >
                    <Info size={16} />
                  </button>
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
                  <button
                    type="button"
                    className="help-icon-btn"
                    onClick={() => setShowPriorityHelp(true)}
                    title="Learn about priority levels"
                  >
                    <Info size={16} />
                  </button>
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
                    <button
                      type="button"
                      className="help-icon-btn"
                      onClick={() => setShowBuildingMap(true)}
                      title="View campus map to locate your building"
                    >
                      <Info size={16} />
                    </button>
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

      {/* Help Modal */}
      <IssueTitleHelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />

      {/* Priority Help Modal */}
      <PriorityHelpModal isOpen={showPriorityHelp} onClose={() => setShowPriorityHelp(false)} />

      {/* Building Map Modal */}
      <BuildingMapModal isOpen={showBuildingMap} onClose={() => setShowBuildingMap(false)} />

      {/* Inactivity Modal */}
      {InactivityModal}
    </div>
  );
}