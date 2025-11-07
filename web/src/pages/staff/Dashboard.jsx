import React from 'react';
import '../../css/Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Overview of system statistics</p>
      </div>

      <div className="dashboard-content">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>Dashboard Coming Soon</h2>
          <p>Statistics and analytics will be displayed here</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;