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
    setForm((prev) => ({ ...prev, [name]: value }));
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
        <div className={`toast-container toast-${toast.type}`}>
          {toast.message}
        </div>
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

                <a
                  href="https://docs.google.com/document/d/1iE7c7MKJDMSBsEBorRmOHl_R8SpuI04YTF0eq1DQLVw/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sample-report-link"
                >
                  📄 View Sample Report Format
                </a>

                {/* Existing Resolution File Link */}
                {issue.resolutionFileUrl && (
                  <a
                    href={issue.resolutionFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="existing-report-link"
                  >
                    📄 View Existing Resolution Report
                  </a>
                )}

                <div className="form-group">
                  <label className="form-label">
                    Who or What Group Fixed This Issue{" "}
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

                <div className="form-group">
                  <label className="form-label">Upload Report (PDF/DOC/DOCX)</label>
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