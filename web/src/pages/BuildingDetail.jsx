import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Calendar, Edit2, Trash2 } from "lucide-react";

import { getBuildingByCode } from "../api/building";
import { getIssuesByBuilding, deleteIssue } from "../api/issues";

import Header from "../components/Header";
import UserActiveIssueModal from "../components/UserActiveIssueModal";

import "../css/BuildingDetails.css";
import "../css/components_css/UserActiveIssueModal.css";

import useAutoRefresh from "../hooks/useAutoRefresh";

export default function BuildingDetail() {
  const { buildingCode } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("active");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const [modalIssue, setModalIssue] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast helper
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
  // FETCH ISSUES (AUTO-REFRESH SAFE)
  // ================================
  const fetchIssues = useCallback(() => {
    if (!building?.id) return;

    // Only show loading spinner on initial load
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

  // 🔥 AUTO-REFRESH ISSUES EVERY 3 SECONDS
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
  // FILTERING + COUNTS
  // ================================
  const filteredIssues = issues.filter((issue) => {
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

  const activeIssuesCount = issues.filter(
    (i) => !isResolvedStatus(i.issueStatus)
  ).length;

  const resolvedIssuesCount = issues.filter((i) =>
    isResolvedStatus(i.issueStatus)
  ).length;

  const highCount = issues.filter(
    (i) => i.issuePriority === "HIGH" && !isResolvedStatus(i.issueStatus)
  ).length;

  const mediumCount = issues.filter(
    (i) => i.issuePriority === "MEDIUM" && !isResolvedStatus(i.issueStatus)
  ).length;

  const lowCount = issues.filter(
    (i) => i.issuePriority === "LOW" && !isResolvedStatus(i.issueStatus)
  ).length;

  // ================================
  // DELETE HANDLER
  // ================================
  const handleDelete = async (issueId, e) => {
    e.stopPropagation();
    
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
    } catch (error) {
      console.error("❌ Failed to delete issue:", error);
      const errorMsg =
        error?.response?.data?.message || "Failed to delete issue. Please try again.";
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
        <div className="loading-text">Loading building...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <button onClick={() => navigate("/buildings")} className="back-button-simple">
          <ArrowLeft size={18} />
          Back to Buildings
        </button>
        <div className="error-text">{error}</div>
      </div>
    );
  }

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

      <Header userName="Student" />

      {/* HEADER BANNER */}
      <div className="building-header-banner">
        <div className="building-header-content">
          <div className="building-header-left">
            <button onClick={() => navigate("/buildings")} className="back-button-banner">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="building-title">{building?.buildingName}</h1>
              <p className="building-subtitle">{building?.buildingCode}</p>
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

      <main className="main-content">
        {/* TABS */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab("active")}
            className={`tab-button ${activeTab === "active" ? "active" : ""}`}
          >
            Active Issues <span className="tab-badge">{activeIssuesCount}</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
          >
            Issue History <span className="tab-badge">{resolvedIssuesCount}</span>
          </button>
        </div>

        {/* SEARCH BAR */}
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

        {/* PRIORITY FILTER CHIPS */}
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

        {/* ISSUES LIST */}
        <div className="issues-list">
          {issuesLoading ? (
            <div className="loading-issues">Loading issues...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="no-issues">No issues found.</div>
          ) : (
            filteredIssues.map((issue) => {
              const priorityColors = getPriorityColor(issue.issuePriority);

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
                  style={{ borderLeftColor: priorityColors.border }}
                  onClick={() => setModalIssue(issue)}
                >
                  <div
                    className="issue-card-content"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px",
                      padding: "16px"
                    }}
                  >
                    {/* LEFT SIDE */}
                    <div className="issue-main" style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="issue-header"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          flexWrap: "wrap"
                        }}
                      >
                        <h3 className="issue-title" style={{ margin: 0 }}>
                          {issue.issueTitle}
                        </h3>

                        <span
                          className="priority-badge"
                          style={{
                            background: priorityColors.bg,
                            color: priorityColors.text,
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600
                          }}
                        >
                          {issue.issuePriority}
                        </span>
                      </div>

                      <div className="issue-meta" style={{ display: "flex", alignItems: "center" }}>
                        <div className="meta-item" style={{ display: "flex", gap: 6, fontSize: 15 }}>
                          <User size={16} />
                          Reported By:
                          <span style={{ fontWeight: 600 }}>
                            {issue.reportedByName || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "12px",
                        minWidth: "150px"
                      }}
                    >
                      {/* DATE */}
                      <div
                        className="issue-date"
                        style={{
                          color: "#64748b",
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Calendar size={14} />
                        {issue.issueCreatedAt
                          ? new Date(issue.issueCreatedAt).toLocaleDateString()
                          : ""}
                      </div>

                      {/* REPORTER ACTION BUTTONS */}
                      {isReporter && (
                        <div style={{ display: "flex", gap: "8px" }}>
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
                            <Edit2 size={16} />
                          </button>

                          <button
                            className="admin-inline-btn delete"
                            onClick={(e) => handleDelete(issue.id, e)}
                            disabled={isDeleting}
                            style={{
                              cursor: isDeleting ? "not-allowed" : "pointer",
                              opacity: isDeleting ? 0.5 : 1
                            }}
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

        {/* MODAL VIEW */}
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
      </main>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}