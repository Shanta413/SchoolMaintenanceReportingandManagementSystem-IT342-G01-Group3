import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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

  // ===========================
  // INITIALIZE DATA
  // ===========================
  useEffect(() => {
    if (!isOpen) return;

    console.log("📋 Issue object from props:", issue);

    setForm({
      issueTitle: issue.issueTitle || "",
      issueDescription: issue.issueDescription || "",
      issuePriority: issue.issuePriority || "MEDIUM",
      issueStatus: issue.issueStatus || "ACTIVE",
      issueLocation: issue.issueLocation || "",
      exactLocation: issue.exactLocation || "",
      resolvedByStaffId: issue.resolvedById || "",
      buildingCode: issue.buildingCode || "",
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
      .finally(() => setStaffLoading(false));

  }, [isOpen, issue]);

  // ===========================
  // UTIL
  // ===========================
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[Form Change] ${name}: ${value}`);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ===========================
  // VALIDATE FILE
  // ===========================
  const validateFile = (file) => {
    if (!file) return null;

    console.log("📎 File:", file.name, file.type, file.size);

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("error", "Only PDF, DOC, or DOCX files are allowed");
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "Max file size is 10MB");
      return null;
    }

    return file;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const valid = validateFile(file);

    if (valid) {
      setUploadFile(valid);
      setFileError("");
      showToast("success", `File "${valid.name}" ready to upload`);
    } else {
      e.target.value = "";
      setUploadFile(null);
    }
  };

  // ===========================
  // SUBMIT
  // ===========================
  const handleSubmit = () => {
    console.log("🟢 SUBMITTING ISSUE");
    console.log("Form:", form);
    console.log("File:", uploadFile);

    if (!form.issueTitle || !form.issuePriority || !form.issueStatus) {
      showToast("error", "Please fill all required fields");
      return;
    }

    if (form.issueStatus === "FIXED" && !form.resolvedByStaffId) {
      showToast("error", "Select the staff/group that fixed the issue");
      return;
    }

    if (fileError) {
      showToast("error", "Please fix upload errors");
      return;
    }

    console.log("📤 Calling onSave...");
    onSave(form, uploadFile);
  };

  const handleDeleteClick = () => {
    if (!isDeleting) onDelete();
  };

  const handleCloseClick = () => {
    if (!isSaving) onClose();
  };

  if (!isOpen) return null;

  // ===========================
  // RENDER UI
  // ===========================
  return (
    <>
      {toast && (
        <div className={`toast-container toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="modal-backdrop">
        <div className="modal-box modal-box-wide">
          <h2 className="modal-title">{isEditing ? "Edit Issue" : "Resolve Issue"}</h2>

          <div className="modal-two-column">

            {/* LEFT SIDE */}
            <div className="modal-column-left">
              <div className="form-group">
                <label className="form-label">
                  Issue Title <span className="required">*</span>
                </label>

                <input
                  name="issueTitle"
                  className="form-input"
                  value={form.issueTitle}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Enter issue title"
                />
              </div>

              {/* PRIORITY + STATUS */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority <span className="required">*</span></label>
                  <select
                    name="issuePriority"
                    className="form-input"
                    value={form.issuePriority}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status <span className="required">*</span></label>
                  <select
                    name="issueStatus"
                    className="form-input"
                    value={form.issueStatus}
                    onChange={handleChange}
                    disabled={isSaving}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="issueDescription"
                  className="form-input"
                  rows={3}
                  value={form.issueDescription}
                  disabled={isSaving}
                  placeholder="Describe the issue"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Exact Location</label>
                <input
                  name="exactLocation"
                  className="form-input"
                  value={form.exactLocation}
                  onChange={handleChange}
                  placeholder="Example: 2nd Floor - Room 204"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="modal-column-right">
              {issue.issuePhotoUrl && (
                <div className="issue-photo-section">
                  <div className="issue-photo-label">📸 Issue Photo</div>
                  <img
                    src={issue.issuePhotoUrl}
                    alt="Issue"
                    className="issue-photo-img"
                    onClick={() => setShowPhoto(true)}
                  />
                </div>
              )}

              <div className="resolution-section">
                <h4 className="resolution-title">Resolution Details</h4>

                {/* FILE UPLOAD */}
                <div className="form-group">
                  <label className="form-label">
                    Upload Report {form.issueStatus === "FIXED" && <span className="required">*</span>}
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={handleFileChange}
                    disabled={form.issueStatus !== "FIXED" || isSaving}
                  />
                </div>

                {fileError && <div className="file-error">{fileError}</div>}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-cancel" onClick={handleCloseClick} disabled={isSaving}>
              Cancel
            </button>
            <button className="btn btn-submit" onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 size={16} className="spinner" />}
              {isSaving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      </div>

      {/* PHOTO PREVIEW */}
      {showPhoto && (
        <div className="photo-modal-backdrop" onClick={() => setShowPhoto(false)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setShowPhoto(false)}>×</button>
            <img src={issue.issuePhotoUrl} alt="Issue" className="photo-modal-img" />
          </div>
        </div>
      )}
    </>
  );
}
