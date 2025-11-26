import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
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
  });
  const [staffList, setStaffList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);

  // For confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // If user sets back to ACTIVE, fields become editable again
  const [statusChangedToActive, setStatusChangedToActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        issueTitle: issue.issueTitle || "",
        issueDescription: issue.issueDescription || "",
        issuePriority: issue.issuePriority || "MEDIUM",
        issueStatus: issue.issueStatus || "FIXED",
        issueLocation: issue.issueLocation || "",
        exactLocation: issue.exactLocation || "",
        resolvedByStaffId: issue.resolvedById || "",
        issueReportFile: issue.issueReportFile || null,
      });
      setUploadFile(null);
      setStatusChangedToActive(false);
      setShowConfirmModal(false);
      getAllStaff().then(staffArr => setStaffList(staffArr || []));
    }
    // eslint-disable-next-line
  }, [isOpen, issue]);

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
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
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
  };
  const handleCancelRevert = () => {
    setShowConfirmModal(false);
  };

  // Only allow editing when status is ACTIVE (after revert)
  const isEditable = statusChangedToActive || form.issueStatus === "ACTIVE";

  const handleSubmit = () => {
    if (!form.issueTitle || !form.issuePriority || !form.issueStatus) {
      alert("Please fill all required fields (title, priority, status)");
      return;
    }
    if (form.issueStatus === "FIXED" && !form.resolvedByStaffId) {
      alert("Select the staff/group who resolved the issue.");
      return;
    }
    onSave({
      ...form,
      uploadFile,
    });
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
    <div className="modal-backdrop">
      <div className="modal-box" style={{ minWidth: 540, maxWidth: 640 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X />
        </button>
        <h2 className="modal-title">{isEditing ? "Resolved Issue" : "Resolved Issue"}</h2>

        {/* View Issue Photo Button */}
        {issue.issuePhotoUrl && (
          <div style={{ marginBottom: 10 }}>
            <a
              href={issue.issuePhotoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#2563eb",
                textDecoration: "underline",
                fontSize: "1rem"
              }}
            >
              View Issue Photo
            </a>
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
            disabled={!isEditable}
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
                disabled={!isEditable}
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
            disabled={!isEditable}
            rows={2}
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
                value={form.issueLocation}
                onChange={handleChange}
                disabled={!isEditable}
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
                disabled={!isEditable}
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
              disabled={!isEditable}
            >
              <option value="">Select staff/group</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.userId}>
                  {staff.fullname} ({staff.staffId})
                </option>
              ))}
            </select>

            <label className="modal-label" htmlFor="resolution-upload" style={{ marginTop: 10 }}>
              Upload Report (optional)
            </label>
            <input
              id="resolution-upload"
              type="file"
              className="modal-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              disabled={!isEditable}
            />

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
                  Download Report
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 18 }}>
          {isEditing && (
            <button className="modal-btn modal-btn-danger" onClick={onDelete}>
              Delete Issue
            </button>
          )}
          <button className="modal-btn modal-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
