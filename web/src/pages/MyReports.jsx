import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import { getAllIssues, deleteIssue } from "../api/issues";

import "../css/MyReports.css";

import useAutoRefresh from "../hooks/useAutoRefresh"; // 🔥 Auto-refresh

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

  // 🔥 Auto-refresh every 3 seconds
  useAutoRefresh(fetchMyIssues, 3000, true);

  // Status helper
  const isResolvedStatus = (status) =>
    ["RESOLVED", "FIXED"].includes((status || "").toUpperCase());

  // Stats
  const totalReports = allIssues.length;
  const activeIssuesCount = allIssues.filter(
    (i) => !isResolvedStatus(i.issueStatus)
  ).length;
  const fixedIssuesCount = allIssues.filter((i) =>
    isResolvedStatus(i.issueStatus)
  ).length;

  // Priority counts
  const highCount = allIssues.filter(
    (i) => i.issuePriority === "HIGH" && !isResolvedStatus(i.issueStatus)
  ).length;

  const mediumCount = allIssues.filter(
    (i) => i.issuePriority === "MEDIUM" && !isResolvedStatus(i.issueStatus)
  ).length;

  const lowCount = allIssues.filter(
    (i) => i.issuePriority === "LOW" && !isResolvedStatus(i.issueStatus)
  ).length;

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
    switch ((priority || "").toUpperCase()) {
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

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                📄
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Reports</p>
                <p className="stat-value">{totalReports}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">⭕</div>
              <div className="stat-content">
                <p className="stat-label">Active Issues</p>
                <p className="stat-value">{activeIssuesCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon fixed">✔</div>
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
            <button
              onClick={() => setSelectedPriority("all")}
              className={`chip ${selectedPriority === "all" ? "active" : ""}`}
            >
              All <span className="chip-count">{activeIssuesCount}</span>
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
                        ? new Date(issue.issueCreatedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="report-actions">
                    <button className="action-btn edit-btn" onClick={() => handleEdit(issue)}>
                      Edit
                    </button>

                    <button className="action-btn delete-btn" onClick={() => handleDelete(issue.id)}>
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
