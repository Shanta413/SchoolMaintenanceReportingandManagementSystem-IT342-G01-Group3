import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getBuildingByCode } from "../../api/building";
import { getIssuesByBuilding, updateIssue, deleteIssue } from "../../api/issues";

import IssueResolutionModal from "../../components/staff/IssueResolutionModal";
import IssueResolvedModal from "../../components/staff/IssueResolvedModal";
import AdminReportIssueModal from "../../components/staff/AdminReportIssueModal";
import DeleteConfirmationModal from "../../components/staff/DeleteConfirmationModal";

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
  const [sortBy, setSortBy] = useState("recent");

  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Modals
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

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

    if (isInitialLoad) {
      setIssuesLoading(true);
    }

    getIssuesByBuilding(building.id)
      .then((data) => {
        setIssues(data);
        console.log("✅ Issues loaded:", data.length);
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load issues:", err);
        setIssues([]);
        if (isInitialLoad) {
          showToast("error", "Failed to load issues");
        }
      })
      .finally(() => {
        if (isInitialLoad) {
          setIssuesLoading(false);
        }
      });
  }, [building, isInitialLoad]);

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
  // COUNTS & FILTERING
  // ================================
  const activeIssuesCount = issues.filter((i) => !isResolved(i.issueStatus)).length;
  const resolvedIssuesCount = issues.filter((i) => isResolved(i.issueStatus)).length;

  // Priority counts - based on active tab
  const highCount = issues.filter((i) => {
    const isResolvedIssue = isResolved(i.issueStatus);
    const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
    return i.issuePriority === "HIGH" && matchesTab;
  }).length;

  const mediumCount = issues.filter((i) => {
    const isResolvedIssue = isResolved(i.issueStatus);
    const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
    return i.issuePriority === "MEDIUM" && matchesTab;
  }).length;

  const lowCount = issues.filter((i) => {
    const isResolvedIssue = isResolved(i.issueStatus);
    const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
    return i.issuePriority === "LOW" && matchesTab;
  }).length;

  const filteredIssues = useMemo(() => {
    let filtered = issues.filter((issue) => {
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

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort(
        (a, b) => new Date(b.issueCreatedAt) - new Date(a.issueCreatedAt)
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.issueCreatedAt) - new Date(b.issueCreatedAt)
      );
    } else if (sortBy === "priority") {
      const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      filtered.sort(
        (a, b) => (order[b.issuePriority] || 0) - (order[a.issuePriority] || 0)
      );
    }

    return filtered;
  }, [issues, activeTab, selectedPriority, searchQuery, sortBy]);

  // ================================
  // EDIT / DELETE / RESOLVE
  // ================================
  const handleEdit = (issue) => {
    setSelectedIssue({
      ...issue,
      buildingCode: building?.buildingCode
    });
    setShowModal(true);
  };

  const handleDeleteClick = (issue, e) => {
    e.stopPropagation();
    setIssueToDelete(issue);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!issueToDelete?.id) return;

    setIsDeleting(true);
    console.log("🗑️ Deleting issue:", issueToDelete.id);

    try {
      await deleteIssue(issueToDelete.id);
      setIssues((prev) => prev.filter((i) => i.id !== issueToDelete.id));
      console.log("✅ Issue deleted successfully");
      showToast("success", "Issue deleted successfully");
      
      setShowDeleteModal(false);
      setIssueToDelete(null);
      
      if (showModal && selectedIssue?.id === issueToDelete.id) {
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
      await updateIssue(
        selectedIssue.id,
        { ...selectedIssue, ...updateFields },
        null,
        resolutionFile
      );

      console.log("✅ Issue updated successfully");
      showToast("success", "Issue updated successfully");

      setShowModal(false);
      setSelectedIssue(null);

      setIsInitialLoad(true);
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
    setIsInitialLoad(true);
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
          ← Back to Issues
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
              ←
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

        {/* Search + Sort Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input-wrapper">
              <span className="search-icon-inside">🔍</span>
              <input
                type="text"
                placeholder="Search issues by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-select search-with-icon"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        {/* Priority Chips */}
        <div className="priority-chips">
          <span className="filter-label">Filter by Priority:</span>

          <button
            onClick={() => setSelectedPriority("all")}
            className={`chip ${selectedPriority === "all" ? "active" : ""}`}
          >
            All <span className="chip-count">{activeTab === "active" ? activeIssuesCount : resolvedIssuesCount}</span>
          </button>

          <button
            onClick={() => setSelectedPriority("high")}
            className={`chip chip-high ${selectedPriority === "high" ? "active" : ""}`}
          >
            High <span className="chip-count">{highCount}</span>
          </button>

          <button
            onClick={() => setSelectedPriority("medium")}
            className={`chip chip-medium ${selectedPriority === "medium" ? "active" : ""}`}
          >
            Medium <span className="chip-count">{mediumCount}</span>
          </button>

          <button
            onClick={() => setSelectedPriority("low")}
            className={`chip chip-low ${selectedPriority === "low" ? "active" : ""}`}
          >
            Low <span className="chip-count">{lowCount}</span>
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
                            gap: "6px",
                          }}
                        >
                          {/* Edit Button - Same as AdminBuildingCard */}
                          <button
                            className="admin-issue-edit-btn"
                            title="Edit Issue"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(issue);
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          {/* Delete Button - Same as AdminBuildingCard */}
                          <button
                            className="admin-issue-delete-btn"
                            title="Delete Issue"
                            onClick={(e) => handleDeleteClick(issue, e)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </span>
                      </div>

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
                          👤 Reported By:
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

                    <div className="issue-date">
                      📅
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
            onDelete={() => {
              setShowModal(false);
              handleDeleteClick(selectedIssue, { stopPropagation: () => {} });
            }}
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
            onDelete={() => {
              setShowModal(false);
              handleDeleteClick(selectedIssue, { stopPropagation: () => {} });
            }}
            isEditing={true}
            isSaving={isSaving}
            isDeleting={isDeleting}
          />
        )
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setIssueToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        issueTitle={issueToDelete?.issueTitle}
        isDeleting={isDeleting}
      />

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