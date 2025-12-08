import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/Issues.css";

import { getAllBuildings, deleteBuilding } from "../../api/building";

import CreateBuildingModal from "../../components/staff/CreateBuildingModal";
import UpdateBuildingModal from "../../components/staff/UpdateBuildingModal";
import AdminBuildingCard from "../../components/staff/AdminBuildingCard";
import SearchBar from "../../components/SearchBar";
import FilterDropdown from "../../components/FilterDropdown";

import useAutoRefresh from "../../hooks/useAutoRefresh";

const filterOptions = [
  { value: "highest", label: "Highest Issues First" },
  { value: "lowest", label: "Lowest Issues First" },
  { value: "high-priority", label: "Most High Priority" },
  { value: "medium-priority", label: "Most Medium Priority" },
  { value: "low-priority", label: "Most Low Priority" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "code-asc", label: "Code (A-Z)" },
  { value: "code-desc", label: "Code (Z-A)" },
];

export default function Issues() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("highest");

  // ============================================
  // FETCH BUILDINGS (auto-refresh safe)
  // ============================================
  const fetchBuildings = useCallback(async () => {
    try {
      const response = await getAllBuildings();
      if (response) setBuildings(response);
    } catch (err) {
      console.error("Error fetching buildings:", err);
      setError("Failed to load buildings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  // AUTO-REFRESH every 3 seconds
  useAutoRefresh(fetchBuildings, 3000, true);

  // ============================================
  // CREATE / UPDATE CALLBACKS
  // ============================================
  const handleBuildingCreated = useCallback(
    (newBuilding) => {
      setBuildings((prev) => [...prev, newBuilding]);
    },
    []
  );

  const handleBuildingUpdated = useCallback(
    (updated) => {
      setBuildings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b))
      );
    },
    []
  );

  // ============================================
  // EDIT + DELETE
  // ============================================
  const handleEditClick = useCallback((building) => {
    setSelectedBuilding(building);
    setShowUpdateModal(true);
  }, []);

  const handleDeleteClick = useCallback((building) => {
    setSelectedBuilding(building);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedBuilding?.id) return;

    try {
      await deleteBuilding(selectedBuilding.id);
      setBuildings((prev) => prev.filter((b) => b.id !== selectedBuilding.id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete building.");
    }

    setShowDeleteModal(false);
    setSelectedBuilding(null);
  }, [selectedBuilding]);

  // ============================================
  // CLICK → NAVIGATE
  // ============================================
  const handleBuildingClick = useCallback(
    (building) => {
      if (building?.buildingCode) {
        navigate(`/staff/buildings/${building.buildingCode}`);
      }
    },
    [navigate]
  );

  // ============================================
  // TOTAL ISSUES (helper)
  // ============================================
  const getTotalIssues = useCallback((b) => {
    if (!b.issueCount) return 0;
    return (
      (b.issueCount.high || 0) +
      (b.issueCount.medium || 0) +
      (b.issueCount.low || 0)
    );
  }, []);

  // ============================================
  // FILTER AND SORT BUILDINGS
  // ============================================
  const filteredAndSortedBuildings = useMemo(() => {
    let filtered = buildings.filter((b) => {
      const matchesName = (b.buildingName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCode = (b.buildingCode || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesName || matchesCode;
    });

    if (sortFilter) {
      filtered = [...filtered].sort((a, b) => {
        const aTotal = getTotalIssues(a);
        const bTotal = getTotalIssues(b);

        switch (sortFilter) {
          case "highest":
            return bTotal - aTotal;
          case "lowest":
            return aTotal - bTotal;
          case "high-priority":
            return (b.issueCount?.high || 0) - (a.issueCount?.high || 0);
          case "medium-priority":
            return (b.issueCount?.medium || 0) - (a.issueCount?.medium || 0);
          case "low-priority":
            return (b.issueCount?.low || 0) - (a.issueCount?.low || 0);
          case "name-asc":
            return (a.buildingName || "").localeCompare(b.buildingName || "");
          case "name-desc":
            return (b.buildingName || "").localeCompare(a.buildingName || "");
          case "code-asc":
            return (a.buildingCode || "").localeCompare(b.buildingCode || "");
          case "code-desc":
            return (b.buildingCode || "").localeCompare(a.buildingCode || "");
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [buildings, searchQuery, sortFilter, getTotalIssues]);

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="issues-page">
      <main className="main-content">
        <div className="content-wrapper">
          {/* HEADER */}
          <div className="issues-header">
            <div>
              <h1 className="page-title">Buildings Overview</h1>
              <p className="page-subtitle">Manage buildings and track maintenance issues</p>
            </div>
            <button className="create-building-btn" onClick={() => setShowModal(true)}>
              + Create Building
            </button>
          </div>

          {/* ERROR */}
          {error && <div className="error-banner">{error}</div>}

          {/* SEARCH + FILTER */}
          <div className="search-filter-container">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search buildings..."
            />

            <FilterDropdown
              value={sortFilter}
              onChange={setSortFilter}
              options={filterOptions}
              placeholder="Filter & Sort"
            />
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="loading-state">Loading buildings...</div>
          ) : filteredAndSortedBuildings.length === 0 ? (
            <div className="no-results">
              <p>
                {searchQuery
                  ? "No buildings found matching your search."
                  : "No buildings found. Create your first building to get started."}
              </p>
            </div>
          ) : (
            <div className="buildings-grid">
              {filteredAndSortedBuildings.map((building) => (
                <AdminBuildingCard
                  key={building.id}
                  building={building}
                  onClick={() => handleBuildingClick(building)}
                  onEdit={() => handleEditClick(building)}
                  onDelete={() => handleDeleteClick(building)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* CREATE MODAL */}
      <CreateBuildingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBuildingCreated={handleBuildingCreated}
      />

      {/* UPDATE MODAL */}
      <UpdateBuildingModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onBuildingUpdated={handleBuildingUpdated}
        building={selectedBuilding}
      />

      {/* DELETE MODAL */}
      {showDeleteModal && selectedBuilding && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h2>Delete Building</h2>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedBuilding.buildingName}</strong>?
            </p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="danger-btn" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}