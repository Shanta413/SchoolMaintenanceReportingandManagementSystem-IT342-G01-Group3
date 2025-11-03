import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import Header from '../components/Header';
import BuildingCard from '../components/BuildingCard';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import CampusMapModal from '../components/CampusMapModal';
import '../css/BuildingSelection.css';

// Mock building data
const mockBuildings = [
  {
    id: 1,
    name: 'SAL Building',
    subtitle: 'Science and Laboratory',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop',
    issues: {
      high: 8,
      medium: 10,
      low: 6
    }
  },
  {
    id: 2,
    name: 'Main Building',
    subtitle: 'Administration',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    issues: {
      high: 5,
      medium: 8,
      low: 5
    }
  },
  {
    id: 3,
    name: 'Library Building',
    subtitle: 'Learning Resource Center',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    issues: {
      high: 4,
      medium: 7,
      low: 4
    }
  },
  {
    id: 4,
    name: 'CBA Building',
    subtitle: 'College of Business Administration',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop',
    issues: {
      high: 3,
      medium: 6,
      low: 3
    }
  },
  {
    id: 5,
    name: 'Cafeteria',
    subtitle: 'Student Dining Hall',
    image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400&h=300&fit=crop',
    issues: {
      high: 2,
      medium: 4,
      low: 3
    }
  },
  {
    id: 6,
    name: 'Campus Grounds',
    subtitle: 'Outdoor Areas & Facilities',
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=400&h=300&fit=crop',
    issues: {
      high: 6,
      medium: 9,
      low: 5
    }
  }
];

const filterOptions = [
  { value: 'highest', label: 'Highest Issues First' },
  { value: 'lowest', label: 'Lowest Issues First' },
  { value: 'high-priority', label: 'Most High Priority' },
  { value: 'medium-priority', label: 'Most Medium Priority' },
  { value: 'low-priority', label: 'Most Low Priority' }
];

function BuildingSelection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  // Filter and sort buildings
  const filteredBuildings = useMemo(() => {
    let filtered = mockBuildings.filter(building =>
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply priority sorting
    if (priorityFilter) {
      filtered = [...filtered].sort((a, b) => {
        const totalA = a.issues.high + a.issues.medium + a.issues.low;
        const totalB = b.issues.high + b.issues.medium + b.issues.low;

        switch (priorityFilter) {
          case 'highest':
            return totalB - totalA;
          case 'lowest':
            return totalA - totalB;
          case 'high-priority':
            return b.issues.high - a.issues.high;
          case 'medium-priority':
            return b.issues.medium - a.issues.medium;
          case 'low-priority':
            return b.issues.low - a.issues.low;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [searchQuery, priorityFilter]);

  const handleBuildingClick = (building) => {
    console.log('Building clicked:', building);
    // Future: Navigate to building details
  };

  return (
    <div className="building-selection">
      <Header userName="User Shanta" />

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="page-title">Select Building</h1>
          <p className="page-subtitle">Choose a building to view and report issues</p>
          
          <button className="map-link" onClick={() => setShowMapModal(true)}>
            <MapPin size={16} />
            Can't find your building? Click here to view the campus map
          </button>

          {/* Search and Filter */}
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

          {/* Buildings Grid */}
          <div className="buildings-grid">
            {filteredBuildings.map(building => (
              <BuildingCard
                key={building.id}
                building={building}
                onClick={handleBuildingClick}
              />
            ))}
          </div>

          {filteredBuildings.length === 0 && (
            <div className="no-results">
              <p>No buildings found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      <CampusMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
      />
    </div>
  );
}

export default BuildingSelection;