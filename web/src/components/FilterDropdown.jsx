import React from 'react';
import '../css/components_css/FilterDropdown.css';

function FilterDropdown({ value, onChange, options, placeholder = 'Sort By' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="filter-select"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default FilterDropdown;
