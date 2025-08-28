import { useState, useEffect } from 'react';
import styles from '../../pages/HomePage.module.css'; // Podesi putanju
import Input from '../common/Input';
import SearchResults from '../search/SearchResults';
import Header from '../layout/Header';
import { getProducts, getSuppliers, addItemToContainer, getPartnerships } from '../../services/apiService'; // Added getPartnerships
import { useDebounce } from '../../hooks/useDebounce';

import decorLogo from '../../assets/images/logotype_01.02.webp';

const ImporterHomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('products');
  const [currentPage, setCurrentPage] = useState(1);
  const [companyName, setCompanyName] = useState('Importer');

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const debouncedFilters = useDebounce(filters, 400);
  const debouncedSortBy = useDebounce(sortBy, 400);
  const debouncedSortOrder = useDebounce(sortOrder, 400);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          q: debouncedSearchQuery,
          ...debouncedFilters,
          sort_by: debouncedSortBy,
          sort_order: debouncedSortOrder,
        };
        const data = await getProducts(params);
        setProducts(data.data);
        setTotalPages(data.last_page);
        setTotalResults(data.total);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          // Pagination parameters might not be directly supported by getPartnerships
          // q: debouncedSearchQuery, // Search query might not be directly supported by getPartnerships
          // sort_by: debouncedSortBy,
          // sort_order: debouncedSortOrder,
        };
        const data = await getPartnerships(params);
        const adaptedSuppliers = data.map(partnership => partnership.supplier);
        setSuppliers(adaptedSuppliers);
        setTotalResults(adaptedSuppliers.length);
        setTotalPages(1);
      } catch (err) {
        setError('Failed to fetch partners. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (searchType === 'products') {
      fetchProducts();
    } else {
      fetchSuppliers();
    }
  }, [debouncedSearchQuery, debouncedFilters, searchType, currentPage, debouncedSortBy, debouncedSortOrder]);

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
    } else if (searchType === 'suppliers') {
      return [
        { value: 'company_name-asc', label: 'Company Name (A-Z)' },
        { value: 'company_name-desc', label: 'Company Name (Z-A)' },
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

  const handleAddToCart = async (productId, quantity) => {
    try {
      const result = await addItemToContainer(productId, quantity);
      console.log('Item added', result);
      alert('Product added to container!');
    } catch (error) {
      console.error('Failed to add item', error);
      alert(`Error: ${error.message}`);
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
              Find Your Next Shipment!
            </h1>
            <p className={styles.description}>
              Search through <strong>our product catalog</strong><br />and
              <strong>start importing today</strong>.
            </p>
            <div className={styles.form}>
              <div className={styles.searchInputWrapper}>
                <Input
                  id="searchInput"
                  name="q"
                  type="search"
                  placeholder={searchType === 'products' ? 'Search products' : 'Search partners'}
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
              </div>
            </div>
          </div>
        </section>

        <section id="searchResults" className={styles.searchResultsContainer}>
          <div className={styles.searchResultsInner}>
            <header className={styles.searchResultsHead}>
              <h2 className={styles.searchResultsTitle}>
                {searchQuery.trim() ? `Search results for "${searchQuery}"` : `Partnership ${searchType === 'suppliers' ? 'Suppliers' : searchType}`}
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
            {!loading && !error && searchType === 'suppliers' && suppliers.length === 0 && (
              <div className={styles.noResults}>No partnership suppliers found.</div>
            )}
            {!loading && !error && (
              <SearchResults
                results={searchType === 'products' ? products : suppliers}
                searchType={searchType}
                onAddToCart={handleAddToCart}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ImporterHomePage;