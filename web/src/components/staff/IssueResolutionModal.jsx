import React, { useEffect, useState } from "react";
import { Loader2, Download } from "lucide-react";
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

// Confirmation Modal for Reverting to Active
function ConfirmRevertModal({ open, onConfirm, onCancel, hasFile, fileUrl }) {
  if (!open) return null;
  
  return (
    <div className="modal-backdrop" style={{ zIndex: 1500 }}>
      <div className="modal-box" style={{ minWidth: 340, maxWidth: 450 }}>
        <div style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 16, color: "#b91c1c", textAlign: "center", fontSize: "1.25rem" }}>
            ⚠️ Revert to Active Status?
          </h3>
          <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Changing the status back to <strong>Active</strong> will permanently remove:
          </p>
          <ul style={{ 
            marginTop: 12, 
            marginBottom: 16, 
            paddingLeft: 24, 
            color: "#64748b",
            fontSize: "0.9rem" 
          }}>
            <li>The assigned resolver</li>
            <li>The resolution report file</li>
            <li>The completion timestamp</li>
          </ul>
          {hasFile && (
            <div style={{ 
              margin: "16px 0", 
              padding: 12, 
              background: "#fef2f2",
              borderRadius: 8,
              border: "1px solid #fecaca"
            }}>
              <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 8, fontSize: "0.9rem" }}>
                📥 Download the report before proceeding!
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#2563eb",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: 500
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                <Download size={16} />
                Download Report Now
              </a>
            </div>
          )}
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: 12, 
          padding: "0 20px 20px",
          borderTop: "1px solid #e2e8f0",
          paddingTop: 16
        }}>
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
            Yes, Revert to Active
          </button>
        </div>
      </div>
    </div>
  );
}

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
    buildingCode: "",
  });
  
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [originalStatus, setOriginalStatus] = useState("ACTIVE");

  useEffect(() => {
    if (isOpen) {
      console.log("📋 Issue object from props (API):", issue);

      const initialStatus = issue.issueStatus || "ACTIVE";
      setOriginalStatus(initialStatus);

      setForm({
        issueTitle: issue.issueTitle || "",
        issueDescription: issue.issueDescription || "",
        issuePriority: issue.issuePriority || "MEDIUM",
        issueStatus: initialStatus,
        issueLocation: issue.issueLocation || "",
        exactLocation: issue.exactLocation || "",
        resolvedByStaffId: issue.resolvedById || "",
        buildingCode: issue.buildingCode || "",
      });
      
      setUploadFile(null);
      setFileError("");
      setToast(null);
      setShowConfirmModal(false);

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
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for status change from FIXED to ACTIVE
    if (name === "issueStatus") {
      if (originalStatus === "FIXED" && value === "ACTIVE") {
        setShowConfirmModal(true);
        return;
      }
    }
    
    setForm((prev) => ({ ...prev, [name]: value }));
    console.log(`[Form Change] ${name}:`, value);
  };

  const handleConfirmRevert = () => {
    setForm((prev) => ({
      ...prev,
      issueStatus: "ACTIVE",
      resolvedByStaffId: "",
    }));
    setUploadFile(null);
    setShowConfirmModal(false);
    setOriginalStatus("ACTIVE");
    showToast("warning", "Status reverted to Active. Resolver and file will be removed on save.");
  };

  const handleCancelRevert = () => {
    setShowConfirmModal(false);
    // Reset status back to original
    setForm((prev) => ({ ...prev, issueStatus: originalStatus }));
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

    if (form.issueStatus === "FIXED" && !uploadFile && !issue.resolutionFileUrl) {
      const confirmSubmit = window.confirm(
        "No resolution report uploaded. Are you sure you want to continue?"
      );
      if (!confirmSubmit) return;
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

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-container toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Confirm Revert Modal */}
      {showConfirmModal && (
        <ConfirmRevertModal
          open={showConfirmModal}
          onConfirm={handleConfirmRevert}
          onCancel={handleCancelRevert}
          hasFile={!!issue.resolutionFileUrl}
          fileUrl={issue.resolutionFileUrl}
        />
      )}

      <div className="modal-backdrop">
        <div className="modal-box modal-box-wide">
          <h2 className="modal-title">
            {isEditing ? "Edit Issue" : "Resolve Issue"}
          </h2>

          <div className="modal-two-column">
            {/* LEFT COLUMN */}
            <div className="modal-column-left">
              {/* Issue Title */}
              <div className="form-group">
                <label className="form-label">
                  Issue Title <span className="required">*</span>
                </label>
                <input
                  name="issueTitle"
                  className="form-input"
                  value={form.issueTitle}
                  onChange={handleChange}
                  placeholder="Enter issue title"
                  disabled={isSaving}
                />
              </div>

              {/* Priority and Status Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Priority Level <span className="required">*</span>
                  </label>
                  <select
                    name="issuePriority"
                    className="form-input"
                    value={form.issuePriority}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option value={opt.value} key={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Status <span className="required">*</span>
                  </label>
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
                  placeholder="Describe the issue..."
                  rows={3}
                  disabled={isSaving}
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
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="modal-column-right">
              {/* Issue Photo Section */}
              {issue.issuePhotoUrl && (
                <div className="issue-photo-section">
                  <div className="issue-photo-label">📷 Issue Photo</div>
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

                {/* Resolved By Dropdown - THIS WAS MISSING */}
                <div className="form-group">
                  <label className="form-label">
                    Resolved By{" "}
                    {form.issueStatus === "FIXED" && <span className="required">*</span>}
                  </label>
                  <select
                    name="resolvedByStaffId"
                    className="form-input"
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
                </div>

                {/* File Upload */}
                <div className="form-group">
                  <label className="form-label">
                    Upload Report{" "}
                    {form.issueStatus === "FIXED" && <span className="required">*</span>}
                  </label>
                  <input
                    type="file"
                    className="form-input form-file-input"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    disabled={form.issueStatus !== "FIXED" || isSaving}
                  />
                  {fileError && <div className="file-error">{fileError}</div>}
                  {uploadFile && (
                    <div className="file-success">
                      ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                {/* Existing Resolution File Link */}
                {issue.resolutionFileUrl && (
                  <a
                    href={issue.resolutionFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="existing-report-link"
                  >
                    <Download size={16} />
                    View Current Report
                  </a>
                )}

                <a
                  href="https://docs.google.com/document/d/1iE7c7MKJDMSBsEBorRmOHl_R8SpuI04YTF0eq1DQLVw/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sample-report-link"
                >
                  📄 View Sample Report Format
                </a>
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
              Cancel
            </button>
            <button 
              className="btn btn-submit"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 size={16} className="spinner" />}
              {isSaving ? "Saving..." : "Submit"}
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