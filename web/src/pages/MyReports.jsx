// src/pages/MyReports.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Edit2, Trash2 } from "lucide-react";

import Header from "../components/Header";
import UserActiveIssueModal from "../components/UserActiveIssueModal";
import { getAllIssues, deleteIssue } from "../api/issues";

import "../css/MyReports.css";
import useAutoRefresh from "../hooks/useAutoRefresh";

export default function MyReports() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [activeTab, setActiveTab] = useState("active");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedBuilding, setSelectedBuilding] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIssue, setModalIssue] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMyIssues = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    getAllIssues()
      .then((data) => {
        const mine = data.filter(
          (issue) =>
            issue.reportedById === user.id ||
            issue.userId === user.id ||
            String(issue.reportedById) === String(user.id) ||
            issue.reportedByEmail === user.email
        );

        setAllIssues(mine);
      })
      .catch(() => setAllIssues([]))
      .finally(() => setLoading(false));
  }, [navigate, user.id, user.email]);

  useEffect(() => {
    fetchMyIssues();
  }, [fetchMyIssues]);

  useAutoRefresh(fetchMyIssues, 3000, true);

  const isResolvedStatus = (status) =>
    ["RESOLVED", "FIXED"].includes((status || "").toUpperCase());

  const activeIssuesCount = allIssues.filter(
    (i) => !isResolvedStatus(i.issueStatus)
  ).length;
  const fixedIssuesCount = allIssues.filter((i) =>
    isResolvedStatus(i.issueStatus)
  ).length;

  const uniqueBuildings = useMemo(() => {
    const setB = new Set();
    allIssues.forEach((i) => i.buildingName && setB.add(i.buildingName));
    return [...setB].sort();
  }, [allIssues]);

  const filteredIssues = useMemo(() => {
    let filtered = allIssues.filter((issue) => {
      const active = !isResolvedStatus(issue.issueStatus);
      const matchesTab = activeTab === "active" ? active : !active;
      const matchesPriority =
        selectedPriority === "all" ||
        issue.issuePriority?.toLowerCase() === selectedPriority;
      const matchesBuilding =
        selectedBuilding === "all" || issue.buildingName === selectedBuilding;

      return matchesTab && matchesPriority && matchesBuilding;
    });

    if (sortBy === "recent") {
      filtered.sort(
        (a, b) => new Date(b.issueCreatedAt) - new Date(a.issueCreatedAt)
      );
    }

    return filtered;
  }, [allIssues, activeTab, selectedPriority, selectedBuilding, sortBy]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this report?")) return;

    setIsDeleting(true);

    try {
      await deleteIssue(id);
      setAllIssues((prev) => prev.filter((i) => i.id !== id));
      showToast("success", "Report deleted");
    } catch {
      showToast("error", "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority) =>
    ({
      HIGH: { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
      MEDIUM: { bg: "#fff7ed", border: "#f97316", text: "#ea580c" },
      LOW: { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" },
    }[priority?.toUpperCase()] || {
      bg: "#f3f4f6",
      border: "#9ca3af",
      text: "#6b7280",
    });

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
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <Header userName={user.username || "Student"} />

      <main className="reports-main">
        <div className="reports-container">
          <div className="issues-list">
            {filteredIssues.length === 0 ? (
              <p>No reports found</p>
            ) : (
              filteredIssues.map((issue) => {
                const colors = getPriorityColor(issue.issuePriority);

                return (
                  <React.Fragment key={issue.id}>
                    <div
                      className="issue-card"
                      style={{ borderLeftColor: colors.border }}
                      onClick={() => setModalIssue(issue)}
                    >
                      <div className="issue-card-content">
                        <div>
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

                          <div className="issue-meta">
                            <User size={16} /> {issue.buildingName || "N/A"}
                          </div>

                          <div className="issue-date">
                            <Calendar size={14} />
                            {issue.issueCreatedAt &&
                              new Date(
                                issue.issueCreatedAt
                              ).toLocaleDateString()}
                          </div>
                        </div>

                        {!isResolvedStatus(issue.issueStatus) && (
                          <div className="issue-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/buildings/ReportIssue", {
                                  state: { ...issue, edit: true },
                                });
                              }}
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              disabled={isDeleting}
                              onClick={(e) => handleDelete(issue.id, e)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EXTRA INFO SECTION */}
                    <div className="report-info">
                      <p>
                        <strong>Location:</strong>{" "}
                        {issue.issueLocation || "N/A"}
                      </p>
                      <p>
                        <strong>Reported:</strong>{" "}
                        {issue.issueCreatedAt &&
                          new Date(issue.issueCreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {modalIssue && (
            <UserActiveIssueModal
              issue={modalIssue}
              currentUserId={user.id}
              onClose={() => setModalIssue(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
