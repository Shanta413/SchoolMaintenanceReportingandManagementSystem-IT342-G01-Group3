import React, { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
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

// Confirm Revert Modal
function ConfirmRevertModal({ open, onConfirm, onCancel, hasFile, fileUrl }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" style={{ zIndex: 1500 }}>
      <div className="modal-box" style={{ minWidth: 340, maxWidth: 400 }}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <h3 style={{ marginBottom: 10, color: "#b91c1c" }}>Revert to Active?</h3>
          <p style={{ color: "#475569", fontSize: 15 }}>
            Changing status to <b>Active</b> will <b>remove the resolver and attached report file</b>.
          </p>
          {hasFile && (
            <div style={{ margin: "10px 0", color: "#dc2626", fontWeight: 500 }}>
              Download the file before proceeding!
              <br />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: 4,
                  color: "#2563eb",
                  textDecoration: "underline",
                  fontSize: "1rem"
                }}
              >
                <Download size={16} style={{ marginRight: 6 }} />
                Download Report
              </a>
            </div>
          )}
        </div>
        <div className="modal-actions" style={{ justifyContent: "center", gap: 12 }}>
          <button className="modal-btn modal-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-danger" onClick={onConfirm}>
            Yes, Revert
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IssueResolvedModal({
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
    issueStatus: "FIXED",
    issueLocation: "",
    exactLocation: "",
    resolvedByStaffId: "",
    issueReportFile: null,
    buildingCode: "", // For display purposes
  });
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);

  // For confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // If user sets back to ACTIVE, fields become editable again
  const [statusChangedToActive, setStatusChangedToActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("📋 Issue object from props (API):", issue);

      setForm({
        issueTitle: issue.issueTitle || "",
        issueDescription: issue.issueDescription || "",
        issuePriority: issue.issuePriority || "MEDIUM",
        issueStatus: issue.issueStatus || "FIXED",
        issueLocation: issue.issueLocation || "",
        exactLocation: issue.exactLocation || "",
        resolvedByStaffId: issue.resolvedById || "",
        issueReportFile: issue.issueReportFile || null,
        buildingCode: issue.buildingCode || "", // Store building code
      });
      setUploadFile(null);
      setFileError("");
      setStatusChangedToActive(false);
      setShowConfirmModal(false);
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
    
    // Special: handle Status change
    if (name === "issueStatus") {
      if (form.issueStatus === "FIXED" && value === "ACTIVE") {
        setShowConfirmModal(true);
        return;
      }
      setForm((prev) => ({ ...prev, [name]: value }));
      if (value === "ACTIVE") {
        setStatusChangedToActive(true);
      } else {
        setStatusChangedToActive(false);
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    
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

  // Handle confirming revert
  const handleConfirmRevert = () => {
    setForm((prev) => ({
      ...prev,
      issueStatus: "ACTIVE",
      resolvedByStaffId: "",
      issueReportFile: null,
    }));
    setUploadFile(null);
    setShowConfirmModal(false);
    setStatusChangedToActive(true);
    showToast("warning", "Status reverted to Active. Resolver and file removed.");
  };

  const handleCancelRevert = () => {
    setShowConfirmModal(false);
  };

  // Only allow editing when status is ACTIVE (after revert)
  const isEditable = statusChangedToActive || form.issueStatus === "ACTIVE";

  const handleSubmit = () => {
    console.log("🟢 Will call onSave with:", form, uploadFile);

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

    onSave(form, uploadFile);
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

  // Show confirmation modal if needed
  if (showConfirmModal) {
    return (
      <ConfirmRevertModal
        open={showConfirmModal}
        onConfirm={handleConfirmRevert}
        onCancel={handleCancelRevert}
        hasFile={!!form.issueReportFile}
        fileUrl={form.issueReportFile}
      />
    );
  }

  // Utility to check if file is PDF/DOC/DOCX (for download)
  const isDownloadableFile = (url) => {
    if (!url) return false;
    return /\.(pdf|doc|docx)$/i.test(url.split("?")[0]);
  };

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
          <h2 className="modal-title">{isEditing ? "Resolved Issue" : "Resolved Issue"}</h2>

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
              Issue Title
            </label>
            <input
              id="issue-title"
              name="issueTitle"
              className="modal-input"
              value={form.issueTitle}
              onChange={handleChange}
              disabled={!isEditable || isSaving}
              style={!isEditable ? {
                backgroundColor: "#f3f4f6",
                cursor: "not-allowed",
                color: "#6b7280"
              } : {}}
            />

            {/* --- Priority & Status --- */}
            <div className="modal-flex-row">
              <div>
                <label className="modal-label" htmlFor="issue-priority">
                  Priority Level
                </label>
                <select
                  id="issue-priority"
                  name="issuePriority"
                  className="modal-input"
                  value={form.issuePriority}
                  onChange={handleChange}
                  disabled={!isEditable || isSaving}
                  style={!isEditable ? {
                    backgroundColor: "#f3f4f6",
                    cursor: "not-allowed",
                    color: "#6b7280"
                  } : {}}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option value={opt.value} key={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="modal-label" htmlFor="issue-status">
                  Status
                </label>
                <select
                  id="issue-status"
                  name="issueStatus"
                  className="modal-input"
                  value={form.issueStatus}
                  onChange={handleChange}
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
              disabled={!isEditable || isSaving}
              rows={2}
              style={!isEditable ? {
                backgroundColor: "#f3f4f6",
                cursor: "not-allowed",
                color: "#6b7280"
              } : {}}
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
                  disabled={!isEditable || isSaving}
                  style={!isEditable ? {
                    backgroundColor: "#f3f4f6",
                    cursor: "not-allowed",
                    color: "#6b7280"
                  } : {}}
                />
              </div>
            </div>

            {/* --- Resolution Details --- */}
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, margin: "18px 0 0" }}>
              <h4 style={{ color: "#16a34a", margin: 0, fontWeight: 600 }}>
                Resolution Details
              </h4>
              
              <label className="modal-label" htmlFor="resolved-by" style={{ marginTop: 6 }}>
                Who or What Group Fixed This Issue
              </label>
              <select
                id="resolved-by"
                name="resolvedByStaffId"
                className="modal-input"
                value={form.resolvedByStaffId}
                onChange={handleChange}
                disabled={!isEditable || isSaving || staffLoading}
                style={!isEditable ? {
                  backgroundColor: "#f3f4f6",
                  cursor: "not-allowed",
                  color: "#6b7280"
                } : {}}
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
                Upload New Report (PDF/DOC/DOCX)
              </label>
              <input
                id="resolution-upload"
                type="file"
                className="modal-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={!isEditable || isSaving}
              />
              {fileError && (
                <div style={{ color: "#dc2626", fontSize: 13, marginTop: 2 }}>{fileError}</div>
              )}
              {uploadFile && (
                <div style={{ marginTop: 8, color: "#16a34a", fontSize: 14 }}>
                  ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}

              {/* Download Report Button */}
              {form.issueReportFile && isDownloadableFile(form.issueReportFile) && (
                <div style={{ marginTop: 8 }}>
                  <a
                    href={form.issueReportFile}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: "#2563eb",
                      textDecoration: "underline",
                      fontWeight: 500
                    }}
                  >
                    <Download size={16} style={{ marginRight: 6 }} />
                    Download Current Report
                  </a>
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
              Close
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
              {isSaving ? "Saving..." : "Save"}
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