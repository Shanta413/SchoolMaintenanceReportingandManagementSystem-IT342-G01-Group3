import React from 'react';
import { Search, X } from 'lucide-react';
import '../css/components_css/SearchBar.css';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="search-box">
      <Search size={20} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
      {value && (
        <button 
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
          type="button"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;