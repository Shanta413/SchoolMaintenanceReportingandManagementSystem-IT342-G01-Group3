import React, { useState, useRef } from "react";
import "../../css/ReportIssue.css"; // ✔ Uses the same modern UI style

export default function AdminReportIssueModal({
  isOpen,
  onClose,
  buildingId,
  buildingCode,
  onIssueCreated,
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const fileInput = useRef(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  // Toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const resetForm = () => {
    setTitle("");
    setPriority("");
    setDescription("");
    setLocation("");
    setFile(null);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("authToken");

    const formData = new FormData();
    const issueDto = {
      issueTitle: title,
      issueDescription: description,
      issuePriority: priority,
      buildingId: buildingId,
      exactLocation: location,
    };

    formData.append(
      "data",
      new Blob([JSON.stringify(issueDto)], { type: "application/json" })
    );
    if (file) formData.append("photo", file);

    try {
      console.log("[Modal] SUBMIT body dto:", issueDto);

      const res = await fetch("http://localhost:8080/api/issues", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("[Modal] Submit failed:", result);
        showToast("error", result.error || "Failed to create issue");
      } else {
        console.log("[Modal] SUCCESS:", result);
        showToast("success", "Issue created successfully!");
        onIssueCreated?.();
        resetForm();
        setTimeout(onClose, 500);
      }
    } catch (err) {
      console.error("[Modal] ERROR:", err);
      showToast("error", "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {toast && (
        <div
          className={`toast ${
            toast.type === "success" ? "toast-success" : "toast-error"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div
        className="modal-content report-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "800px" }}
      >
        <div className="report-header">
          <h2>Report New Issue</h2>
          <p className="report-subtitle">
            Fill out the form below to submit a maintenance issue
          </p>
        </div>

        <form className="report-form-container" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Issue Title <span className="required">*</span>
            </label>
            <input
              className="form-input"
              placeholder="e.g., Broken AC in Room 301"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          {/* Building (read-only) */}
          <div className="form-group">
            <label className="form-label">
              Building <span className="required">*</span>
            </label>
            <input
              className="form-input"
              value={`${buildingCode}`}
              readOnly
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              Exact Location <span className="required">*</span>
            </label>
            <input
              className="form-input"
              placeholder="e.g., Room 301, 3rd Floor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Describe the Issue <span className="required">*</span>
            </label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe the issue here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Add Image (Optional)</label>

            <div
              className={`file-upload-area ${file ? "has-file" : ""}`}
              onClick={() => fileInput.current.click()}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInput}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />

              {!file ? (
                <>
                  <div className="file-upload-icon">📷</div>
                  <p className="file-upload-text">
                    Click to <span className="highlight">upload an image</span>
                  </p>
                </>
              ) : (
                <p className="selected-file">📁 {file.name}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
