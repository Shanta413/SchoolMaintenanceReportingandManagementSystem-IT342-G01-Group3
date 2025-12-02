import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAllIssues, deleteIssue } from "../api/issues";
import "../css/MyReports.css";

export default function MyReports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all issues and filter by current user
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    getAllIssues()
      .then((data) => {
        // Filter issues reported by current user
        const myIssues = data.filter((issue) => {
          return (
            issue.reportedById === user.id ||
            issue.userId === user.id ||
            String(issue.reportedById) === String(user.id) ||
            issue.reportedByEmail === user.email ||
            issue.email === user.email
          );
        });
        setAllIssues(myIssues);
      })
      .catch((err) => {
        console.error("Failed to fetch issues:", err);
        setAllIssues([]);
      })
      .finally(() => setLoading(false));
  }, [navigate, user.id, user.email]);

  // Helper: Check if status is resolved
  const isResolvedStatus = (status) =>
    ["RESOLVED", "FIXED"].includes((status || "").toUpperCase());

  // Statistics
  const totalReports = allIssues.length;
  const activeIssuesCount = allIssues.filter(
    (i) => !isResolvedStatus(i.issueStatus)
  ).length;
  const fixedIssuesCount = allIssues.filter((i) =>
    isResolvedStatus(i.issueStatus)
  ).length;

  // Priority counts (only active issues)
  const highCount = allIssues.filter(
    (i) => i.issuePriority === "HIGH" && !isResolvedStatus(i.issueStatus)
  ).length;
  const mediumCount = allIssues.filter(
    (i) => i.issuePriority === "MEDIUM" && !isResolvedStatus(i.issueStatus)
  ).length;
  const lowCount = allIssues.filter(
    (i) => i.issuePriority === "LOW" && !isResolvedStatus(i.issueStatus)
  ).length;

  // Get unique buildings for filter
  const uniqueBuildings = useMemo(() => {
    const buildings = new Set();
    allIssues.forEach((issue) => {
      if (issue.buildingName) buildings.add(issue.buildingName);
    });
    return Array.from(buildings).sort();
  }, [allIssues]);

  // Filtered issues
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

      return matchesTab && matchesPriority && matchesBuilding;
    });

    // Sorting
    if (sortBy === "recent") {
      filtered.sort(
        (a, b) => new Date(b.issueCreatedAt) - new Date(a.issueCreatedAt)
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) => new Date(a.issueCreatedAt) - new Date(b.issueCreatedAt)
      );
    } else if (sortBy === "priority") {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      filtered.sort(
        (a, b) =>
          (priorityOrder[b.issuePriority] || 0) -
          (priorityOrder[a.issuePriority] || 0)
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

  const handleEdit = (issue) => {
    navigate("/buildings/ReportIssue", {
      state: {
        ...issue,
        edit: true,
        buildingCode: issue.buildingCode,
      },
    });
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      await deleteIssue(issueId);
      setAllIssues((prev) => prev.filter((i) => i.id !== issueId));
      alert("Report deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert(
        error?.response?.data?.message || "Failed to delete. Please try again."
      );
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "priority-high";
      case "MEDIUM":
        return "priority-medium";
      case "LOW":
        return "priority-low";
      default:
        return "";
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
      <Header userName={user.username || "Student"} />

      <main className="reports-main">
        <div className="reports-container">
          <h1 className="reports-title">My Reports</h1>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Reports</p>
                <p className="stat-value">{totalReports}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Active Issues</p>
                <p className="stat-value">{activeIssuesCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon fixed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="stat-content">
                <p className="stat-label">Fixed Issues</p>
                <p className="stat-value">{fixedIssuesCount}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <button
              onClick={() => setActiveTab("active")}
              className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
            >
              Active Issues ({activeIssuesCount})
            </button>
            <button
              onClick={() => setActiveTab("fixed")}
              className={`tab-btn ${activeTab === "fixed" ? "active" : ""}`}
            >
              Fixed Issues ({fixedIssuesCount})
            </button>
          </div>

          {/* Filters */}
          <div className="filters-section">
            <div className="filter-group">
              <label>All Buildings</label>
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
              <label>Most Recent</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Priority Filter Chips */}
          <div className="priority-chips">
            <button
              onClick={() => setSelectedPriority("all")}
              className={`chip ${selectedPriority === "all" ? "active" : ""}`}
            >
              <span>All</span>
              <span className="chip-count">{activeIssuesCount}</span>
            </button>
            <button
              onClick={() => setSelectedPriority("high")}
              className={`chip chip-high ${
                selectedPriority === "high" ? "active" : ""
              }`}
            >
              <span>High</span>
              <span className="chip-count">{highCount}</span>
            </button>
            <button
              onClick={() => setSelectedPriority("medium")}
              className={`chip chip-medium ${
                selectedPriority === "medium" ? "active" : ""
              }`}
            >
              <span>Medium</span>
              <span className="chip-count">{mediumCount}</span>
            </button>
            <button
              onClick={() => setSelectedPriority("low")}
              className={`chip chip-low ${
                selectedPriority === "low" ? "active" : ""
              }`}
            >
              <span>Low</span>
              <span className="chip-count">{lowCount}</span>
            </button>
          </div>

          {/* Issues List */}
          <div className="issues-list">
            {filteredIssues.length === 0 ? (
              <div className="no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p>No reports found</p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="report-card">
                  <div className="report-header">
                    <h3 className="report-title">{issue.issueTitle}</h3>
                    <div className="report-badges">
                      <span
                        className={`priority-badge ${getPriorityClass(
                          issue.issuePriority
                        )}`}
                      >
                        {issue.issuePriority}
                      </span>
                      <span
                        className={`status-badge ${
                          isResolvedStatus(issue.issueStatus)
                            ? "status-resolved"
                            : "status-active"
                        }`}
                      >
                        {issue.issueStatus}
                      </span>
                    </div>
                  </div>

                  <div className="report-info">
                    <p>
                      <strong>Building:</strong> {issue.buildingName || "N/A"}
                    </p>
                    <p>
                      <strong>Location:</strong> {issue.issueLocation || "N/A"}
                    </p>
                    <p>
                      <strong>Submitted:</strong>{" "}
                      {issue.issueCreatedAt
                        ? new Date(issue.issueCreatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>

                  <div className="report-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(issue)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(issue.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}