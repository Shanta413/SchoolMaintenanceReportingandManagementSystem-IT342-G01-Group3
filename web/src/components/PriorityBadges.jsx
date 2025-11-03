import React from 'react';
import '../css/components_css/PriorityBadges.css';

function PriorityBadges({ issues }) {
  return (
    <div className="priority-badges">
      <span className="badge badge-high">High: {issues.high}</span>
      <span className="badge badge-medium">Medium: {issues.medium}</span>
      <span className="badge badge-low">Low: {issues.low}</span>
    </div>
  );
}

export default PriorityBadges;
