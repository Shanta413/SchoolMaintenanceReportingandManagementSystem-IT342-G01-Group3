import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../../api/dashboard";
import { getMonthlyIssues } from "../../api/stats";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Tooltip, XAxis, YAxis, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
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
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyError, setMonthlyError] = useState(false);

  useEffect(() => {
    // Fetch dashboard stats (required)
    getDashboardStats()
      .then((data) => {
        setStats(data);
      })
      .catch((error) => {
        console.error("Failed to load dashboard stats:", error);
      })
      .finally(() => setLoading(false));

    // Fetch monthly issues (optional - gracefully handle if endpoint doesn't exist)
    getMonthlyIssues()
      .then((data) => {
        setMonthlyData(data || []);
        setMonthlyError(false);
      })
      .catch((error) => {
        console.warn("Monthly issues endpoint not available yet:", error.message);
        setMonthlyError(true);
        setMonthlyData([]);
      });
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

      {/* ROW 1: Monthly Issues Trend + Issues by Priority */}
      <div className="dashboard-two-column">
        {/* Monthly Issues Line Chart */}
        <div className="dashboard-chart-section">
          <h4>Monthly Issues Trend</h4>
          {monthlyError ? (
            <div className="chart-placeholder">
              <div className="placeholder-icon">📊</div>
              <p className="placeholder-text">Monthly trends will appear here</p>
              <p className="placeholder-subtext">Backend endpoint not configured yet</p>
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="chart-placeholder">
              <div className="placeholder-icon">📊</div>
              <p className="placeholder-text">No monthly data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Issues Reported"
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Issues by Priority */}
        <div className="dashboard-chart-section">
          <h4>Issues by Priority</h4>
          <ResponsiveContainer width="100%" height={350}>
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

      {/* ROW 2: Issues by Building + Status Summary */}
      <div className="dashboard-two-column">
        {/* Issues by Building Table */}
        <div className="dashboard-table-section-compact">
          <h4>Issues by Building</h4>
          <div className="dashboard-table-wrapper-compact">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Building Code</th>
                  <th>Building Name</th>
                  <th>Total</th>
                  <th>Active</th>
                  <th>Resolved</th>
                </tr>
              </thead>
              <tbody>
                {buildingData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No building data available
                    </td>
                  </tr>
                ) : (
                  buildingData.map((b) => (
                    <tr key={b.buildingCode}>
                      <td><strong>{b.buildingCode}</strong></td>
                      <td>{b.buildingName}</td>
                      <td><span className="count-badge">{b.issueCount}</span></td>
                      <td>{b.activeCount ?? 0}</td>
                      <td>{b.resolvedCount ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Summary */}
        <div className="dashboard-chart-section">
          <h4>Status Summary</h4>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie 
                data={statusData} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={100}
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
      </div>
    </div>
  );
}