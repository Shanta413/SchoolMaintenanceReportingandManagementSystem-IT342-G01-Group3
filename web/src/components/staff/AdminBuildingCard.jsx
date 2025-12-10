import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import BuildingCard from '../BuildingCard';
import '../../css/components_css/AdminBuildingCard.css';

function AdminBuildingCard({ building, onClick, onEdit, onDelete }) {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  // Transform building data to match BuildingCard props
  const buildingData = {
    id: building.id,
    name: building.buildingName,
    subtitle: building.buildingCode,
    image: building.buildingImageUrl,
    issues: building.issueCount || { high: 0, medium: 0, low: 0 },
  };

  return (
    <div className="admin-building-card-wrapper">
      <BuildingCard building={buildingData} onClick={onClick} />
      
      {/* Action Buttons - Always visible on same row as building code */}
      <div className="admin-card-actions">
        <button 
          className="admin-card-edit-btn" 
          onClick={handleEdit}
          title="Edit Building"
        >
          <Edit size={14} />
        </button>
        <button 
          className="admin-card-delete-btn" 
          onClick={handleDelete}
          title="Delete Building"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default AdminBuildingCard;