import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
  return (
    <div className={styles.pagination}>
      <button onClick={onPrev} disabled={currentPage === 1}>
        &lt;
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={onNext} disabled={currentPage === totalPages}>
        &gt;
      </button>
    </div>
  );
};

export default Pagination;