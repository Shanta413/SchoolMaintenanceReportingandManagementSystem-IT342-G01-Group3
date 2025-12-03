import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { getAllStaff } from "../../api/staff";
import "../../css/IssueResolutionModal.css";

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "FIXED", label: "Resolved" },
];

// Allowed MIME types for upload
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function IssueResolutionModal({
  isOpen,
  onClose,
  onSave,
  issue = {},
  isEditing = false,
  onDelete,
  isSaving = false,
  isDeleting = false,
}) {
  const [form, setForm] = useState({
    issueTitle: "",
    issueDescription: "",
    issuePriority: "MEDIUM",
    issueStatus: "ACTIVE",
    issueLocation: "",
    exactLocation: "",
    resolvedByStaffId: "",
    buildingCode: "", // For display purposes
  });
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen) {
      console.log("📋 Issue object from props (API):", issue);

      setForm({
        issueTitle: issue.issueTitle || "",
        issueDescription: issue.issueDescription || "",
        issuePriority: issue.issuePriority || "MEDIUM",
        issueStatus: issue.issueStatus || "ACTIVE",
        issueLocation: issue.issueLocation || "",
        exactLocation: issue.exactLocation || "",
        resolvedByStaffId: issue.resolvedByStaffId || "",
        buildingCode: issue.buildingCode || "", // Store building code
      });
      setUploadFile(null);
      setFileError("");
      setToast(null);

      // Load staff list
      setStaffLoading(true);
      getAllStaff()
        .then((staffArr) => {
          console.log("👥 Staff List from API:", staffArr);
          setStaffList(staffArr || []);
        })
        .catch((err) => {
          console.error("❌ Failed to load staff:", err);
          showToast("error", "Failed to load staff list");
          setStaffList([]);
        })
        .finally(() => {
          setStaffLoading(false);
        });
    }
  }, [isOpen, issue]);

  // Toast helper
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    console.log(`[Form Change] ${name}:`, value);
  };

  // Validate file function
  const validateFile = (file) => {
    if (!file) return null;

    console.log("📎 [File Upload] Attempting to upload:", file.name);
    console.log("📎 [File Upload] File type:", file.type);
    console.log("📎 [File Upload] File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMsg = "Only PDF, DOC, or DOCX files are allowed.";
      setFileError(errorMsg);
      showToast("error", errorMsg);
      console.log("❌ [File Upload] Invalid file type:", file.type);
      return null;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = "Max file size is 10MB.";
      setFileError(errorMsg);
      showToast("error", errorMsg);
      console.log("❌ [File Upload] File too large:", (file.size / 1024 / 1024).toFixed(2), "MB");
      return null;
    }

    console.log("✅ [File Upload] File accepted:", file.name);
    return file;
  };

  // Only accept PDF, DOC, DOCX
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validFile = validateFile(file);

    if (validFile) {
      setUploadFile(validFile);
      setFileError("");
      showToast("success", `File "${validFile.name}" ready to upload`);
    } else {
      // Clear the file input
      e.target.value = "";
      setUploadFile(null);
    }
  };

  const handleSubmit = () => {
    console.log("🟢 Will call onSave with:", form, uploadFile);

    // Validation
    if (!form.issueTitle || !form.issuePriority || !form.issueStatus) {
      showToast("error", "Please fill all required fields (title, priority, status)");
      return;
    }

    if (form.issueStatus === "FIXED" && !form.resolvedByStaffId) {
      showToast("error", "Select the staff/group who resolved the issue.");
      return;
    }

    // Check if there's a file error
    if (fileError) {
      showToast("error", "Please fix file upload errors before submitting.");
      return;
    }

    // Warn if status is FIXED but no file uploaded
    if (form.issueStatus === "FIXED" && !uploadFile && !issue.resolutionFileUrl) {
      const confirmSubmit = window.confirm(
        "No resolution report uploaded. Are you sure you want to continue?"
      );
      if (!confirmSubmit) return;
    }

    onSave(form, uploadFile); // Pass as separate arguments!
  };

  const handleDeleteClick = () => {
    if (isDeleting) return;
    onDelete();
  };

  const handleCloseClick = () => {
    if (isSaving) {
      showToast("warning", "Please wait, saving in progress...");
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container" style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 10000
        }}>
          <div className={`toast toast-${toast.type}`} style={{
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            background: toast.type === "success" ? "#10b981" :
                       toast.type === "error" ? "#ef4444" :
                       toast.type === "warning" ? "#f59e0b" : "#3b82f6",
            color: "#fff",
            fontWeight: 500,
            minWidth: 250
          }}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="modal-backdrop">
        <div className="modal-box" style={{ minWidth: 540, maxWidth: 640 }}>
          <button 
            className="modal-close-btn" 
            onClick={handleCloseClick} 
            aria-label="Close modal"
            disabled={isSaving}
            style={{ cursor: isSaving ? "not-allowed" : "pointer" }}
          >
            <X />
          </button>
          <h2 className="modal-title">{isEditing ? "Edit Issue" : "Resolve Issue"}</h2>

          {/* VIEW ISSUE PHOTO LINK */}
          {issue.issuePhotoUrl && (
            <div style={{ marginBottom: 10 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: 0
                }}
                onClick={() => setShowPhoto(true)}
              >
                📷 View Issue Photo
              </button>
            </div>
          )}

          {/* Existing Resolution File Link */}
          {issue.resolutionFileUrl && (
            <div style={{ marginBottom: 10 }}>
              <a
                href={issue.resolutionFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#16a34a",
                  textDecoration: "underline",
                  fontSize: "1rem",
                  fontWeight: 500
                }}
              >
                📄 View Existing Resolution Report
              </a>
            </div>
          )}

          {/* IMAGE POPUP MODAL */}
          {showPhoto && (
            <div
              style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000
              }}
              onClick={() => setShowPhoto(false)}
            >
              <div
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 10,
                  boxShadow: "0 6px 30px rgba(0,0,0,0.25)",
                  maxWidth: 420,
                  maxHeight: "80vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative"
                }}
                onClick={e => e.stopPropagation()}
              >
                <button
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    color: "#374151",
                    cursor: "pointer"
                  }}
                  onClick={() => setShowPhoto(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <img
                  src={issue.issuePhotoUrl}
                  alt="Issue"
                  style={{
                    maxWidth: "380px",
                    maxHeight: "60vh",
                    borderRadius: 8,
                    marginBottom: 8,
                    objectFit: "contain"
                  }}
                />
                <div style={{ color: "#374151", fontSize: 13 }}>{issue.issueTitle}</div>
              </div>
            </div>
          )}

          <div className="modal-form-grid">
            {/* --- Issue Title --- */}
            <label className="modal-label" htmlFor="issue-title">
              Issue Title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="issue-title"
              name="issueTitle"
              className="modal-input"
              value={form.issueTitle}
              onChange={handleChange}
              placeholder="Enter issue title"
              required
              disabled={isSaving}
            />

            {/* --- Priority & Status --- */}
            <div className="modal-flex-row">
              <div>
                <label className="modal-label" htmlFor="issue-priority">
                  Priority Level <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  id="issue-priority"
                  name="issuePriority"
                  className="modal-input"
                  value={form.issuePriority}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="modal-label" htmlFor="issue-status">
                  Status <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select
                  id="issue-status"
                  name="issueStatus"
                  className="modal-input"
                  value={form.issueStatus}
                  onChange={handleChange}
                  required
                  disabled={isSaving}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* --- Description --- */}
            <label className="modal-label" htmlFor="issue-desc">
              Description
            </label>
            <textarea
              id="issue-desc"
              name="issueDescription"
              className="modal-input"
              value={form.issueDescription}
              onChange={handleChange}
              placeholder="Describe the issue..."
              rows={2}
              disabled={isSaving}
            />

            {/* --- Location --- */}
            <div className="modal-flex-row">
              <div>
                <label className="modal-label" htmlFor="issue-location">
                  Building / Location
                </label>
                <input
                  id="issue-location"
                  name="issueLocation"
                  className="modal-input"
                  value={form.buildingCode || form.issueLocation}
                  onChange={handleChange}
                  placeholder="Building code"
                  disabled={true}
                  style={{
                    backgroundColor: "#f3f4f6",
                    cursor: "not-allowed",
                    color: "#6b7280"
                  }}
                />
              </div>
              <div>
                <label className="modal-label" htmlFor="exact-location">
                  Exact Location
                </label>
                <input
                  id="exact-location"
                  name="exactLocation"
                  className="modal-input"
                  value={form.exactLocation}
                  onChange={handleChange}
                  placeholder="e.g., 3rd Floor, Room 301"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* --- Resolution Details --- */}
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, margin: "18px 0 0" }}>
              <h4 style={{ color: "#16a34a", margin: 0, fontWeight: 600 }}>
                Resolution Details
              </h4>
              {/* Sample Report Format link */}
              <a
                href="https://docs.google.com/document/d/1iE7c7MKJDMSBsEBorRmOHl_R8SpuI04YTF0eq1DQLVw/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginBottom: 6,
                  color: "#2563eb",
                  textDecoration: "underline",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                📄 View Sample Report Format
              </a>

              <label className="modal-label" htmlFor="resolved-by" style={{ marginTop: 6 }}>
                Who or What Group Fixed This Issue {form.issueStatus === "FIXED" && <span style={{ color: "#dc2626" }}>*</span>}
              </label>
              <select
                id="resolved-by"
                name="resolvedByStaffId"
                className="modal-input"
                value={form.resolvedByStaffId}
                onChange={handleChange}
                disabled={form.issueStatus !== "FIXED" || isSaving || staffLoading}
              >
                <option value="">
                  {staffLoading ? "Loading staff..." : "Select staff/group"}
                </option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.userId}>
                    {staff.fullname} ({staff.staffId})
                  </option>
                ))}
              </select>

              <label className="modal-label" htmlFor="resolution-upload" style={{ marginTop: 10 }}>
                Upload Report (PDF/DOC/DOCX)
              </label>
              <input
                id="resolution-upload"
                type="file"
                className="modal-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={form.issueStatus !== "FIXED" || isSaving}
              />
              {fileError && (
                <div style={{ color: "#dc2626", fontSize: 13, marginTop: 2 }}>{fileError}</div>
              )}
              {uploadFile && (
                <div style={{ marginTop: 8, color: "#16a34a", fontSize: 14 }}>
                  ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: 18 }}>
            {isEditing && (
              <button 
                className="modal-btn modal-btn-danger" 
                onClick={handleDeleteClick}
                disabled={isDeleting || isSaving}
                style={{
                  cursor: (isDeleting || isSaving) ? "not-allowed" : "pointer",
                  opacity: (isDeleting || isSaving) ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                {isDeleting && <Loader2 size={16} className="spinner" />}
                {isDeleting ? "Deleting..." : "Delete Issue"}
              </button>
            )}
            <button 
              className="modal-btn modal-btn-secondary" 
              onClick={handleCloseClick}
              disabled={isSaving}
              style={{
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button 
              className="modal-btn modal-btn-primary" 
              onClick={handleSubmit}
              disabled={isSaving}
              style={{
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              {isSaving && <Loader2 size={16} className="spinner" />}
              {isSaving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}