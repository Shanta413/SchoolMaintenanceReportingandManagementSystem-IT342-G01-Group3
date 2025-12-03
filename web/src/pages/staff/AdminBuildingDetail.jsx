import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Calendar, Edit, Trash2, ClipboardCheck } from "lucide-react";

import { getBuildingByCode } from "../../api/building";
import { getIssuesByBuilding, updateIssue, deleteIssue } from "../../api/issues";

import IssueResolutionModal from "../../components/staff/IssueResolutionModal";
import IssueResolvedModal from "../../components/staff/IssueResolvedModal";
import AdminReportIssueModal from "../../components/staff/AdminReportIssueModal";

import "../../css/BuildingDetails.css";

import useAutoRefresh from "../../hooks/useAutoRefresh";

export default function AdminBuildingDetail() {
  const { buildingCode } = useParams();
  const navigate = useNavigate();

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  // Modals
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification
  const [toast, setToast] = useState(null);

  const isResolved = (status) =>
    ["FIXED", "RESOLVED"].includes((status || "").toUpperCase());

  // ================================
  // TOAST HELPER
  // ================================
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ================================
  // FETCH BUILDING (ONCE)
  // ================================
  useEffect(() => {
    setLoading(true);
    setError("");

    getBuildingByCode(buildingCode)
      .then((data) => {
        setBuilding(data);
        console.log("✅ Building loaded:", data);
      })
      .catch((err) => {
        const errorMsg =
          err?.response?.data?.message ||
          "Building not found. Please check the code or go back.";
        setError(errorMsg);
        console.error("❌ Failed to load building:", err);
        showToast("error", errorMsg);
      })
      .finally(() => setLoading(false));
  }, [buildingCode]);

  // ================================
  // FETCH ISSUES (AUTO-REFRESH SAFE)
  // ================================
  const fetchIssues = useCallback(() => {
    if (!building?.id) return;

    setIssuesLoading(true);
    getIssuesByBuilding(building.id)
      .then((data) => {
        setIssues(data);
        console.log("✅ Issues loaded:", data.length);
      })
      .catch((err) => {
        console.error("❌ Failed to load issues:", err);
        setIssues([]);
        showToast("error", "Failed to load issues");
      })
      .finally(() => setIssuesLoading(false));
  }, [building]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  // 🔥 AUTO REFRESH ISSUES EVERY 3 SECONDS
  useAutoRefresh(fetchIssues, 3000, true);

  // ================================
  // PRIORITY COLORS
  // ================================
  const getPriorityColor = (priority) => {
    switch ((priority || "").toUpperCase()) {
      case "HIGH":
        return { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" };
      case "MEDIUM":
        return { bg: "#fff7ed", border: "#f97316", text: "#ea580c" };
      case "LOW":
        return { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" };
      default:
        return { bg: "#f3f4f6", border: "#9ca3af", text: "#6b7280" };
    }
  };

  // ================================
  // FILTERING + COUNTS
  // ================================
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const isResolvedIssue = isResolved(issue.issueStatus);
      const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
      const matchesPriority =
        selectedPriority === "all" ||
        issue.issuePriority?.toLowerCase() === selectedPriority;
      const matchesSearch =
        issue.issueTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issueDescription?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesPriority && matchesSearch;
    });
  }, [issues, activeTab, selectedPriority, searchQuery]);

  const activeIssuesCount = issues.filter((i) => !isResolved(i.issueStatus)).length;
  const resolvedIssuesCount = issues.filter((i) => isResolved(i.issueStatus)).length;

  const highCount = issues.filter(
    (i) => i.issuePriority === "HIGH" && !isResolved(i.issueStatus)
  ).length;

  const mediumCount = issues.filter(
    (i) => i.issuePriority === "MEDIUM" && !isResolved(i.issueStatus)
  ).length;

  const lowCount = issues.filter(
    (i) => i.issuePriority === "LOW" && !isResolved(i.issueStatus)
  ).length;

  // ================================
  // EDIT / DELETE / RESOLVE
  // ================================
  const handleEdit = (issue) => {
    // Add buildingCode to the issue object
    setSelectedIssue({
      ...issue,
      buildingCode: building?.buildingCode
    });
    setShowModal(true);
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) {
      return;
    }

    setIsDeleting(true);
    console.log("🗑️ Deleting issue:", issueId);

    try {
      await deleteIssue(issueId);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      console.log("✅ Issue deleted successfully");
      showToast("success", "Issue deleted successfully");
      
      // Close modal if it's open
      if (showModal && selectedIssue?.id === issueId) {
        setShowModal(false);
        setSelectedIssue(null);
      }
    } catch (error) {
      console.error("❌ Failed to delete issue:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to delete issue. Please try again.";
      showToast("error", errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleModalSave = async (updateFields, resolutionFile) => {
    if (!selectedIssue?.id) {
      showToast("error", "Could not update: Issue ID missing!");
      return;
    }

    setIsSaving(true);
    console.log("📤 Updating issue with:", {
      issueId: selectedIssue.id,
      updateFields,
      hasResolutionFile: !!resolutionFile,
      resolutionFileName: resolutionFile?.name
    });

    try {
      // 🟢 FIXED: Pass null for photoFile, resolutionFile as 4th param
      await updateIssue(
        selectedIssue.id,
        { ...selectedIssue, ...updateFields },
        null,              // photoFile (not used here)
        resolutionFile     // resolutionFile (this is what we want!)
      );

      console.log("✅ Issue updated successfully");
      showToast("success", "Issue updated successfully");

      setShowModal(false);
      setSelectedIssue(null);

      // Refresh issues list
      fetchIssues();
    } catch (error) {
      console.error("❌ Failed to update issue:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to update issue. Please try again.";
      showToast("error", errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalClose = () => {
    if (isSaving) {
      showToast("warning", "Please wait, saving in progress...");
      return;
    }
    setShowModal(false);
    setSelectedIssue(null);
  };

  const handleIssueCreated = () => {
    fetchIssues();
    showToast("success", "Issue reported successfully");
  };

  // ================================
  // LOADING / ERROR UI
  // ================================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading building...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <button
          onClick={() => navigate("/staff/issues")}
          className="back-button-simple"
        >
          <ArrowLeft size={18} />
          Back to Issues
        </button>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  // ================================
  // PAGE UI
  // ================================
  return (
    <div className="building-detail-page">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-container" style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999
        }}>
          <div className={`toast toast-${toast.type}`} style={{
            padding: "12px 20px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            background: toast.type === "success" ? "#10b981" :
                       toast.type === "error" ? "#ef4444" :
                       toast.type === "warning" ? "#f59e0b" : "#3b82f6",
            color: "#fff",
            fontWeight: 500,
            minWidth: 250,
            animation: "slideIn 0.3s ease"
          }}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="building-header-banner">
        <div className="building-header-content">
          <div className="building-header-left">
            <button
              onClick={() => navigate("/staff/issues")}
              className="back-button-banner"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="building-title">{building?.buildingCode}</h1>
              <p className="building-subtitle">{building?.buildingName}</p>
            </div>
          </div>

          <button
            className="report-issue-button"
            onClick={() => setShowReportModal(true)}
          >
            + Report Issue
          </button>
        </div>
      </div>

      <main className="main-content">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab("active")}
            className={`tab-button ${activeTab === "active" ? "active" : ""}`}
          >
            Active Issues
            <span className="tab-badge">{activeIssuesCount}</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          >
            Issue History
            <span className="tab-badge">{resolvedIssuesCount}</span>
          </button>
        </div>

        {/* Search */}
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search issues by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Priority Chips */}
        <div className="filter-chips-container">
          <span className="filter-label">Filter by Priority:</span>

          <button
            onClick={() => setSelectedPriority("all")}
            className={`filter-chip ${selectedPriority === "all" ? "active" : ""}`}
          >
            All <span className="chip-badge">{activeIssuesCount}</span>
          </button>

          <button
            onClick={() => setSelectedPriority("high")}
            className={`filter-chip high ${selectedPriority === "high" ? "active" : ""}`}
          >
            High <span className="chip-badge">{highCount}</span>
          </button>

          <button
            onClick={() => setSelectedPriority("medium")}
            className={`filter-chip medium ${selectedPriority === "medium" ? "active" : ""}`}
          >
            Medium <span className="chip-badge">{mediumCount}</span>
          </button>

          <button
            onClick={() => setSelectedPriority("low")}
            className={`filter-chip low ${selectedPriority === "low" ? "active" : ""}`}
          >
            Low <span className="chip-badge">{lowCount}</span>
          </button>
        </div>

        {/* Issue List */}
        <div className="issues-list">
          {issuesLoading ? (
            <div className="loading-issues">Loading issues...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="no-issues">No issues found.</div>
          ) : (
            filteredIssues.map((issue) => {
              const priorityColors = getPriorityColor(issue.issuePriority);

              return (
                <div
                  key={issue.id}
                  className="issue-card"
                  style={{ borderLeftColor: priorityColors.border }}
                >
                  <div className="issue-card-content">
                    <div className="issue-main">
                      <div className="issue-header">
                        <h3 className="issue-title">{issue.issueTitle}</h3>

                        <span
                          className="priority-badge"
                          style={{
                            background: priorityColors.bg,
                            color: priorityColors.text,
                          }}
                        >
                          {issue.issuePriority}
                        </span>

                        <span
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            gap: "12px",
                          }}
                        >
                          <Edit
                            size={18}
                            className="icon-action"
                            title="Edit Issue"
                            onClick={() => handleEdit(issue)}
                            style={{ cursor: "pointer" }}
                          />

                          <ClipboardCheck
                            size={18}
                            className="icon-action"
                            title="Resolve Issue"
                            onClick={() => handleEdit(issue)}
                            style={{ cursor: "pointer" }}
                          />

                          <Trash2
                            size={18}
                            className="icon-action"
                            title="Delete Issue"
                            onClick={() => handleDelete(issue.id)}
                            style={{ 
                              cursor: isDeleting ? "not-allowed" : "pointer", 
                              color: "#dc2626",
                              opacity: isDeleting ? 0.5 : 1
                            }}
                          />
                        </span>
                      </div>

                      {/* Reporter */}
                      <div
                        className="issue-meta"
                        style={{ margin: "8px 0 0 0" }}
                      >
                        <div
                          className="meta-item"
                          style={{
                            gap: 6,
                            fontSize: 15,
                            color: "#334155",
                            fontWeight: 500,
                          }}
                        >
                          <User size={16} />
                          Reported By:
                          <span
                            style={{
                              marginLeft: 3,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {issue.reportedByName || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side date */}
                    <div className="issue-date">
                      <Calendar size={14} />
                      <span>
                        {issue.issueCreatedAt
                          ? new Date(issue.issueCreatedAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Edit / Resolve Modal */}
      {showModal && selectedIssue && (
        isResolved(selectedIssue.issueStatus) ? (
          <IssueResolvedModal
            isOpen={showModal}
            issue={selectedIssue}
            onSave={handleModalSave}
            onClose={handleModalClose}
            onDelete={() => handleDelete(selectedIssue.id)}
            isEditing={true}
            isSaving={isSaving}
            isDeleting={isDeleting}
          />
        ) : (
          <IssueResolutionModal
            isOpen={showModal}
            issue={selectedIssue}
            onSave={handleModalSave}
            onClose={handleModalClose}
            onDelete={() => handleDelete(selectedIssue.id)}
            isEditing={true}
            isSaving={isSaving}
            isDeleting={isDeleting}
          />
        )
      )}

      {/* Admin Create Issue Modal */}
      {building && (
        <AdminReportIssueModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          buildingId={building.id}
          buildingCode={building.buildingCode}
          onIssueCreated={handleIssueCreated}
        />
      )}
    </div>
  );
}