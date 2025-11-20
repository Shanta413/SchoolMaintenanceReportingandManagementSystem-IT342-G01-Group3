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
  { value: "FIXED", label: "Resolved" }, // Backend value is FIXED, label is Resolved
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

  // Initialize fields when modal opens
  useEffect(() => {
    if (isOpen) {
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
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

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

  return (
    <div className="modal-backdrop">
      <div className="modal-box" style={{ minWidth: 540, maxWidth: 640 }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X />
        </button>
        <h2 className="modal-title">{isEditing ? "Edit Issue" : "Resolve Issue"}</h2>
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
              Upload Report (optional)
            </label>
            <input
              id="resolution-upload"
              type="file"
              className="modal-input"
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              disabled={form.issueStatus !== "FIXED"}
            />
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
