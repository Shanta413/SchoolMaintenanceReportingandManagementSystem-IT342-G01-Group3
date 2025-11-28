import React, { useState, useEffect } from "react";
import "../css/MyReports.css";
import { FileText, Circle, CheckCircle, Edit, Trash2 } from "lucide-react";
import SearchBar from "../components/SearchBar";
import PriorityBadges from "../components/PriorityBadges";
import IssueResolutionModal from "../components/staff/IssueResolutionModal";
import IssueResolvedModal from "../components/staff/IssueResolvedModal";
import { getStudentIssues } from "../api/issue";

const MyReports = () => {
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [deleteIssue, setDeleteIssue] = useState(null);
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      const data = await getStudentIssues();
      setIssues(data);
    } catch (error) {
      console.error("Failed to load issues:", error);
    }
  };

  const filteredIssues = issues
    .filter((i) =>
      activeTab === "active" ? i.status !== "Resolved" : i.status === "Resolved"
    )
    .filter((i) =>
      filterPriority === "All" ? true : i.priority === filterPriority
    )
    .filter((i) =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totals = {
    total: issues.length,
    active: issues.filter((i) => i.status !== "Resolved").length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  return (
    <div className="myreports-container">
      <h2 className="page-title">My Reports</h2>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <FileText size={22} />
          <div>
            <p>Total Reports</p>
            <h3>{totals.total}</h3>
          </div>
        </div>

        <div className="summary-card">
          <Circle size={22} />
          <div>
            <p>Active Issues</p>
            <h3>{totals.active}</h3>
          </div>
        </div>

        <div className="summary-card">
          <CheckCircle size={22} />
          <div>
            <p>Resolved Issues</p>
            <h3>{totals.resolved}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "active" ? "active" : ""}
          onClick={() => setActiveTab("active")}
        >
          Active Issues ({totals.active})
        </button>
        <button
          className={activeTab === "resolved" ? "active" : ""}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved Issues ({totals.resolved})
        </button>
      </div>

      {/* Search + Filters */}
      <div className="search-filter-row">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, description, or location..."
        />

        <select
          className="filter-select"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="issues-list">
        {filteredIssues.length === 0 ? (
          <p className="no-issues">No issues found.</p>
        ) : (
          filteredIssues.map((issue) => (
            <div className="issue-card" key={issue.id}>
              <div>
                <h4>{issue.title}</h4>

                <div className="badge-row">
                  <PriorityBadges priority={issue.priority} />
                  <span className={`status-badge ${issue.status.toLowerCase()}`}>
                    {issue.status}
                  </span>
                </div>

                <p><strong>Building:</strong> {issue.buildingName}</p>
                <p><strong>Location:</strong> {issue.location}</p>
                <p><strong>Submitted:</strong> {issue.createdAt}</p>
              </div>

              <div className="issue-actions">
                <button
                  className="edit-btn"
                  onClick={() => setSelectedIssue(issue)}
                >
                  <Edit size={16} />
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => setDeleteIssue(issue)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Issue Modal */}
      {selectedIssue && (
        <IssueResolutionModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdated={loadIssues}
        />
      )}

      {/* Delete Issue Modal */}
      {deleteIssue && (
        <IssueResolvedModal
          issue={deleteIssue}
          onClose={() => setDeleteIssue(null)}
          onDeleted={loadIssues}
        />
      )}
    </div>
  );
};

export default MyReports;
