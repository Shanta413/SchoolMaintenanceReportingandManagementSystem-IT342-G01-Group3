import React, { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
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
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
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
    buildingCode: "",
  });
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [toast, setToast] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
        buildingCode: issue.buildingCode || "",
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

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
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

  const validateFile = (file) => {
    if (!file) return null;

    console.log("📎 [File Upload] Attempting to upload:", file.name);
    console.log("📎 [File Upload] File type:", file.type);
    console.log("📎 [File Upload] File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

    if (!ALLOWED_TYPES.includes(file.type)) {
      const errorMsg = "Only PDF, DOC, or DOCX files are allowed.";
      setFileError(errorMsg);
      showToast("error", errorMsg);
      console.log("❌ [File Upload] Invalid file type:", file.type);
      return null;
    }

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
      e.target.value = "";
      setUploadFile(null);
    }
  };

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

    if (fileError) {
      showToast("error", "Please fix file upload errors before submitting.");
      return;
    }

    onSave(form, uploadFile);
  };

  const handleCloseClick = () => {
    if (isSaving) {
      showToast("warning", "Please wait, saving in progress...");
      return;
    }
    onClose();
  };

  if (!isOpen) return null;

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

  const isDownloadableFile = (url) => {
    if (!url) return false;
    return /\.(pdf|doc|docx)$/i.test(url.split("?")[0]);
  };

  // Extract filename from URL (fallback if backend doesn't provide filename)
  const getFileNameFromUrl = (url) => {
    if (!url) return "Report";
    try {
      const urlPath = url.split("?")[0];
      const filename = urlPath.substring(urlPath.lastIndexOf("/") + 1);
      return decodeURIComponent(filename) || "Report";
    } catch {
      return "Report";
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-container toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="modal-backdrop">
        <div className="modal-box modal-box-wide">
          <h2 className="modal-title">Resolved Issue</h2>

          <div className="modal-two-column">
            {/* LEFT COLUMN */}
            <div className="modal-column-left">
              {/* Issue Title */}
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input
                  name="issueTitle"
                  className="form-input"
                  value={form.issueTitle}
                  onChange={handleChange}
                  disabled={!isEditable || isSaving}
                  style={!isEditable ? {
                    backgroundColor: "#f3f4f6",
                    cursor: "not-allowed",
                    color: "#6b7280"
                  } : {}}
                />
              </div>

              {/* Priority and Status Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority Level</label>
                  <select
                    name="issuePriority"
                    className="form-input"
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
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="issueStatus"
                    className="form-input"
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

              {/* Building Location */}
              <div className="form-group">
                <label className="form-label">Building / Location</label>
                <input
                  className="form-input form-input-disabled"
                  value={form.buildingCode || form.issueLocation}
                  disabled
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="issueDescription"
                  className="form-input form-textarea"
                  value={form.issueDescription}
                  onChange={handleChange}
                  rows={3}
                  disabled={!isEditable || isSaving}
                  style={!isEditable ? {
                    backgroundColor: "#f3f4f6",
                    cursor: "not-allowed",
                    color: "#6b7280"
                  } : {}}
                />
              </div>

              {/* Exact Location */}
              <div className="form-group">
                <label className="form-label">Exact Location</label>
                <input
                  name="exactLocation"
                  className="form-input"
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

            {/* RIGHT COLUMN */}
            <div className="modal-column-right">
              {/* Issue Photo Section */}
              {issue.issuePhotoUrl && (
                <div className="issue-photo-section">
                  <div className="issue-photo-label">📷 ISSUE PHOTO</div>
                  <img
                    src={issue.issuePhotoUrl}
                    alt="Issue"
                    className="issue-photo-img"
                    onClick={() => setShowPhoto(true)}
                  />
                  <div className="issue-photo-caption">Click to view full size</div>
                </div>
              )}

              {/* Resolution Details Section */}
              <div className="resolution-section">
                <div className="resolution-header">
                  <div className="resolution-checkmark">✓</div>
                  <h4 className="resolution-title">Resolution Details</h4>
                </div>

                {/* Show resolved by info (read-only display) */}
                {!isEditable && issue.resolvedByName && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ 
                      fontSize: "0.85rem", 
                      color: "#16a34a", 
                      fontWeight: 600,
                      marginBottom: 4 
                    }}>
                      Resolved By:
                    </div>
                    <div style={{
                      padding: "10px 12px",
                      background: "#f0fdf4",
                      borderRadius: 6,
                      fontSize: "0.95rem",
                      color: "#166534",
                      fontWeight: 500
                    }}>
                      {issue.resolvedByName}
                    </div>
                  </div>
                )}

                {/* Current Resolution File */}
                {!isEditable && (issue.resolutionFileUrl || form.issueReportFile) && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ 
                      fontSize: "0.85rem", 
                      color: "#16a34a", 
                      fontWeight: 600,
                      marginBottom: 4 
                    }}>
                      Resolution Report:
                    </div>
                    <a
                      href={issue.resolutionFileUrl || form.issueReportFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        background: "#f0fdf4",
                        borderRadius: 6,
                        color: "#16a34a",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        border: "1px solid #bbf7d0",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#dcfce7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f0fdf4";
                      }}
                    >
                      <Download size={16} />
                      {issue.resolutionFileName || getFileNameFromUrl(issue.resolutionFileUrl || form.issueReportFile)}
                    </a>
                  </div>
                )}

                {/* Only show editable fields when status is changed to ACTIVE */}
                {isEditable && (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        Who or What Group Fixed This Issue
                      </label>
                      <select
                        name="resolvedByStaffId"
                        className="form-input"
                        value={form.resolvedByStaffId}
                        onChange={handleChange}
                        disabled={isSaving || staffLoading}
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
                    </div>

                    <div className="form-group">
                      <label className="form-label">Upload New Report (PDF/DOC/DOCX)</label>
                      <input
                        type="file"
                        className="form-input form-file-input"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        disabled={isSaving}
                      />
                      {fileError && <div className="file-error">{fileError}</div>}
                      {uploadFile && (
                        <div className="file-success">
                          ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button 
              className="btn btn-cancel"
              onClick={handleCloseClick}
              disabled={isSaving}
            >
              Close
            </button>
            <button 
              className="btn btn-submit"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 size={16} className="spinner" />}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhoto && (
        <div className="photo-modal-backdrop" onClick={() => setShowPhoto(false)}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <button
              className="photo-modal-close"
              onClick={() => setShowPhoto(false)}
            >
              ×
            </button>
            <img
              src={issue.issuePhotoUrl}
              alt="Issue"
              className="photo-modal-img"
            />
          </div>
        </div>
      )}
    </>
  );
}