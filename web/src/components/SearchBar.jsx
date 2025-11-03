import React from 'react';
import { Search } from 'lucide-react';
import '../css/components_css/SearchBar.css';

function SearchBar({ value, onChange, placeholder = 'Search...' }) {
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
    </div>
  );
}

export default SearchBar;
