import React, { useState } from 'react';
import axios from 'axios';
import './SearchBar.css';
import SearchIcon from '@material-ui/icons/Search';
import dogsImage from '../../images/dog332.gif';
import { useHistory } from 'react-router-dom';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const history = useHistory();

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/dogs/name/search/?name=${searchQuery}`
      );
      const searchResults = response.data;
      // console.log(searchResults);
      onSearch(searchResults);
    } catch (error) {
      console.error('Error searching breeds:', error);
    }
  };

  const handleImageClick = () => {
    history.push('/');
  };

  const handleMouseOver = () => {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'block';
  };

  const handleMouseLeave = () => {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
  };

  const handleFormSubmit = (event) => {
    event.preventDefault(); // Evitar el envío del formulario
    handleSearch();
  };

  return (
    <div className="search-bar">
      <div className="img-container">
        <img
          src={dogsImage}
          alt=""
          width="30%"
          height="auto"
          onClick={handleImageClick}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        />
        <div id="tooltip" className="tooltip">
          Go to landing page
        </div>
      </div>
      <h1>Search by breed name v1</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="search-input">
          <div className="search-input-inner">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Enter breed name"
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Search</button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
