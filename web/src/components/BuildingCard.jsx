import React from 'react';
import '../css/components_css/BuildingCard.css';

function BuildingCard({ building, onClick }) {
  // Handle undefined/null issues object
  const issues = building.issues || { high: 0, medium: 0, low: 0 };
  
  const totalIssues = 
    (issues.high || 0) + 
    (issues.medium || 0) + 
    (issues.low || 0);

  // Debug log
  console.log('Building:', building.subtitle, 'Total Issues:', totalIssues, 'Issues:', issues);

  return (
    <div
      className="building-card"
      onClick={() => onClick(building)}
    >
      <div className="building-image-container">
        <img
          src={building.image}
          alt={building.name}
          className="building-image"
        />
      </div>

      <div className="building-info">
        {/* Building Code on top (bigger) */}
        <h2 className="building-code">
          {building.subtitle}
        </h2>

        {/* Building Name below (smaller) */}
        <p className="building-name">
          {building.name}
        </p>

        {totalIssues === 0 ? (
          <div className="building-card-no-issues">
            ✓ No Active Issues
          </div>
        ) : (
          <div className="building-card-issues">
            {/* Total Issues Badge - First and Prominent */}
            <div className="building-card-total-issues">
              <span className="building-card-total-count">
                {totalIssues}
              </span>
              {totalIssues === 1 ? 'Issue' : 'Issues'}
            </div>
            
            {/* Priority Badges - Only show if count > 0, removed "Priority" text */}
            {issues.high > 0 && (
              <div className="building-card-issue-badge high">
                <span className="building-card-issue-count">
                  {issues.high}
                </span>
                High
              </div>
            )}
            {issues.medium > 0 && (
              <div className="building-card-issue-badge medium">
                <span className="building-card-issue-count">
                  {issues.medium}
                </span>
                Medium
              </div>
            )}
            {issues.low > 0 && (
              <div className="building-card-issue-badge low">
                <span className="building-card-issue-count">
                  {issues.low}
                </span>
                Low
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildingCard;