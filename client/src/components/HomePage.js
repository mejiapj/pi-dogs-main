import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import SearchBar from './Common/SearchBar';
import Pagination from './Common/Pagination';
import FilterOptions from './Common/FilterOptions';
import SortOptions from './Common/SortOptions';
import DogCard from './Common/DogCard';
import './HomePage.css';

const HomePage = () => {
  const history = useHistory();
  const [dogs, setDogs] = useState([]);
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    dogsPerPage: 8,
  });
  const [filterOptions, setFilterOptions] = useState({
    temperament: '',
    source: '',
  });
  const [sortOptions, setSortOptions] = useState('');

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await fetch('http://localhost:5001/dogs');
        const data = await response.json();
        setDogs(data);
      } catch (error) {
        console.error('Error fetching dogs:', error);
      }
    };

    fetchDogs();
  }, []);

  useEffect(() => {
    const filterAndSortDogs = () => {
      if (Array.isArray(dogs)) {
        const filteredAndSortedDogs = dogs
          .filter((dog) => {
            if (filterOptions.temperament) {
              return (
                dog.temperaments &&
                dog.temperaments.includes(filterOptions.temperament)
              );
            }
            return true;
          })
          .filter((dog) => {
            if (filterOptions.source) {
              return dog.origen === filterOptions.source;
            }
            return true;
          })
          .sort((a, b) => {
            if (sortOptions === 'alphabetical') {
              return a.nombre.localeCompare(b.nombre);
            } else if (sortOptions === 'alphabetical-desc') {
              return b.nombre.localeCompare(a.nombre);
            } else if (sortOptions === 'weight') {
              return parseFloat(a.peso.metric) - parseFloat(b.peso.metric);
            } else if (sortOptions === 'weight-desc') {
              return parseFloat(b.peso.metric) - parseFloat(a.peso.metric);
            }
            return 0;
          });

        setFilteredDogs(filteredAndSortedDogs);
      }
    };

    filterAndSortDogs();
  }, [dogs, filterOptions, sortOptions]);

  const handleCardClick = (dog) => {
    history.push({
      pathname: `/dogs/${dog.id}`,
      state: { dog: dog },
    });
  };

  const handleSearch = (results) => {
    setFilteredDogs(results);
  };

  const handleCreateDog = () => {
    history.push('/create-dog');
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <Pagination
        currentPage={pagination.currentPage}
        dogsPerPage={pagination.dogsPerPage}
        totalDogs={filteredDogs.length}
        onChangePage={(page) =>
          setPagination({ ...pagination, currentPage: page })
        }
      />
      <div className="filter-sort-container">
        <FilterOptions
          filterOptions={filterOptions}
          setFilterOptions={setFilterOptions}
        />
        <SortOptions
          sortOptions={sortOptions}
          setSortOptions={setSortOptions}
        />
        <button className="create-dog-button" onClick={handleCreateDog}>
          Create Dog
        </button>
      </div>
      {filteredDogs
        .slice(
          (pagination.currentPage - 1) * pagination.dogsPerPage,
          pagination.currentPage * pagination.dogsPerPage
        )
        .map((dog) => (
          <DogCard
            key={dog.id}
            dog={dog}
            onClick={() => handleCardClick(dog)}
          />
        ))}
    </div>
  );
};

export default HomePage;
