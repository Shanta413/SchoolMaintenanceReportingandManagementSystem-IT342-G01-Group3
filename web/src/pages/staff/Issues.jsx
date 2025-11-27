import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  }, []);

  const fetchBuildings = async () => {
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
  };

  const handleBuildingCreated = (newBuilding) => {
    setBuildings(prev => [...prev, newBuilding]);
  };

  const handleBuildingUpdated = (updatedBuilding) => {
    setBuildings(prev =>
      prev.map(b =>
        b.id === updatedBuilding.id ? updatedBuilding : b
      )
    );
  };

  const handleBuildingClick = (building) => {
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
  };

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
          buildings
            .sort((a, b) => getTotalIssues(b) - getTotalIssues(a))
            .map((building) => (
              <div
                key={building.id}
                className="building-card"
                onClick={() => handleBuildingClick(building)}
              >
                {/* Card Content */}
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
                    {/* Kebab Menu */}
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
      <style>{`
        .issues-page {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .issues-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .issues-header h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.875rem;
          font-weight: 600;
          color: #111827;
        }
        .issues-subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .create-building-btn {
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          padding: 10px 24px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background 0.2s;
        }
        .create-building-btn:hover {
          background: #1d4ed8;
        }
        .error-banner {
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .error-banner button {
          margin-left: auto;
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        }
        .buildings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 1.5rem;
        }
        .building-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .building-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .building-image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f3f4f6;
        }
        .building-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .building-info {
          padding: 1.25rem;
        }
        .building-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.25rem;
        }
        .building-name {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
          flex: 1;
        }
        .building-subtitle {
          margin: 0 0 1rem 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .priority-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-high {
          background: #fee2e2;
          color: #991b1b;
        }
        .badge-medium {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-low {
          background: #dbeafe;
          color: #1e40af;
        }
        .total-issues {
          margin: 0;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }
        .loading-state,
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        .empty-state h2 {
          margin: 0 0 0.5rem 0;
          color: #374151;
        }
        .empty-state p {
          margin: 0;
          color: #6b7280;
        }
        .loading-state {
          color: #6b7280;
          font-size: 1rem;
        }
        /* Kebab menu styles */
        .card-menu-container {
          position: relative;
          margin-left: auto;
        }
        .kebab-menu-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }
        .kebab-menu {
          position: absolute;
          right: 0;
          top: 2.2rem;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.13);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          min-width: 130px;
        }
        .kebab-menu button {
          background: none;
          border: none;
          padding: 12px;
          text-align: left;
          font-size: 1rem;
          cursor: pointer;
        }
        .kebab-menu button:hover, .kebab-menu button.delete:hover {
          background: #f3f4f6;
        }
        .kebab-menu button.delete {
          color: #dc2626;
        }
        @media (max-width: 768px) {
          .issues-page {
            padding: 1rem;
          }
          .buildings-grid {
            grid-template-columns: 1fr;
          }
          .issues-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .create-building-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Issues;