import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import Header from "../components/Header";
import BuildingCard from "../components/BuildingCard";
import SearchBar from "../components/SearchBar";
import FilterDropdown from "../components/FilterDropdown";
import CampusMapModal from "../components/CampusMapModal";
import "../css/BuildingSelection.css";
import { getAllBuildings } from "../api/building";

const filterOptions = [
  { value: "highest", label: "Highest Issues First" },
  { value: "lowest", label: "Lowest Issues First" },
  { value: "high-priority", label: "Most High Priority" },
  { value: "medium-priority", label: "Most Medium Priority" },
  { value: "low-priority", label: "Most Low Priority" },
];

function BuildingSelection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showMapModal, setShowMapModal] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🟢 Auth check
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) navigate("/login");
  }, [navigate]);

  // 🟢 Fetch buildings from backend (only active buildings)
  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllBuildings()
      .then((data) => {
        // Only show active buildings (admin-created)
        setBuildings(data.filter((b) => b.buildingIsActive !== false));
      })
      .catch((err) => {
        setError("Failed to load buildings.");
      })
      .finally(() => setLoading(false));
  }, []);

  // 🟢 Filter logic (by name/code, and sorting)
  const filteredBuildings = useMemo(() => {
    let filtered = buildings.filter(
      (b) =>
        (b.buildingName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.buildingCode || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (priorityFilter) {
      filtered = [...filtered].sort((a, b) => {
        const aTotal =
          (a.issueCount?.high || 0) +
          (a.issueCount?.medium || 0) +
          (a.issueCount?.low || 0);
        const bTotal =
          (b.issueCount?.high || 0) +
          (b.issueCount?.medium || 0) +
          (b.issueCount?.low || 0);

        switch (priorityFilter) {
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
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [searchQuery, priorityFilter, buildings]);

  // 👇 Use buildingCode for navigation (not id)
  const handleBuildingClick = (building) => {
    if (building.buildingCode) {
      navigate(`/buildings/${building.buildingCode}`);
    }
  };

  return (
    <div className="building-selection">
      <Header userName="Welcome, Student" />
      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="page-title">Select Building</h1>
          <p className="page-subtitle">
            Choose a building to view and report issues
          </p>

          <button className="map-link" onClick={() => setShowMapModal(true)}>
            <MapPin size={16} />
            Can't find your building? Click here to view the campus map
          </button>

          <div className="search-filter-container">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search buildings..."
            />
            <FilterDropdown
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={filterOptions}
              placeholder="Sort By"
            />
          </div>

          {loading ? (
            <div className="loading-state">Loading buildings...</div>
          ) : error ? (
            <div className="error-banner">{error}</div>
          ) : (
            <div className="buildings-grid">
              {filteredBuildings.length === 0 ? (
                <div className="no-results">
                  <p>No buildings found matching your search.</p>
                </div>
              ) : (
                filteredBuildings.map((b) => (
                  <BuildingCard
                    key={b.id}
                    building={{
                      id: b.id,
                      name: b.buildingName,
                      subtitle: b.buildingCode,
                      image: b.buildingImageUrl, // from backend
                      issues: b.issueCount || { high: 0, medium: 0, low: 0 }, // adapt if needed
                    }}
                    onClick={() => handleBuildingClick(b)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <CampusMapModal isOpen={showMapModal} onClose={() => setShowMapModal(false)} />
    </div>
  );
}

export default BuildingSelection;
