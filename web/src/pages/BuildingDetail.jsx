// src/pages/BuildingDetail.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getBuildingByCode } from "../api/building";
import { getIssuesByBuilding, deleteIssue } from "../api/issues";

import Header from "../components/Header";
import UserActiveIssueModal from "../components/UserActiveIssueModal";
import DeleteConfirmationModal from "../components/staff/DeleteConfirmationModal";

import "../css/BuildingDetails.css";
import "../css/components_css/UserActiveIssueModal.css";

import useAutoRefresh from "../hooks/useAutoRefresh";
import useInactivityLogout from "../hooks/useInactivityLogout";

export default function BuildingDetail() {
  const { buildingCode } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  const { InactivityModal } = useInactivityLogout("STUDENT");

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
  const [modalIssue, setModalIssue] = useState(null);

  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

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
      })
      .finally(() => setLoading(false));
  }, [buildingCode]);

  // ================================
  // FETCH ISSUES
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
        if (isInitialLoad) setIsInitialLoad(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load issues:", err);
        setIssues([]);
        if (isInitialLoad) showToast("error", "Failed to load issues");
      })
      .finally(() => {
        if (isInitialLoad) setIssuesLoading(false);
      });
  }, [building, isInitialLoad]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

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

  const isResolvedStatus = (status) =>
    ["RESOLVED", "FIXED"].includes((status || "").toUpperCase());

  // ================================
  // COUNTS & STATS
  // ================================
  const activeIssuesCount = issues.filter(
    (i) => !isResolvedStatus(i.issueStatus)
  ).length;

  const resolvedIssuesCount = issues.filter(
    (i) => isResolvedStatus(i.issueStatus)
  ).length;

  // Priority counts - based on active tab
  const highCount = issues.filter((i) => {
    const isResolvedIssue = isResolvedStatus(i.issueStatus);
    const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
    return i.issuePriority === "HIGH" && matchesTab;
  }).length;

  const mediumCount = issues.filter((i) => {
    const isResolvedIssue = isResolvedStatus(i.issueStatus);
    const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
    return i.issuePriority === "MEDIUM" && matchesTab;
  }).length;

  const lowCount = issues.filter((i) => {
    const isResolvedIssue = isResolvedStatus(i.issueStatus);
    const matchesTab = activeTab === "active" ? !isResolvedIssue : isResolvedIssue;
    return i.issuePriority === "LOW" && matchesTab;
  }).length;

  // ================================
  // FILTER & SORT
  // ================================
  const filteredIssues = useMemo(() => {
    let filtered = issues.filter((issue) => {
      const isActive = !isResolvedStatus(issue.issueStatus);
      const matchesTab = activeTab === "active" ? isActive : !isActive;
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
  // DELETE HANDLER
  // ================================
  const handleDeleteClick = (issue, e) => {
    e.stopPropagation();
    setIssueToDelete(issue);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!issueToDelete?.id) return;

    setIsDeleting(true);

    try {
      await deleteIssue(issueToDelete.id);
      setIssues((prev) => prev.filter((i) => i.id !== issueToDelete.id));
      showToast("success", "Issue deleted successfully");
      setShowDeleteModal(false);
      setIssueToDelete(null);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        "Failed to delete issue. Please try again.";
      showToast("error", errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ================================
  // LOADING / ERROR UI
  // ================================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading building...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <button onClick={() => navigate("/buildings")} className="back-button-simple">
          ← Back to Buildings
        </button>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="building-detail-page">
      {/* Toast */}
      {toast && (
        <div
          className="toast-container"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999
          }}
        >
          <div
            className={`toast toast-${toast.type}`}
            style={{
              padding: "12px 20px",
              borderRadius: 8,
              background:
                toast.type === "success"
                  ? "#10b981"
                  : toast.type === "error"
                  ? "#ef4444"
                  : "#3b82f6",
              color: "#fff",
              fontWeight: 500,
            }}
          >
            {toast.message}
          </div>
        </div>
      )}

      <Header userName={user.username || "Student"} />

      {/* HEADER BANNER */}
      <div className="building-header-banner">
        <div className="building-header-content">
          <div className="building-header-left">
            <button onClick={() => navigate("/buildings")} className="back-button-banner">
              ←
            </button>
            <div>
              {/* ✅ Code first, larger */}
              <h1 className="building-title">{building?.buildingCode}</h1>
              {/* ✅ Name second, smaller */}
              <p className="building-subtitle">{building?.buildingName}</p>
            </div>
          </div>

          <button
            className="report-issue-button"
            onClick={() =>
              navigate("/buildings/ReportIssue", {
                state: { buildingCode: building.buildingCode },
              })
            }
          >
            + Report Issue
          </button>
        </div>
      </div>

      <main className="reports-main">
        <div className="building-detail-container">
          {/* TABS */}
          <div className="tabs-container">
            <button
              onClick={() => setActiveTab("active")}
              className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            >
              Active Issues <span className="tab-badge">{activeIssuesCount}</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            >
              Fixed Issues{" "}
              <span className="tab-badge">{resolvedIssuesCount}</span>
            </button>
          </div>

          {/* Search + Sort Filters - 2 Column */}
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

          {/* ISSUES LIST */}
          <div className="issues-list">
            {issuesLoading ? (
              <div className="loading-issues">Loading issues...</div>
            ) : filteredIssues.length === 0 ? (
              <div className="no-results">
                <p>No issues found</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const colors = getPriorityColor(issue.issuePriority);

                const isReporter =
                  user.id &&
                  (
                    issue.reportedById === user.id ||
                    issue.userId === user.id ||
                    issue.reportedBy === user.id ||
                    String(issue.reportedById) === String(user.id) ||
                    String(issue.userId) === String(user.id) ||
                    issue.reportedByEmail === user.email ||
                    issue.email === user.email ||
                    (user.username && issue.reportedByName === user.username)
                  );

                return (
                  <div
                    key={issue.id}
                    className="issue-card"
                    style={{ borderLeftColor: colors.border }}
                    onClick={() => setModalIssue(issue)}
                  >
                    <div className="issue-card-content">
                      <div className="issue-main">
                        <div className="issue-header">
                          <h3 className="issue-title">{issue.issueTitle}</h3>
                          <span
                            className="priority-badge"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {issue.issuePriority}
                          </span>
                        </div>

                        <div className="issue-meta">
                          👤
                          <span>Reported by:</span>
                          <span style={{ fontWeight: 600 }}>
                            {issue.reportedByName || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="issue-right">
                        <div className="issue-date">
                          📅
                          <span>
                            {issue.issueCreatedAt &&
                              new Date(issue.issueCreatedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {isReporter && !isResolvedStatus(issue.issueStatus) && (
                          <div className="issue-actions">
                            <button
                              className="admin-inline-btn edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/buildings/ReportIssue", {
                                  state: {
                                    ...issue,
                                    edit: true,
                                    buildingCode: building.buildingCode,
                                  }
                                });
                              }}
                              title="Edit Issue"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>

                            <button
                              className="admin-inline-btn delete"
                              onClick={(e) => handleDeleteClick(issue, e)}
                              title="Delete Issue"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* MODAL */}
      {modalIssue && (
        <UserActiveIssueModal
          issue={modalIssue}
          currentUserId={user.id}
          onClose={() => setModalIssue(null)}
          onEdit={() => {
            setModalIssue(null);
            navigate("/buildings/ReportIssue", {
              state: {
                ...modalIssue,
                edit: true,
                buildingCode: building.buildingCode,
              },
            });
          }}
        />
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

      {/* Inactivity Modal */}
      {InactivityModal}
    </div>
  );
}