// src/pages/MyReports.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Edit2, Trash2, Search } from "lucide-react";

import Header from "../components/Header";
import UserActiveIssueModal from "../components/UserActiveIssueModal";
import DeleteConfirmationModal from "../components/staff/DeleteConfirmationModal"; // ✅ Add this
import { getAllIssues, deleteIssue } from "../api/issues";

import "../css/MyReports.css";
import useAutoRefresh from "../hooks/useAutoRefresh";
import useInactivityLogout from "../hooks/useInactivityLogout";

export default function MyReports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};
  
  const { InactivityModal } = useInactivityLogout("STUDENT");

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIssue, setModalIssue] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ✅ Add these states for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ---------------------------------------
  // REFRESHABLE FETCH FUNCTION
  // ---------------------------------------
  const fetchMyIssues = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    getAllIssues()
      .then((data) => {
        const mine = data.filter((issue) => {
          return (
            issue.reportedById === user.id ||
            issue.userId === user.id ||
            String(issue.reportedById) === String(user.id) ||
            issue.reportedByEmail === user.email ||
            issue.email === user.email
          );
        });

        setAllIssues(mine);
      })
      .catch((err) => {
        console.error("Failed to fetch issues:", err);
        setAllIssues([]);
      })
      .finally(() => setLoading(false));
  }, [navigate, user.id, user.email]);

  // Initial load
  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  // Auto-refresh every 3 seconds
  useAutoRefresh(fetchMyIssues, 3000, true);

  const isResolvedStatus = (status) =>
    ["RESOLVED", "FIXED"].includes((status || "").toUpperCase());

  // Stats
  const activeIssuesCount = allIssues.filter(
    (i) => !isResolvedStatus(i.issueStatus)
  ).length;
  const fixedIssuesCount = allIssues.filter((i) =>
    isResolvedStatus(i.issueStatus)
  ).length;

  // Priority counts - based on active tab
  const highCount = allIssues.filter((i) => {
    const isActive = !isResolvedStatus(i.issueStatus);
    const matchesTab = activeTab === "active" ? isActive : !isActive;
    return i.issuePriority === "HIGH" && matchesTab;
  }).length;

  const mediumCount = allIssues.filter((i) => {
    const isActive = !isResolvedStatus(i.issueStatus);
    const matchesTab = activeTab === "active" ? isActive : !isActive;
    return i.issuePriority === "MEDIUM" && matchesTab;
  }).length;

  const lowCount = allIssues.filter((i) => {
    const isActive = !isResolvedStatus(i.issueStatus);
    const matchesTab = activeTab === "active" ? isActive : !isActive;
    return i.issuePriority === "LOW" && matchesTab;
  }).length;

  // Unique buildings
  const uniqueBuildings = useMemo(() => {
    const setB = new Set();
    allIssues.forEach((issue) => {
      if (issue.buildingName) setB.add(issue.buildingName);
    });
    return Array.from(setB).sort();
  }, [allIssues]);

  // Filtering + Sorting
  const filteredIssues = useMemo(() => {
    let filtered = allIssues.filter((issue) => {
      const isActive = !isResolvedStatus(issue.issueStatus);
      const matchesTab = activeTab === "active" ? isActive : !isActive;

      const matchesPriority =
        selectedPriority === "all" ||
        issue.issuePriority?.toLowerCase() === selectedPriority;

      const matchesBuilding =
        selectedBuilding === "all" || issue.buildingName === selectedBuilding;

      const matchesSearch =
        issue.issueTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issueDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issueLocation?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesPriority && matchesBuilding && matchesSearch;
    });

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
  }, [
    allIssues,
    activeTab,
    selectedPriority,
    selectedBuilding,
    searchQuery,
    sortBy,
  ]);

  // ✅ Updated delete handler - opens modal instead of window.confirm
  const handleDeleteClick = (issue, e) => {
    e.stopPropagation();
    setIssueToDelete(issue);
    setShowDeleteModal(true);
  };

  // ✅ Updated delete confirm - works with modal
  const handleDeleteConfirm = async () => {
    if (!issueToDelete?.id) return;

    setIsDeleting(true);

    try {
      await deleteIssue(issueToDelete.id);
      setAllIssues((prev) => prev.filter((i) => i.id !== issueToDelete.id));
      showToast("success", "Report deleted successfully!");
      setShowDeleteModal(false);
      setIssueToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to delete. Please try again.";
      showToast("error", errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="my-reports-page">
      {/* Toast */}
      {toast && (
        <div
          className="toast-container"
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
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

      <main className="reports-main">
        <div className="reports-container">
          <h1 className="reports-title">My Reports</h1>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              onClick={() => setActiveTab("active")}
              className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            >
              Active Issues <span className="tab-badge">{activeIssuesCount}</span>
            </button>
            <button
              onClick={() => setActiveTab("fixed")}
              className={`tab-btn ${activeTab === "fixed" ? "active" : ""}`}
            >
              Fixed Issues <span className="tab-badge">{fixedIssuesCount}</span>
            </button>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Building</label>
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Buildings</option>
                {uniqueBuildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
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

          {/* Priority chips */}
          <div className="priority-chips">
            <span className="filter-label">Filter by Priority:</span>

            <button
              onClick={() => setSelectedPriority("all")}
              className={`chip ${selectedPriority === "all" ? "active" : ""}`}
            >
              All <span className="chip-count">{activeTab === "active" ? activeIssuesCount : fixedIssuesCount}</span>
            </button>

            <button
              onClick={() => setSelectedPriority("high")}
              className={`chip chip-high ${
                selectedPriority === "high" ? "active" : ""
              }`}
            >
              High <span className="chip-count">{highCount}</span>
            </button>

            <button
              onClick={() => setSelectedPriority("medium")}
              className={`chip chip-medium ${
                selectedPriority === "medium" ? "active" : ""
              }`}
            >
              Medium <span className="chip-count">{mediumCount}</span>
            </button>

            <button
              onClick={() => setSelectedPriority("low")}
              className={`chip chip-low ${
                selectedPriority === "low" ? "active" : ""
              }`}
            >
              Low <span className="chip-count">{lowCount}</span>
            </button>
          </div>

          {/* Issues List */}
          <div className="issues-list">
            {filteredIssues.length === 0 ? (
              <div className="no-results">
                <p>No reports found</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const colors = getPriorityColor(issue.issuePriority);

                return (
                  <div
                    key={issue.id}
                    className="issue-card"
                    style={{ borderLeftColor: colors.border }}
                    onClick={() => setModalIssue(issue)}
                  >
                    <div
                      className="issue-card-content"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "16px",
                        padding: "16px",
                      }}
                    >
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
                          <User size={16} />
                          <span>Building:</span>
                          <span style={{ fontWeight: 600 }}>
                            {issue.buildingName || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="issue-right">
                        <div className="issue-date">
                          <Calendar size={14} />
                          {issue.issueCreatedAt &&
                            new Date(issue.issueCreatedAt).toLocaleDateString()}
                        </div>

                        {!isResolvedStatus(issue.issueStatus) && (
                          <div className="issue-actions">
                            <button
                              className="admin-inline-btn edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/buildings/ReportIssue", {
                                  state: {
                                    ...issue,
                                    edit: true,
                                    buildingCode: issue.buildingCode,
                                  },
                                });
                              }}
                              title="Edit Issue"
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* ✅ Updated to use handleDeleteClick */}
                            <button
                              className="admin-inline-btn delete"
                              onClick={(e) => handleDeleteClick(issue, e)}
                              disabled={isDeleting}
                              title="Delete Issue"
                            >
                              <Trash2 size={16} />
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
                    buildingCode: modalIssue.buildingCode,
                  },
                });
              }}
            />
          )}

          {/* ✅ Add Delete Confirmation Modal */}
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
        </div>
      </main>

      {/* Inactivity Modal */}
      {InactivityModal}
    </div>
  );
}