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

/* ---------------------------------------------
   CONFIRM REVERT MODAL
------------------------------------------------ */
function ConfirmRevertModal({ open, onConfirm, onCancel, hasFile, fileUrl }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 1500 }}>
      <div className="modal-box" style={{ minWidth: 340, maxWidth: 400 }}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <h3 style={{ marginBottom: 10, color: "#b91c1c" }}>Revert to Active?</h3>
          <p style={{ fontSize: 15, color: "#475569" }}>
            Reverting to <b>Active</b> will remove:
            <br />
            <b>— Resolver</b>
            <br />
            <b>— Reported file</b>
          </p>

          {hasFile && (
            <div style={{ margin: "10px 0", color: "#dc2626", fontWeight: 500 }}>
              Download the resolution file first!
              <br />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  marginTop: 4,
                  fontSize: "1rem",
                  textDecoration: "underline",
                  color: "#2563eb",
                }}
              >
                <Download size={16} style={{ marginRight: 6 }} />
                Download Report
              </a>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn-delete" onClick={onConfirm}>Revert</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
   MAIN MODAL COMPONENT
------------------------------------------------ */
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
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [statusChangedToActive, setStatusChangedToActive] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [toast, setToast] = useState(null);

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

  /* ---------------------------------------------
     LOAD ISSUE + STAFF WHEN OPENED
  ------------------------------------------------ */
  useEffect(() => {
    if (!isOpen) return;

    console.log("📋 [MODAL] Incoming issue:", issue);

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
    setShowConfirmModal(false);
    setStatusChangedToActive(false);

    /* Load Staff */
    setStaffLoading(true);
    getAllStaff()
      .then(arr => setStaffList(arr || []))
      .catch(err => {
        console.error("❌ Failed to load staff:", err);
        showToast("error", "Failed to load staff list");
      })
      .finally(() => setStaffLoading(false));
  }, [isOpen, issue]);

  /* ---------------------------------------------
     UTILS
  ------------------------------------------------ */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const validateFile = (file) => {
    if (!file) return null;

    console.log("📎 File:", file.name);

    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast("error", "Only PDF, DOC, or DOCX allowed");
      return null;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("error", "Max file size is 10MB");
      return null;
    }

    return file;
  };

  /* ---------------------------------------------
     CHANGE HANDLERS
  ------------------------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "issueStatus" && form.issueStatus === "FIXED" && value === "ACTIVE") {
      setShowConfirmModal(true);
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "issueStatus") setStatusChangedToActive(value === "ACTIVE");
  };

  const handleFileChange = (e) => {
    const f = validateFile(e.target.files?.[0]);
    if (!f) {
      e.target.value = "";
      setUploadFile(null);
      return;
    }

    setUploadFile(f);
    showToast("success", `"${f.name}" ready`);
  };

  const handleConfirmRevert = () => {
    setForm(prev => ({
      ...prev,
      issueStatus: "ACTIVE",
      resolvedByStaffId: "",
      issueReportFile: null
    }));
    setUploadFile(null);
    setShowConfirmModal(false);
    setStatusChangedToActive(true);
    showToast("warning", "Reverted to Active. Resolver + File removed.");
  };

  const handleSubmit = () => {
    if (!form.issueTitle || !form.issuePriority) {
      showToast("error", "Please fill required fields");
      return;
    }

    if (form.issueStatus === "FIXED" && !form.resolvedByStaffId) {
      showToast("error", "Select who resolved this");
      return;
    }

    onSave(form, uploadFile);
  };

  if (!isOpen) return null;

  if (showConfirmModal) {
    return (
      <ConfirmRevertModal
        open={showConfirmModal}
        onConfirm={handleConfirmRevert}
        onCancel={() => setShowConfirmModal(false)}
        hasFile={!!form.issueReportFile}
        fileUrl={form.issueReportFile}
      />
    );
  }

  const isEditable = statusChangedToActive || form.issueStatus === "ACTIVE";

  /* ---------------------------------------------
     UI
  ------------------------------------------------ */
  return (
    <>
      {toast && (
        <div className={`toast-container toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <div className="modal-backdrop">
        <div className="modal-box modal-box-wide">
          <h2 className="modal-title">Resolved Issue</h2>

          <div className="modal-two-column">
            {/* LEFT SIDE */}
            <div className="modal-column-left">

              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input
                  name="issueTitle"
                  value={form.issueTitle}
                  onChange={handleChange}
                  className="form-input"
                  disabled={!isEditable || isSaving}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    name="issuePriority"
                    value={form.issuePriority}
                    onChange={handleChange}
                    className="form-input"
                    disabled={!isEditable || isSaving}
                  >
                    {PRIORITY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="issueStatus"
                    value={form.issueStatus}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isSaving}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="issueDescription"
                  value={form.issueDescription}
                  onChange={handleChange}
                  rows={3}
                  className="form-input form-textarea"
                  disabled={!isEditable || isSaving}
                />
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="modal-column-right">
              <div className="resolution-section">
                <h4 className="resolution-title">Resolution Details</h4>

                {!isEditable && issue.resolvedByName && (
                  <div className="resolved-box">{issue.resolvedByName}</div>
                )}

                {!isEditable && form.issueReportFile && (
                  <a
                    href={form.issueReportFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resolved-file-link"
                  >
                    <Download size={14} />
                    Download File
                  </a>
                )}

                {isEditable && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Resolved By</label>
                      <select
                        name="resolvedByStaffId"
                        className="form-input"
                        disabled={isSaving || staffLoading}
                        value={form.resolvedByStaffId}
                        onChange={handleChange}
                      >
                        <option value="">
                          {staffLoading ? "Loading..." : "Select staff"}
                        </option>
                        {staffList.map(staff => (
                          <option key={staff.id} value={staff.userId}>
                            {staff.fullname} ({staff.staffId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Upload Report</label>
                      <input
                        type="file"
                        className="form-input form-file-input"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        disabled={isSaving}
                      />
                      {uploadFile && (
                        <div className="file-success">✓ {uploadFile.name}</div>
                      )}
                      {fileError && <div className="file-error">{fileError}</div>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-cancel" disabled={isSaving} onClick={onClose}>
              Close
            </button>
            <button className="btn btn-submit" disabled={isSaving} onClick={handleSubmit}>
              {isSaving && <Loader2 size={16} className="spinner" />}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>

        </div>
      </div>

      {showPhoto && (
        <div className="photo-modal-backdrop" onClick={() => setShowPhoto(false)}>
          <div className="photo-modal-content" onClick={e => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setShowPhoto(false)}>×</button>
            <img src={issue.issuePhotoUrl} alt="Issue" className="photo-modal-img" />
          </div>
        </div>
      )}
    </>
  );
}
