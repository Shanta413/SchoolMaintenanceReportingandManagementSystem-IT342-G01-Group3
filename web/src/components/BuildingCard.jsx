import React from 'react';
import '../css/components_css/BuildingCard.css';
import PriorityBadges from './PriorityBadges';

function BuildingCard({ building, onClick }) {
  const totalIssues = 
    (building.issues.high || 0) + 
    (building.issues.medium || 0) + 
    (building.issues.low || 0);

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
        <h2 
          className="building-code"
          style={{
            fontSize: "26px",
            fontWeight: "700",
            marginBottom: "4px",
            color: "#1e293b"
          }}
        >
          {building.subtitle} {/* This is your buildingCode */}
        </h2>

        {/* Building Name below (smaller) */}
        <p 
          className="building-name"
          style={{
            fontSize: "18px",
            fontWeight: "500",
            color: "#6366f1",
            marginBottom: "12px"
          }}
        >
          {building.name}
        </p>

        <PriorityBadges issues={building.issues} />

        <p className="total-issues">
          Total Issues: {totalIssues}
        </p>
      </div>
    </div>
  );
}

export default BuildingCard;
