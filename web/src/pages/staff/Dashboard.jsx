import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/dashboard";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import "../../css/Dashboard.css";

const PRIORITY_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e42",
  LOW: "#10b981",
};

const STATUS_COLORS = {
  Active: "#6366f1",
  Resolved: "#10b981"
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((data) => {
        setStats(data);
        // Debug: See what comes back!
        // console.log("Dashboard stats:", data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;
  if (!stats) return <div className="dashboard-error">Failed to load dashboard stats.</div>;

  // Pie chart data for status
  const statusData = [
    {
      name: "Active",
      value: stats.statusSummary?.ACTIVE ?? 0
    },
    {
      name: "Resolved",
      value: stats.statusSummary?.FIXED ?? 0
    }
  ];

  // Bar chart data for priority
  const priorityData = [
    { name: "High", value: stats.prioritySummary?.HIGH ?? 0 },
    { name: "Medium", value: stats.prioritySummary?.MEDIUM ?? 0 },
    { name: "Low", value: stats.prioritySummary?.LOW ?? 0 }
  ];

  const buildingData = stats.issuesByBuilding || [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Overview of maintenance system statistics</p>
      </div>

      <div className="dashboard-cards">
        <div className="stat-card">
          <h3>Total Issues</h3>
          <div className="stat-value">{stats.totalAllTime ?? 0}</div>
          <p className="stat-label">All time</p>
        </div>
        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-value">{stats.totalThisMonth ?? 0}</div>
          <p className="stat-label">Current month</p>
        </div>
        <div className="stat-card">
          <h3>Active Issues</h3>
          <div className="stat-value">{stats.statusSummary?.ACTIVE ?? 0}</div>
          <p className="stat-label">Needs attention</p>
        </div>
        <div className="stat-card">
          <h3>Resolved</h3>
          <div className="stat-value">{stats.statusSummary?.FIXED ?? 0}</div>
          <p className="stat-label">Completed</p>
        </div>
      </div>

      <div className="dashboard-analytics-grid">
        <div className="dashboard-chart">
          <h4>Status Summary</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie 
                data={statusData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={85}
                label={({ value }) => value}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-chart">
          <h4>Issues by Priority</h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name.toUpperCase()]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-table-section">
        <h4>Issues by Building</h4>
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Building Code</th>
                <th>Building Name</th>
                <th>Total Issues</th>
                <th>Active</th>
                <th>Resolved</th>
              </tr>
            </thead>
            <tbody>
              {buildingData.map((b) => (
                <tr key={b.buildingCode}>
                  <td><strong>{b.buildingCode}</strong></td>
                  <td>{b.buildingName}</td>
                  <td><span className="count-badge">{b.issueCount}</span></td>
                  <td>{b.activeCount ?? 0}</td>
                  <td>{b.resolvedCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
