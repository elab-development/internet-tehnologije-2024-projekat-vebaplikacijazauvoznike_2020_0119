import { useState, useEffect } from 'react';
import styles from '../../pages/HomePage.module.css';
import Input from '../common/Input';
import SearchResults from '../search/SearchResults';
import Header from '../layout/Header';
import { search, deleteProduct, getSupplier, updateSupplier, deleteSupplier, getImporter, updateImporter, deleteImporter } from '../../services/apiService';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../providers/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

import decorLogo from '../../assets/images/logotype_01.02.webp';

const AdminDashboard = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [currentPage, setCurrentPage] = useState(1);
  const [companyName, setCompanyName] = useState('Admin');

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    price_min: '',
    price_max: '',
    volume_min: '',
    volume_max: '',
  });

  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const debouncedFilters = useDebounce(filters, 400);
  const debouncedSortBy = useDebounce(sortBy, 400);
  const debouncedSortOrder = useDebounce(sortOrder, 400);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        q: debouncedSearchQuery,
        ...(searchType === 'products' && debouncedFilters),
        sort_by: debouncedSortBy,
        sort_order: debouncedSortOrder,
      };
      const data = await search(searchType, params);
      setResults(data.data);
      setTotalPages(data.last_page);
      setTotalResults(data.total);
    } catch (err) {
      setError(`Failed to fetch ${searchType}. Please try again later.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state && location.state.searchType) {
      setSearchType(location.state.searchType);
      // Clear the state so it doesn't persist on subsequent renders
      navigate(location.pathname, { replace: true, state: {} }); // Clear state
    }
    setResults([]);
    setCurrentPage(1);
  }, [searchType, location.state, navigate, location.pathname]);

  useEffect(() => {
    if (isAuthLoading) return;

    let isCancelled = false;

    const doFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                q: debouncedSearchQuery,
                ...(searchType === 'products' && debouncedFilters),
                sort_by: debouncedSortBy,
                sort_order: debouncedSortOrder,
            };
            const data = await search(searchType, params);
            if (!isCancelled) {
                setResults(data.data);
                setTotalPages(data.last_page);
                setTotalResults(data.total);
            }
        } catch (err) {
            if (!isCancelled) {
                setError(`Failed to fetch ${searchType}. Please try again later.`);
                console.error(err);
            }
        } finally {
            if (!isCancelled) {
                setLoading(false);
            }
        }
    };

    doFetch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearchQuery, debouncedFilters, debouncedSortBy, debouncedSortOrder, searchType, currentPage, isAuthLoading]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const getSortOptions = () => {
    if (searchType === 'products') {
      return [
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'volume-asc', label: 'Volume (Min-Max)' },
        { value: 'volume-desc', label: 'Volume (Max-Min)' },
        { value: 'price-asc', label: 'Price (Min-Max)' },
        { value: 'price-desc', label: 'Price (Max-Min)' },
      ];
    } else if (searchType === 'importers' || searchType === 'suppliers') {
      return [
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'country-asc', label: 'Country (A-Z)' },
        { value: 'country-desc', label: 'Country (Z-A)' },
      ];
    }
    return [];
  };

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

  const handleEdit = (id) => {
    if (searchType === 'products') {
      navigate(`/my-products/edit/${id}`);
    } else if (searchType === 'suppliers') {
      navigate(`/suppliers/edit/${id}`);
    } else if (searchType === 'importers') {
      navigate(`/importers/edit/${id}`);
    }
  };

  const handleDelete = async (id) => {
    let confirmMessage = '';
    let deleteFunction;
    let successMessage = '';
    let errorMessage = '';

    if (searchType === 'products') {
      confirmMessage = 'Are you sure you want to delete this product?';
      deleteFunction = deleteProduct;
      successMessage = 'Product deleted successfully!';
      errorMessage = 'Error deleting product:';
    } else if (searchType === 'suppliers') {
      confirmMessage = 'Are you sure you want to delete this supplier?';
      deleteFunction = deleteSupplier;
      successMessage = 'Supplier deleted successfully!';
      errorMessage = 'Error deleting supplier:';
    } else if (searchType === 'importers') {
      confirmMessage = 'Are you sure you want to delete this importer?';
      deleteFunction = deleteImporter;
      successMessage = 'Importer deleted successfully!';
      errorMessage = 'Error deleting importer:';
    } else {
      return; // Should not happen
    }

    if (window.confirm(confirmMessage)) {
      try {
        await deleteFunction(id);
        alert(successMessage);
        fetchData(); // Refresh the list
      } catch (err) {
        alert(`${errorMessage} ${err.message}`);
      }
    }
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
              Search for anything!
            </h1>
            <p className={styles.description}>
              Search through <strong>the entire database</strong>.
            </p>
            <div className={styles.form}>
              <div className={styles.searchInputWrapper}>
                <Input
                  id="searchInput"
                  name="q"
                  type="search"
                  placeholder={`Search ${searchType}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className={styles.searchToggle}>
                 <button
                  type="button"
                  onClick={() => setSearchType('products')}
                  className={`${styles.toggleButton} ${searchType === 'products' ? styles.active : ''}`}
                  aria-pressed={searchType === 'products'}
                >
                  <span className={styles.toggleButtonText}>Products</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('suppliers')}
                  className={`${styles.toggleButton} ${searchType === 'suppliers' ? styles.active : ''}`}
                  aria-pressed={searchType === 'suppliers'}
                >
                  <span className={styles.toggleButtonText}>Suppliers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('importers')}
                  className={`${styles.toggleButton} ${searchType === 'importers' ? styles.active : ''}`}
                  aria-pressed={searchType === 'importers'}
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
                {searchQuery.trim() ? `Search results for "${searchQuery}"` : `All ${searchType}`}
              </h2>
              <div className={styles.searchResultsMeta}>
                {totalResults} results found
                {searchType === 'products' && (
                  <button onClick={() => setShowFilters(!showFilters)} className={styles.filterButton}>
                    Filters
                  </button>
                )}
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
            {showFilters && searchType === 'products' && (
              <div className={styles.filtersContainer}>
                <Input name="price_min" value={filters.price_min} onChange={handleFilterChange} placeholder="Min Price" type="number" />
                <Input name="price_max" value={filters.price_max} onChange={handleFilterChange} placeholder="Max Price" type="number" />
                <Input name="volume_min" value={filters.volume_min} onChange={handleFilterChange} placeholder="Min Volume" type="number" />
                <Input name="volume_max" value={filters.volume_max} onChange={handleFilterChange} placeholder="Max Volume" type="number" />
              </div>
            )}
            {loading && <div className={styles.loadingMessage}>Loading...</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}
            {!loading && !error && (
              <SearchResults
                results={results}
                searchType={searchType}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
                isAdmin={user.role === 'admin'}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
