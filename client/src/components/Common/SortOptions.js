import React from 'react';
import PropTypes from 'prop-types';
import './SortOptions.css';

const SortOptions = ({ sortOptions, setSortOptions }) => {
  const handleSortChange = (value) => {
    setSortOptions(value);
  };

  return (
    <div className="sort-options">
      <label htmlFor="sort">Sort By:</label>
      <select
        id="sort"
        value={sortOptions}
        onChange={(e) => handleSortChange(e.target.value)}
      >
        <option value="">None</option>
        <option value="alphabetical">Alphabetical (A-Z)</option>
        <option value="alphabetical-desc">Alphabetical (Z-A)</option>
        <option value="weight">Weight (Low to High)</option>
        <option value="weight-desc">Weight (High to Low)</option>
      </select>
    </div>
  );
};

SortOptions.propTypes = {
  sortOptions: PropTypes.string,
  setSortOptions: PropTypes.func,
};

export default SortOptions;
