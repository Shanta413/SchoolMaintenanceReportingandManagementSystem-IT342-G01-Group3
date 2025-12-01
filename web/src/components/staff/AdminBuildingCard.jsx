import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import "../../css/components_css/BuildingCard.css";
import PriorityBadges from "../PriorityBadges";

export default function AdminBuildingCard({ building, onClick, onEdit, onDelete }) {
  const totalIssues =
    (building.issueCount?.high || 0) +
    (building.issueCount?.medium || 0) +
    (building.issueCount?.low || 0);

  return (
    <div className="building-card admin-version" onClick={onClick}>
      {/* IMAGE */}
      <div className="building-image-container">
        <img
          src={building.buildingImageUrl || "/placeholder-building.jpg"}
          alt={building.buildingName}
          className="building-image"
        />
      </div>

      <div className="building-info">

        {/* TOP ROW → Code + Edit/Delete buttons */}
        <div className="card-top-row">
          <h2 className="building-code">{building.buildingCode}</h2>

          <div className="admin-inline-actions">
            <button
              className="admin-inline-btn edit"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Edit2 size={16} />
            </button>

            <button
              className="admin-inline-btn delete"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* NAME BELOW */}
        <p className="building-name">{building.buildingName}</p>

        <PriorityBadges issues={building.issueCount || {}} />

        <p className="total-issues">Total Issues: {totalIssues}</p>
      </div>
    </div>
  );
}
