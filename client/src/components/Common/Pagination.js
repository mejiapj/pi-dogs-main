import React from 'react';
import './Pagination.css';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const Pagination = ({ currentPage, dogsPerPage, totalDogs, onChangePage }) => {
  const totalPages = Math.ceil(totalDogs / dogsPerPage);

  const handleClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onChangePage(page);
    }
  };

  return (
    <div className="pagination">
      <div className="page-buttons">
        <button
          className="prevPage"
          onClick={() => handleClick(currentPage - 1)}
        >
          <KeyboardArrowLeftIcon />
        </button>
      </div>
      <div className="page-info">
        <p>
          Total results: {totalDogs} | Page: {currentPage} of {totalPages}
        </p>
      </div>
      <div className="page-buttons">
        <button
          className="nextPage"
          onClick={() => handleClick(currentPage + 1)}
        >
          <KeyboardArrowRightIcon />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
