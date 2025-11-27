import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';

import '../../css/Issues.css';
import CreateBuildingModal from '../../components/staff/CreateBuildingModal';
import UpdateBuildingModal from '../../components/staff/UpdateBuildingModal';

import { getAllBuildings, deleteBuilding } from '../../api/building';

export default function Issues() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------
  // FIX: Define fetchBuildings BEFORE useEffect
  // ---------------------------------------
  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllBuildings();
      if (response) setBuildings(response);
    } catch (err) {
      console.error("Error fetching buildings:", err);
      setError("Failed to load buildings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on page load
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleBuildingCreated = useCallback((newBuilding) => {
    setBuildings(prev => [...prev, newBuilding]);
  }, []);

  const handleBuildingUpdated = useCallback((updated) => {
    setBuildings(prev => prev.map(b => (b.id === updated.id ? updated : b)));
  }, []);

  const handleEditClick = useCallback((building, e) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setShowUpdateModal(true);
  }, []);

  const handleDeleteClick = useCallback((building, e) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedBuilding?.id) return;

    try {
      await deleteBuilding(selectedBuilding.id);
      setBuildings(prev => prev.filter(b => b.id !== selectedBuilding.id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete building.");
    }

    setShowDeleteModal(false);
    setSelectedBuilding(null);
  }, [selectedBuilding]);

  const handleBuildingClick = useCallback((building, e) => {
    if (e.target.closest(".building-actions")) return;
    navigate(`/staff/buildings/${building.buildingCode}`);
  }, [navigate]);

  const getTotalIssues = useCallback((b) => {
    if (!b.issueCount) return 0;
    return b.issueCount.high + b.issueCount.medium + b.issueCount.low;
  }, []);

  const sortedBuildings = useMemo(() => {
    return [...buildings].sort((a, b) => getTotalIssues(b) - getTotalIssues(a));
  }, [buildings, getTotalIssues]);

  return (
    <div className="issues-page">
      <div className="issues-header">
        <h1>Buildings Overview</h1>
        <button className="create-building-btn" onClick={() => setShowModal(true)}>
          + Create Building
        </button>
      </div>

      {error && (
        <div className="error-banner">⚠️ {error}</div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : sortedBuildings.length === 0 ? (
        <div className="empty-state">
          <h3>No Buildings Found</h3>
          <p>Create your first building to start tracking issues</p>
        </div>
      ) : (
        <div className="buildings-grid">
          {sortedBuildings.map((building) => (
            <div
              key={building.id}
              className="building-card"
              onClick={(e) => handleBuildingClick(building, e)}
            >
              <div className="building-image-container">
                <img
                  src={building.buildingImageUrl || "/placeholder-building.jpg"}
                  alt={building.buildingName}
                  className="building-image"
                />
              </div>

              <div className="building-header">
                <div>
                  <h3 className="building-name">{building.buildingName}</h3>
                  <p className="building-subtitle">{building.buildingCode}</p>
                </div>

                <div className="building-actions">
                  <button className="action-btn edit-btn" onClick={(e) => handleEditClick(building, e)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete-btn" onClick={(e) => handleDeleteClick(building, e)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="priority-badges">
                <span className="badge badge-high">
                  High: {building.issueCount?.high || 0}
                </span>
                <span className="badge badge-medium">
                  Medium: {building.issueCount?.medium || 0}
                </span>
                <span className="badge badge-low">
                  Low: {building.issueCount?.low || 0}
                </span>
              </div>

              <div className="issues-total">
                Total Issues: {getTotalIssues(building)}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateBuildingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBuildingCreated={handleBuildingCreated}
      />

      <UpdateBuildingModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onBuildingUpdated={handleBuildingUpdated}
        building={selectedBuilding}
      />

      {showDeleteModal && selectedBuilding && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Delete Building</h2>
            <p>
              Are you sure you want to delete <strong>{selectedBuilding.buildingName}</strong>?
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="danger-btn" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
