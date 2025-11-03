import React from 'react';
import '../css/components_css/BuildingCard.css';
import PriorityBadges from './PriorityBadges';

function BuildingCard({ building, onClick }) {
  const totalIssues = building.issues.high + building.issues.medium + building.issues.low;

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
        <h3 className="building-name">{building.name}</h3>
        <p className="building-subtitle">{building.subtitle}</p>
        
        <PriorityBadges issues={building.issues} />
        
        <p className="total-issues">Total Issues: {totalIssues}</p>
      </div>
    </div>
  );
}

export default BuildingCard;