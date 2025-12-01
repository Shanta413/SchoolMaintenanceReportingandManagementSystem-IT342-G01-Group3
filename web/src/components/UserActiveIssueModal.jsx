// src/components/UserActiveIssueModal.jsx
import React from "react";
import { X, Calendar, User, MapPin, FileImage } from "lucide-react";
import "../css/components_css/UserActiveIssueModal.css"; // Use your real path

export default function UserActiveIssueModal({
  issue,
  currentUserId,
  onClose,
  onEdit
}) {
  if (!issue) return null;

  // ADD THESE DEBUG LINES:
  console.log("Full issue object:", issue);
  console.log("Current User ID:", currentUserId);
  console.log("Issue reportedByUserId:", issue.reportedByUserId);
  console.log("Issue reportedById:", issue.reportedById);
  console.log("Issue reportedBy:", issue.reportedBy);
  console.log("Issue studentId:", issue.studentId);

  
  // Try all likely field names for reporter ID
  const reportedById =
    issue.reportedByUserId ||
    issue.reportedById ||
    issue.reportedBy ||
    issue.studentId;

      
  console.log("Resolved reportedById:", reportedById);
  console.log("Match?", String(currentUserId) === String(reportedById));

  // Helper for showing issue status
  const statusDisplay = (status) => {
    if (!status) return "Unknown";
    const s = status.toUpperCase();
    if (s === "FIXED") return "Resolved";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  // Priority styles
  const getPriorityStyles = (priority) => {
    switch ((priority || "").toUpperCase()) {
      case "HIGH":
        return { bg: "#fef2f2", color: "#dc2626" };
      case "MEDIUM":
        return { bg: "#fff7ed", color: "#ea580c" };
      case "LOW":
        return { bg: "#f0fdf4", color: "#16a34a" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const priorityStyles = getPriorityStyles(issue.issuePriority);

  return (
    <div className="user-issue-modal-overlay" onClick={onClose}>
      <div
        className="user-issue-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={0}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        <div className="user-issue-modal-header">
          <h2>{issue.issueTitle}</h2>
          <span
            className="priority-badge"
            style={{
              background: priorityStyles.bg,
              color: priorityStyles.color,
              fontWeight: 600,
              borderRadius: "8px",
              padding: "3px 14px",
              marginLeft: "10px",
              fontSize: "0.93rem",
            }}
          >
            {issue.issuePriority}
          </span>
        </div>

        <div className="user-issue-meta">
          <div>
            <User size={16} /> Reported by:{" "}
            <b>{issue.reportedByName || "Unknown"}</b>
          </div>
          <div>
            <Calendar size={16} />{" "}
            {issue.issueCreatedAt
              ? new Date(issue.issueCreatedAt).toLocaleDateString()
              : "—"}
          </div>
          <div>
            <MapPin size={16} /> {issue.issueLocation}{" "}
            {issue.exactLocation ? (
              <>
                {" - "}
                <span style={{ fontStyle: "italic" }}>
                  {issue.exactLocation}
                </span>
              </>
            ) : null}
          </div>
          <div>
            <b>Status:</b> {statusDisplay(issue.issueStatus)}
          </div>
        </div>

        <div className="user-issue-desc">
          <b>Description:</b>
          <p style={{ marginTop: 4 }}>{issue.issueDescription}</p>
        </div>

        {/* Image Preview if exists */}
        {issue.issuePhotoUrl && (
          <div className="user-issue-img">
            <FileImage size={18} style={{ marginBottom: -2, marginRight: 5 }} />
            <a href={issue.issuePhotoUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={issue.issuePhotoUrl}
                alt="Issue"
                style={{
                  maxWidth: "100%",
                  maxHeight: 200,
                  borderRadius: 8,
                  marginTop: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
            </a>
          </div>
        )}

        <div className="user-issue-modal-actions">
          <button className="modal-close-btn-2" onClick={onClose}>
            Close
          </button>

          {/* Only show Edit if user is reporter */}
          {String(currentUserId) === String(reportedById) && (
            <button className="modal-edit-btn" onClick={onEdit}>
              Edit Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
