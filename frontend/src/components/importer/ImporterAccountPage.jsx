import { useState, useEffect } from 'react';
import styles from '../../pages/AccountPage.module.css';
import { getCurrentContainer, shipContainer, getContainerHistory, getPartnerships, deleteProfile, deleteItemLog, deleteContainer } from '../../services/apiService';
import { useAuth } from '../../providers/AuthProvider';
import Header from '../layout/Header';
import ProfileInfo from '../common/ProfileInfo';

const ImporterAccountPage = ({ activeTab: activeTabProp }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(activeTabProp || 'current_container');
  const [container, setContainer] = useState(null);
  const [history, setHistory] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [conversionError, setConversionError] = useState(null);

  useEffect(() => {
    setActiveTab(activeTabProp);
  }, [activeTabProp]);

  useEffect(() => {
    setError(null);
    setConversionError(null);

    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/EUR');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.result === 'success') {
          setExchangeRates(data.rates);
        } else {
          throw new Error('Failed to fetch exchange rates: ' + data.result);
        }
      } catch (err) {
        setConversionError('Failed to load exchange rates.');
        console.error('Error fetching exchange rates:', err);
      }
    };

    fetchExchangeRates();
  }, []); // Fetch rates only once on component mount

  useEffect(() => {
    setError(null);

    const fetchContainer = async () => {
      try {
        setLoading(true);
        const data = await getCurrentContainer();
        setContainer(data);
      } catch (err) {
        setError('Failed to load container data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getContainerHistory({ 'status_ne': 'active' });
        setHistory(data.data);
      } catch (err) {
        setError('Failed to load order history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await getPartnerships();
        console.log('API RESPONSE FOR PARTNERS:', data);
        setPartners(data.data || []);
      } catch (err) {
        setError('Failed to load partners.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'current_container') {
      fetchContainer();
    } else if (activeTab === 'order_history') {
      fetchHistory();
    } else if (activeTab === 'partners') {
      fetchPartners();
    } else if (activeTab === 'my_profile') {
      // Nema potrebe za dohvatanjem, user objekat već imamo
      setLoading(false);
    }
  }, [activeTab]);

  const handleDeleteItem = async (itemLogId) => {
    if (window.confirm('Are you sure you want to remove this item from the container?')) {
      try {
        await deleteItemLog(itemLogId);
        // Update container state: filter out the deleted item
        setContainer(prevContainer => {
          if (!prevContainer) return null;
          const updatedItemLogs = prevContainer.item_logs.filter(item => item.id !== itemLogId);

          // Recalculate total volume and price for the container
          const newTotalVolume = updatedItemLogs.reduce((acc, item) => acc + (item.product.volume * item.quantity), 0);
          const newTotalPrice = updatedItemLogs.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

          return {
            ...prevContainer,
            item_logs: updatedItemLogs,
            total_volume: newTotalVolume, // Assuming total_volume exists in container object
            total_cost: newTotalPrice, // Assuming total_cost exists in container object
          };
        });
        alert('Item removed successfully!');
      } catch (err) {
        setError(`Failed to remove item: ${err.message}`);
        console.error(err);
      }
    }
  };

  const handleResetContainer = async () => {
    if (!container) {
      alert("No container to reset.");
      return;
    }
    if (window.confirm('Are you sure you want to reset your container? This will delete the current problematic container and create a new, empty one.')) {
      try {
        await deleteContainer(container.id);
        alert('Container has been reset successfully! The page will now reload.');
        window.location.reload();
      } catch (err) {
        alert(`Error resetting container: ${err.message}`);
      }
    }
  };

  const renderCurrentContainer = () => {
    if (loading) return <p>Loading container...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (!container) {
      return (
        <div className={styles.containerDetails}>
          <h2>My Container</h2>
          <p>Your container is currently empty. Add products from the home page to fill it up!</p>
        </div>
      );
    }

    // KORAK 1: Definišemo "sigurnu" promenljivu za item_logs
    // Ovo će uvek biti niz (ili pravi podaci ili prazan niz)
    const itemLogs = container.item_logs || [];

    // KORAK 2: Koristimo "sigurnu" promenljivu svuda ispod
    const totalVolume = itemLogs.reduce((acc, item) => acc + (item.product.volume * item.quantity), 0);
    const totalPrice = itemLogs.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const volumePercentage = container.max_volume > 0 ? (totalVolume / container.max_volume) * 100 : 0;
    const pricePercentage = container.max_price > 0 ? (totalPrice / container.max_price) * 100 : 0;

    const handleShipContainer = async () => {
      if (!container) return;
      try {
        await shipContainer(container.id);
        alert('Container has been imported!');
        setContainer(null);
        // Opciono: Pozovi fetchHistory() ako želiš da se istorija odmah ažurira
      } catch (err) {
        setError(`Failed to import container: ${err.message}`);
      }
    };

    return (
      <div className={styles.containerDetails}>
        <h2>My Container</h2>

        {itemLogs.length === 0 && (
          <p>Your container is currently empty. Add products from the home page to fill it up!</p>
        )}

        <div className={styles.volumeTracker}>
          <span>Volume: {totalVolume.toFixed(2)} / {container.max_volume} m³ ({volumePercentage.toFixed(2)}%)</span>
          <progress value={totalVolume} max={container.max_volume} style={{ accentColor: 'var(--blur-blue)' }} />
        </div>

        <div className={styles.priceTracker}>
          <span>Price: {totalPrice.toFixed(2)} / {container.max_price}€ ({pricePercentage.toFixed(2)}%)</span>
          <progress value={totalPrice} max={container.max_price} style={{ accentColor: 'var(--blur-yellow)' }} />
        </div>

        {itemLogs.length > 0 && (
          <div className={styles.productCardsContainer}>
            {itemLogs.map(item => (
              <div key={item.id} className={styles.productCard}>
                <div className={styles.productInfo}>
                  <h4>{item.product.name} (x{item.quantity})</h4>
                  <p>Volume: {item.product.volume} m³ per item</p>
                  <p>Price: {item.product.price}€ per item</p>
                  <p>Total for this item: {(item.product.price * item.quantity).toFixed(2)}€</p>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className={styles.deleteProfileButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <h3>Total Cost: {totalPrice.toFixed(2)}€</h3>
          {conversionError && <p className={styles.error}>{conversionError}</p>}
          {exchangeRates ? (
            <div className={styles.conversionRates}>
              <p><strong>~ {(totalPrice * exchangeRates.USD).toFixed(2)}$</strong></p>
              <p><strong>~ {(totalPrice * exchangeRates.RSD).toFixed(2)} RSD</strong></p>
            </div>
          ) : (
            !conversionError && <p>Loading exchange rates...</p>
          )}
          <button onClick={handleShipContainer} className={styles.shipButton}>Import Container</button>
        </div>
      </div>
    );
  };
  
  const renderHistory = () => {
    if (loading) return <p>Loading history...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (history.length === 0) return <p>No past orders found.</p>;

    return (
      <div className={styles.historyList}>
        {history.map(cont => (
          <div key={cont.id} className={styles.historyItem}>
            <h4>Container #{cont.id} - {cont.supplier.company_name}</h4>
            <p>Status: <span className={`${styles.status} ${styles[cont.status]}`}>{cont.status}</span></p>
            <p>Total Cost: {cont.total_cost.toFixed(2)}€</p>
            <p>Date: {new Date(cont.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderPartners = () => {
    if (loading) return <p>Loading partners...</p>;
    if (error) return <p className={styles.error}>{error}</p>;
    if (partners.length === 0) return <p>No partners found.</p>;

    return (
      <div className={styles.partnerList}>
        {partners.map(p => (
          <div key={p.id} className={styles.partnerItem}>
            <h4>{p.supplier?.company_name || 'Unknown Supplier'}</h4>
            <p>Country: {p.supplier?.country || 'N/A'}</p>
            <p>Member since: {new Date(p.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderMyProfile = () => {
    if (!user) return null;

    const handleDeleteProfile = async () => {
      if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
        try {
          await deleteProfile();
          alert('Profile deleted successfully.');
          logout();
        } catch (err) {
          alert(`Error: ${err.message}`);
        }
      }
    };

    return <ProfileInfo user={user} handleDelete={handleDeleteProfile} />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'current_container':
        return renderCurrentContainer();
      case 'order_history':
        return renderHistory();
      case 'partners':
        return renderPartners();
      case 'my_profile':
        return renderMyProfile();
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.content}>
        {renderContent()}
      </main>
    </div>
  );
};

export default ImporterAccountPage;