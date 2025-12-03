import React, { useState, useRef } from "react";
import { createIssue } from "../../api/issues"; // ✅ Use the API function
import "../../css/ReportIssue.css";

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

  // Validate image file
  const validateFile = (file) => {
    if (!file) return null;

    console.log("📎 [File Upload] Attempting to upload:", file.name);
    console.log("📎 [File Upload] File type:", file.type);
    console.log("📎 [File Upload] File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

    // Check file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Only PNG, JPG, and GIF images are allowed.";
      showToast("error", errorMsg);
      console.log("❌ [File Upload] Invalid file type:", file.type);
      return null;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      const errorMsg = "Image size must be less than 5MB.";
      showToast("error", errorMsg);
      console.log("❌ [File Upload] File too large:", (file.size / 1024 / 1024).toFixed(2), "MB");
      return null;
    }

    console.log("✅ [File Upload] File accepted:", file.name);
    return file;
  };

  const resetForm = () => {
    setTitle("");
    setPriority("");
    setDescription("");
    setLocation("");
    setFile(null);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validFile = validateFile(selectedFile);
    
    if (validFile) {
      setFile(validFile);
      showToast("success", `File "${validFile.name}" ready to upload`);
    } else {
      // Clear the file input
      e.target.value = "";
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title || !priority || !description || !buildingId || !location) {
      showToast("error", "Please fill all required fields.");
      return;
    }

    setLoading(true);
    console.log("📤 [Modal] Submitting issue:", {
      issueTitle: title,
      issuePriority: priority,
      buildingId,
      exactLocation: location,
      hasFile: !!file
    });

    try {
      // ✅ Use the createIssue API function instead of hardcoded fetch
      await createIssue(
        {
          issueTitle: title,
          issueDescription: description,
          issuePriority: priority,
          buildingId: buildingId,
          exactLocation: location,
          issueLocation: buildingCode, // Optional: for consistency
        },
        file // Pass the file as second argument
      );

      console.log("✅ [Modal] Issue created successfully");
      showToast("success", "Issue created successfully!");
      
      // Notify parent and close
      onIssueCreated?.();
      resetForm();
      setTimeout(onClose, 500);
    } catch (error) {
      console.error("❌ [Modal] Failed to create issue:", error);
      const errorMsg = error?.response?.data?.message || "Failed to create issue. Please try again.";
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {toast && (
        <div
          className={`toast ${
            toast.type === "success" ? "toast-success" : "toast-error"
          }`}
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 10000,
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            fontWeight: 500,
            minWidth: 250
          }}
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
              disabled={loading}
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
              disabled={loading}
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
              style={{
                backgroundColor: "#f3f4f6",
                cursor: "not-allowed",
                color: "#6b7280"
              }}
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
              disabled={loading}
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
              disabled={loading}
              rows={4}
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Add Image (Optional)</label>

            <div
              className={`file-upload-area ${file ? "has-file" : ""}`}
              onClick={() => !loading && fileInput.current.click()}
              style={{ cursor: loading ? "not-allowed" : "pointer" }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif"
                ref={fileInput}
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={loading}
              />

              {!file ? (
                <>
                  <div className="file-upload-icon">📷</div>
                  <p className="file-upload-text">
                    Click to <span className="highlight">upload an image</span>
                  </p>
                  <div className="file-upload-hint">PNG, JPG, GIF up to 5MB</div>
                </>
              ) : (
                <div className="selected-file">
                  <span style={{ marginRight: '8px' }}>✓</span>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInput.current) {
                        fileInput.current.value = "";
                      }
                    }}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
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
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="btn btn-submit" 
              disabled={loading}
              style={{
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "Submitting..." : "Submit Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}