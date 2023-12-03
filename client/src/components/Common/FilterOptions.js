import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FilterOptions.css';

const FilterOptions = ({ filterOptions, setFilterOptions }) => {
  const [temperaments, setTemperaments] = useState([]);

  useEffect(() => {
    const fetchTemperaments = async () => {
      try {
        const response = await axios.get('http://localhost:5001/temperaments');
        const data = response.data;
        setTemperaments(data);
      } catch (error) {
        console.error('Error fetching temperaments:', error);
      }
    };

    fetchTemperaments();
  }, []);

  const handleTemperamentChange = (e) => {
    setFilterOptions({ ...filterOptions, temperament: e.target.value });
  };

  const handleSourceChange = (e) => {
    setFilterOptions({ ...filterOptions, source: e.target.value });
  };

  return (
    <div className="filter-options">
      <label htmlFor="temperament-select">Temperament:</label>
      <select
        id="temperament-select"
        value={filterOptions.temperament}
        onChange={handleTemperamentChange}
      >
        <option value="">All</option>
        {temperaments.map((temperament) => (
          <option key={temperament.name} value={temperament.name}>
            {temperament.name}
          </option>
        ))}
      </select>

      <label htmlFor="source-select">Source:</label>
      <select
        id="source-select"
        value={filterOptions.source}
        onChange={handleSourceChange}
      >
        <option value="">All</option>
        <option value="API">API</option>
        <option value="DB">DB</option>
      </select>
    </div>
  );
};

export default FilterOptions;
