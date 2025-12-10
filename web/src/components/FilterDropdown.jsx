import React from 'react';
import '../css/components_css/FilterDropdown.css';

function FilterDropdown({ value, onChange, options, placeholder = 'Sort By' }) {
  return (
    <div className="filter-dropdown-container">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="filter-dropdown-select"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterDropdown;