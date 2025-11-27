import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import '../../css/Issues.css';
import CreateBuildingModal from '../../components/staff/CreateBuildingModal';
import EditBuildingModal from '../../components/staff/EditBuildingModal';
import { getAllBuildings, deleteBuilding } from '../../api/building';

function Issues() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const navigate = useNavigate();
  const menuRef = useRef();

  // Close kebab if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(null);
      }
    }
    if (menuOpen !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBuildings();
      setBuildings(data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setError("Failed to load buildings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBuildingCreated = useCallback((newBuilding) => {
    setBuildings(prev => [...prev, newBuilding]);
  }, []);

  const handleBuildingUpdated = useCallback((updatedBuilding) => {
    setBuildings(prev => prev.map(b => 
      b.id === updatedBuilding.id ? updatedBuilding : b
    ));
  }, []);

  const handleBuildingClick = useCallback((building, e) => {
    // Don't navigate if clicking on action buttons
    if (e?.target?.closest('.building-actions')) {
      return;
    }
    navigate(`/staff/buildings/${building.buildingCode}`);
  }, [navigate]);

  const handleEditClick = useCallback((building, e) => {
    e.stopPropagation();
    setSelectedBuilding(building);
    setShowUpdateModal(true);
  }, []);

  const handleBuildingUpdated = (updatedBuilding) => {
    setBuildings(prev =>
      prev.map(b =>
        b.id === updatedBuilding.id ? updatedBuilding : b
      )
    );
  };

  const handleBuildingClick = (building, e) => {
    // Don't navigate if clicking on action buttons
    if (e?.target?.closest('.card-menu-container')) {
      return;
    }
    navigate(`/staff/buildings/${building.buildingCode}`);
  };

  const getTotalIssues = (building) => {
    if (building.issueCount) {
      return (
        building.issueCount.high +
        building.issueCount.medium +
        building.issueCount.low
      );
    }
    return 0;
  }, []);

  const sortedBuildings = useMemo(() => {
    return [...buildings].sort((a, b) => getTotalIssues(b) - getTotalIssues(a));
  }, [buildings, getTotalIssues]);

  const handleEdit = (building) => {
    setEditingBuilding(building);
    setShowEditModal(true);
    setMenuOpen(null);
  };

  const handleDelete = async (building) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${building.buildingName}"?`
      )
    ) {
      try {
        await deleteBuilding(building.id);
        setBuildings(prev =>
          prev.filter(b => b.id !== building.id)
        );
      } catch (err) {
        alert("Couldn't delete building. Try again.");
      }
    }
    setMenuOpen(null);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === id ? null : id);
  };

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <h1>Issues</h1>
          <p className="issues-subtitle">
            Buildings ranked by highest issue count
          </p>
        </div>
        <button
          className="create-building-btn"
          onClick={() => setShowModal(true)}
        >
          + Create Building
        </button>
      </div>
      <CreateBuildingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBuildingCreated={handleBuildingCreated}
      />
      {showEditModal && (
        <EditBuildingModal
          isOpen={showEditModal}
          building={editingBuilding}
          onClose={() => setShowEditModal(false)}
          onBuildingUpdated={handleBuildingUpdated}
        />
      )}
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
          <button onClick={fetchBuildings}>Retry</button>
        </div>
      )}
      <div className="buildings-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading buildings...</p>
          </div>
        ) : buildings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏢</div>
            <h2>No Buildings Yet</h2>
            <p>
              Create your first building to start tracking issues
            </p>
          </div>
        ) : (
          sortedBuildings.map((building) => (
              <div
                key={building.id}
                className="building-card"
                onClick={(e) => handleBuildingClick(building, e)}
              >
                <div className="building-image-container">
                  <img
                    src={
                      building.buildingImageUrl ||
                      "/placeholder-building.jpg"
                    }
                    alt={building.buildingName}
                    className="building-image"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/400x200/e5e7eb/6b7280?text=Building+Image";
                    }}
                  />
                </div>
                <div className="building-info">
                  <div className="building-header-row">
                    <h3 className="building-name">
                      {building.buildingCode}
                    </h3>
                    <div
                      className="card-menu-container"
                      ref={menuOpen === building.id ? menuRef : null}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="kebab-menu-btn"
                        onClick={(e) => toggleMenu(building.id, e)}
                        aria-label="Actions"
                      >
                        &#8942;
                      </button>
                      {menuOpen === building.id && (
                        <div className="kebab-menu">
                          <button
                            onClick={() => handleEdit(building)}
                            tabIndex="0"
                          >
                            Update
                          </button>
                          <button
                            className="delete"
                            onClick={() => handleDelete(building)}
                            tabIndex="0"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="building-subtitle">
                    {building.buildingName}
                  </p>
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
                  <p className="total-issues">
                    Total Issues: {getTotalIssues(building)}
                  </p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Issues;
