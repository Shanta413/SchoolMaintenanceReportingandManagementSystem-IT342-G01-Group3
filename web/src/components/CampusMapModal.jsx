import React from 'react';
import "../css/components_css/CampusMapModal.css";


function CampusMapModal({ isOpen, onClose, mapImageSrc = '/citbuildings.jpg' }) {
  if (!isOpen) return null;

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>
          ×
        </button>
        <img 
          src={mapImageSrc} 
          alt="CIT Campus Map" 
          className="map-modal-image"
        />
      </div>
    </div>
  );
}

export default CampusMapModal;