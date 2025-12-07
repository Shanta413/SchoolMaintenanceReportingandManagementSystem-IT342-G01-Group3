// src/components/UserActiveIssueModal.jsx
import React from "react";
import "../css/components_css/UserActiveIssueModal.css";

export default function UserActiveIssueModal({
  issue,
  currentUserId,
  onClose,
  onEdit
}) {
  if (!issue) return null;

  console.log("Full issue object:", issue);
  console.log("Current User ID:", currentUserId);

  const reportedById =
    issue.reportedByUserId ||
    issue.reportedById ||
    issue.reportedBy ||
    issue.studentId;

  console.log("Resolved reportedById:", reportedById);
  console.log("Match? ", String(currentUserId) === String(reportedById));

  const statusDisplay = (status) => {
    if (!status) return "Unknown";
    const s = status.toUpperCase();
    if (s === "FIXED") return "Resolved";
    if (s === "IN_PROGRESS" || s === "INPROGRESS") return "In Progress";
    if (s === "PENDING") return "Pending";
    return s.charAt(0) + s.slice(1).toLowerCase();
  };

  const getStatusStyles = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "RESOLVED" || s === "FIXED") {
      return { border: "#22c55e", color: "#16a34a", bg: "#f0fdf4" };
    }
    if (s === "IN_PROGRESS" || s === "INPROGRESS") {
      return { border: "#3b82f6", color: "#2563eb", bg: "#eff6ff" };
    }
    if (s === "PENDING") {
      return { border: "#f97316", color: "#ea580c", bg: "#fff7ed" };
    }
    return { border: "#9ca3af", color: "#6b7280", bg: "#f9fafb" };
  };

  const getPriorityStyles = (priority) => {
    switch ((priority || "").toUpperCase()) {
      case "HIGH":
        return { border: "#ef4444", color: "#dc2626", bg: "#fef2f2" };
      case "MEDIUM":
        return { border: "#f97316", color: "#ea580c", bg: "#fff7ed" };
      case "LOW":
        return { border: "#22c55e", color: "#16a34a", bg: "#f0fdf4" };
      default:
        return { border: "#9ca3af", color: "#6b7280", bg: "#f9fafb" };
    }
  };

  const priorityStyles = getPriorityStyles(issue.issuePriority);
  const statusStyles = getStatusStyles(issue.issueStatus);
  const isReporter = String(currentUserId) === String(reportedById);

  return (
    <div className="user-issue-modal-overlay" onClick={onClose}>
      <div className="user-issue-modal" onClick={(e) => e.stopPropagation()}>
        {/* Title and Priority */}
        <div className="modal-title-section">
          <h2 className="modal-title">{issue.issueTitle}</h2>
          <span
            className="priority-badge-pill"
            style={{
              borderColor: priorityStyles.border,
              color: priorityStyles.color,
              backgroundColor: priorityStyles.bg
            }}
          >
            {issue.issuePriority}
          </span>
        </div>

        {/* 2x2 Info Grid */}
        <div className="modal-meta-grid">
          {/* Reported By */}
          <div className="modal-meta-item">
            <svg className="meta-icon-svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div className="meta-text">
              <div className="meta-label">REPORTED BY</div>
              <div className="meta-value">{issue.reportedByName || "Unknown"}</div>
            </div>
          </div>

          {/* Date */}
          <div className="modal-meta-item">
            <svg className="meta-icon-svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <div className="meta-text">
              <div className="meta-label">DATE</div>
              <div className="meta-value">
                {issue.issueCreatedAt
                  ? new Date(issue.issueCreatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })
                  : "—"}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="modal-meta-item">
            <svg className="meta-icon-svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div className="meta-text">
              <div className="meta-label">LOCATION</div>
              <div className="meta-value">
                {issue.issueLocation}
                {issue.exactLocation && (
                  <span className="location-detail"> — {issue.exactLocation}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="modal-meta-item">
            <svg className="meta-icon-svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <div className="meta-text">
              <div className="meta-label">STATUS</div>
              <span
                className="status-badge-outline"
                style={{
                  borderColor: statusStyles.border,
                  color: statusStyles.color,
                  backgroundColor: statusStyles.bg
                }}
              >
                {statusDisplay(issue.issueStatus)}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="modal-section">
          <div className="section-header">
            <div className="section-divider"></div>
            <h3 className="section-title">DESCRIPTION</h3>
          </div>
          <p className="section-text">
            {issue.issueDescription || "No description provided."}
          </p>
        </div>

        {/* Photo */}
        <div className="modal-section">
          <div className="section-header">
            <div className="section-divider"></div>
            <h3 className="section-title">ISSUE PHOTO</h3>
          </div>

          {issue.issuePhotoUrl ? (
            <a
              href={issue.issuePhotoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="image-container"
            >
              <img
                src={issue.issuePhotoUrl}
                alt="Issue"
                className="issue-photo"
              />
            </a>
          ) : (
            <div className="no-photo-placeholder">
              <span>No image uploaded</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="action-btn close-btn" onClick={onClose}>
            Close
          </button>

          {isReporter &&
            issue.issueStatus !== "FIXED" &&
            issue.issueStatus !== "RESOLVED" && (
              <button className="action-btn edit-btn" onClick={onEdit}>
                Edit Issue
              </button>
            )}
        </div>
      </div>
    </div>
  );
}
