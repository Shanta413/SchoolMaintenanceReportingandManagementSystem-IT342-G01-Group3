import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getAllStaff } from "../../api/staff";
import "../../css/IssueResolutionModal.css";

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "High Priority" },
  { value: "MEDIUM", label: "Medium Priority" },
  { value: "LOW", label: "Low Priority" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "FIXED", label: "Resolved" }, // Backend value is FIXED
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
}) {
  const [form, setForm] = useState({
    issueTitle: "",
    issueDescription: "",
    issuePriority: "MEDIUM",
    issueStatus: "ACTIVE",
    issueLocation: "",
    exactLocation: "",
    resolvedByStaffId: "",
  });
  const [staffList, setStaffList] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [showPhoto, setShowPhoto] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Debug: show full issue object from parent/API
      console.log("Issue object from props (API):", issue);

      setForm({
        issueTitle: issue.issueTitle || "",
        issueDescription: issue.issueDescription || "",
        issuePriority: issue.issuePriority || "MEDIUM",
        issueStatus: issue.issueStatus || "ACTIVE",
        issueLocation: issue.issueLocation || "",
        exactLocation: issue.exactLocation || "",
        resolvedByStaffId: issue.resolvedByStaffId || "",
      });
      setUploadFile(null);
      setFileError("");
      getAllStaff().then(staffArr => {
        // Debug: see what staff the API is giving you
        console.log("Staff List from API:", staffArr);
        setStaffList(staffArr || []);
      });
    }
  }, [isOpen, issue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Debug: Log every change in form
    console.log(`[Form Change] ${name}:`, value);
  };

  // Only accept PDF, DOC, DOCX
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log("[File Upload] Attempting to upload:", file);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Only PDF, DOC, or DOCX files allowed.");
      setUploadFile(null);
      console.log("[File Upload] Invalid file type:", file.type);
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setFileError("Max file size is 10MB.");
      setUploadFile(null);
      console.log("[File Upload] File too large:", file.size);
      return;
    }
    setUploadFile(file);
    setFileError("");
    console.log("[File Upload] File accepted:", file);
  };

  const handleSubmit = () => {
    // 🟢 DEBUG: Log what you're about to send to the API
    console.log("🟢 Will call onSave with:", form, uploadFile);

    if (!form.issueTitle || !form.issuePriority || !form.issueStatus) {
      alert("Please fill all required fields (title, priority, status)");
      return;
    }
    if (form.issueStatus === "FIXED" && !form.resolvedByStaffId) {
      alert("Select the staff/group who resolved the issue.");
      return;
    }
    onSave(form, uploadFile); // Pass as separate arguments!
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ minWidth: 540, maxWidth: 640 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
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
              View Issue Photo
            </button>
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
                placeholder="e.g., SAL Building"
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
              />
            </div>
          </div>

          {/* --- Resolution Details --- */}
          <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 12, margin: "18px 0 0" }}>
            <h4 style={{ color: "#16a34a", margin: 0, fontWeight: 600 }}>
              Resolution Details
            </h4>
            {/* 👇 Sample Report Format link here */}
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
              disabled={form.issueStatus !== "FIXED"}
            >
              <option value="">Select staff/group</option>
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
              disabled={form.issueStatus !== "FIXED"}
            />
            {fileError && (
              <div style={{ color: "#dc2626", fontSize: 13, marginTop: 2 }}>{fileError}</div>
            )}
            {uploadFile && (
              <div style={{ marginTop: 8, color: "#16a34a" }}>
                {uploadFile.name}
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
            Cancel
          </button>
          <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
