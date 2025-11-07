import React from 'react';
import '../../css/Issues.css';

function Issues() {
  return (
    <div className="issues-page">
      <div className="issues-header">
        <h1>Issues</h1>
        <p className="issues-subtitle">Manage maintenance requests</p>
      </div>

      <div className="issues-content">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h2>Issues Management Coming Soon</h2>
          <p>View and manage all maintenance requests here</p>
        </div>
      </div>
    </div>
  );
}

export default Issues;