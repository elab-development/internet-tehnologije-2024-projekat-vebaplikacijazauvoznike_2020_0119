import styles from './SearchResults.module.css';
import ResultCard from './ResultCard';
import Pagination from './Pagination';

const SearchResults = ({ results, searchType, onAddToCart, currentPage, totalPages, onPrevPage, onNextPage, isAdmin, onEdit, onDelete }) => {
  const hasResults = results && results.length > 0;

  return (
    <>
      {hasResults ? (
        <div className={styles.grid}>
          {results.map((item) => (
            <ResultCard 
              key={`${searchType}-${item.id}`} 
              item={item} 
              type={searchType} 
              onAddToCart={onAddToCart}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>No results found.</div>
      )}

      {hasResults && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={onPrevPage}
          onNext={onNextPage}
        />
      )}
    </>
  );
};

export default SearchResults;
