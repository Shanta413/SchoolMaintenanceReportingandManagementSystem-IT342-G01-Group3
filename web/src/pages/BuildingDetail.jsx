import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, User, Calendar } from "lucide-react";
import { getBuildingByCode } from "../api/building";
import { getIssuesByBuilding } from "../api/issues";
import Header from "../components/Header";
import "../css/BuildingDetails.css";

export default function BuildingDetail() {
  const { buildingCode } = useParams();
  const navigate = useNavigate();

  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState('active');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  // Fetch building data
  useEffect(() => {
    setLoading(true);
    setError("");
    getBuildingByCode(buildingCode)
      .then((data) => setBuilding(data))
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
            "Building not found. Please check the code or go back."
        );
      })
      .finally(() => setLoading(false));
  }, [buildingCode]);

  // Fetch real issues for this building from backend
  useEffect(() => {
    if (building) {
      setIssuesLoading(true);
      getIssuesByBuilding(building.id)
        .then((data) => setIssues(data))
        .catch(() => setIssues([]))
        .finally(() => setIssuesLoading(false));
    }
  }, [building]);

  // Priority color helper
  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
      case 'MEDIUM': return { bg: '#fff7ed', border: '#f97316', text: '#ea580c' };
      case 'LOW': return { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a' };
      default: return { bg: '#f3f4f6', border: '#9ca3af', text: '#6b7280' };
    }
  };

  // Treat "FIXED" as resolved as well
  const isResolvedStatus = status => ['RESOLVED', 'FIXED'].includes((status || '').toUpperCase());

  // Filtering logic
  const filteredIssues = issues.filter(issue => {
    const isActive = !isResolvedStatus(issue.issueStatus);
    const matchesTab = activeTab === 'active' ? isActive : !isActive;
    const matchesPriority = selectedPriority === 'all' ||
      (issue.issuePriority?.toLowerCase() === selectedPriority);
    const matchesSearch =
      issue.issueTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issueDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesPriority && matchesSearch;
  });

  const activeIssuesCount = issues.filter(i => !isResolvedStatus(i.issueStatus)).length;
  const resolvedIssuesCount = issues.filter(i => isResolvedStatus(i.issueStatus)).length;
  const highCount = issues.filter(i => i.issuePriority === 'HIGH' && !isResolvedStatus(i.issueStatus)).length;
  const mediumCount = issues.filter(i => i.issuePriority === 'MEDIUM' && !isResolvedStatus(i.issueStatus)).length;
  const lowCount = issues.filter(i => i.issuePriority === 'LOW' && !isResolvedStatus(i.issueStatus)).length;

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
          onClick={() => navigate("/buildings")}
          className="back-button-simple"
        >
          <ArrowLeft size={18} />
          Back to Buildings
        </button>
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="building-detail-page">
      <Header userName="Student" />

      {/* Purple Header Banner */}
      <div className="building-header-banner">
        <div className="building-header-content">
          <div className="building-header-left">
            <button
              onClick={() => navigate("/buildings")}
              className="back-button-banner"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="building-title">
                {building?.buildingName}
              </h1>
              <p className="building-subtitle">
                {building?.buildingCode}
              </p>
            </div>
          </div>
          <button 
            className="report-issue-button"
            onClick={() =>
              navigate('/buildings/ReportIssue', {
                state: { buildingId: building.id }
              })
            }
          >
            + Report Issue
          </button>
        </div>
      </div>

      <main className="main-content">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab('active')}
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          >
            Active Issues
            <span className="tab-badge">{activeIssuesCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          >
            Issue History
            <span className="tab-badge">{resolvedIssuesCount}</span>
          </button>
        </div>

        {/* Search Bar */}
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

        {/* Priority Filter Chips */}
        <div className="filter-chips-container">
          <span className="filter-label">Filter by Priority:</span>
          <button
            onClick={() => setSelectedPriority('all')}
            className={`filter-chip ${selectedPriority === 'all' ? 'active' : ''}`}
          >
            All
            <span className="chip-badge">{activeIssuesCount}</span>
          </button>
          <button
            onClick={() => setSelectedPriority('high')}
            className={`filter-chip high ${selectedPriority === 'high' ? 'active' : ''}`}
          >
            High
            <span className="chip-badge">{highCount}</span>
          </button>
          <button
            onClick={() => setSelectedPriority('medium')}
            className={`filter-chip medium ${selectedPriority === 'medium' ? 'active' : ''}`}
          >
            Medium
            <span className="chip-badge">{mediumCount}</span>
          </button>
          <button
            onClick={() => setSelectedPriority('low')}
            className={`filter-chip low ${selectedPriority === 'low' ? 'active' : ''}`}
          >
            Low
            <span className="chip-badge">{lowCount}</span>
          </button>
        </div>

        {/* Issues List */}
        <div className="issues-list">
          {issuesLoading ? (
            <div className="loading-issues">Loading issues...</div>
          ) : filteredIssues.length === 0 ? (
            <div className="no-issues">No issues found.</div>
          ) : (
            filteredIssues.map(issue => {
              const priorityColors = getPriorityColor(issue.issuePriority);

              return (
                <div
                  key={issue.id}
                  className="issue-card"
                  style={{ borderLeftColor: priorityColors.border }}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  <div className="issue-card-content">
                    <div className="issue-main">
                      <div className="issue-header">
                        <h3 className="issue-title">{issue.issueTitle}</h3>
                        <span 
                          className="priority-badge"
                          style={{
                            background: priorityColors.bg,
                            color: priorityColors.text
                          }}
                        >
                          {issue.issuePriority}
                        </span>
                      </div>
                      {/* --- Reporter only row --- */}
                      <div className="issue-meta" style={{margin: "8px 0 0 0"}}>
                        <div className="meta-item" style={{gap: 6, fontSize: 15, color: "#334155", fontWeight: 500}}>
                          <User size={16} style={{marginBottom: "-2px"}} />
                          Reported By:{" "}
                          <span style={{marginLeft: 3, fontWeight: 600, color: "#0f172a"}}>
                            {issue.reportedByName || "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
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
    </div>
  );
}
