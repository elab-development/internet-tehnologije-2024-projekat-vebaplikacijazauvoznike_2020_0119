import { useState, useEffect } from 'react';
import styles from '../../pages/HomePage.module.css';
import Input from '../common/Input';
import SearchResults from '../search/SearchResults';
import ProductForm from './ProductForm';
import Header from '../layout/Header';
import { getProducts, createProduct, updateProduct, deleteProduct, getImporters, getPartnerships } from '../../services/apiService'; // Added getPartnerships
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../providers/AuthProvider';

import decorLogo from '../../assets/images/logotype_01.02.webp';

const SupplierHomePage = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [companyName, setCompanyName] = useState('Supplier');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const debouncedSortBy = useDebounce(sortBy, 400);
  const debouncedSortOrder = useDebounce(sortOrder, 400);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        q: debouncedSearchQuery,
        sort_by: debouncedSortBy,
        sort_order: debouncedSortOrder,
      };
      // Call getPartnerships, which will filter by supplier_id on the backend
      const data = await getPartnerships(params);
      // Extract importer data from partnership objects
      const importerResults = data.map(partnership => partnership.importer);
      setResults(importerResults);
      setTotalResults(importerResults.length);
      setTotalPages(1);
    } catch (err) {
      setError(`Failed to fetch partners. Please try again later.`); // Updated error message
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    fetchData();
  }, [debouncedSearchQuery, currentPage, isAuthLoading, debouncedSortBy, debouncedSortOrder]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        alert('Product deleted successfully!');
        fetchData(); // Refresh the list
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getSortOptions = () => {
    return [
      { value: 'company_name-asc', label: 'Company Name (A-Z)' },
      { value: 'company_name-desc', label: 'Company Name (Z-A)' },
      { value: 'country-asc', label: 'Country (A-Z)' },
      { value: 'country-desc', label: 'Country (Z-A)' },
    ];
  };

  return (
    <div className={`${styles.pageContainer} ${styles.searchActive}`}>
      <div className={styles.fullPageBlobContainer} />
      <Header />
      <main className={styles.contentWrapper}>
        <img src={decorLogo} alt="" className={styles.decorLogo} aria-hidden="true" />

        <section className={`${styles.hero} ${styles.searchActive}`}>
          <div className={styles.heroInner}>
            <h1 className={styles.title}>
              Hello <span id="companyName">{companyName}</span> 👋
              <br />
              Search for your importers!
            </h1>
            <p className={styles.description}>
              Manage your importer listings.
            </p>
            <div className={styles.form}>
              <div className={styles.searchInputWrapper}>
                <Input
                  id="searchInput"
                  name="q"
                  type="search"
                  placeholder="Search importers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.searchToggle}>
                <button
                  type="button"
                  // Removed onClick handler as per user request
                  className={`${styles.toggleButton} ${styles.active}`}
                >
                  <span className={styles.toggleButtonText}>Importers</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="searchResults" className={styles.searchResultsContainer}>
          <div className={styles.searchResultsInner}>
            <header className={styles.searchResultsHead}>
              <h2 className={styles.searchResultsTitle}>
                {searchQuery.trim() ? `Search results for "${searchQuery}"` : 'Partnership Importers'}
              </h2>
              <div className={styles.searchResultsMeta}>
                {totalResults} results found
                <select onChange={handleSortChange} value={`${sortBy}-${sortOrder}` || ''} className={styles.filterButton}>
                  <option value="">Sort By</option>
                  {getSortOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </header>
            {loading && <div className={styles.loadingMessage}>Loading...</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            {!loading && !error && results.length === 0 && (
              <div className={styles.noResults}>No partnership importers found.</div>
            )}
            {!loading && !error && results.length > 0 && (
              <SearchResults
                results={results}
                searchType="importers"
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                isAdmin={user.role === 'admin'}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupplierHomePage;