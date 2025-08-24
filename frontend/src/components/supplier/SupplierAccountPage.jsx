import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import accountStyles from '../../pages/AccountPage.module.css'; // Renamed to avoid conflict
import productCardStyles from '../common/ProductCard.module.css'; // New import
import ProductCard from '../common/ProductCard'; // Import the new ProductCard component
import { getProducts, deleteProduct, getShipmentHistory, getPartnerships, deleteProfile, acceptShipment, getContainerHistory } from '../../services/apiService';
import { useAuth } from '../../providers/AuthProvider';
import Header from '../layout/Header';
import ProfileInfo from '../common/ProfileInfo';

const SupplierAccountPage = ({ activeTab: activeTabProp }) => {
  const { user, logout, loading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState(activeTabProp || 'my_products');
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveTab(activeTabProp);
  }, [activeTabProp]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(); // Vraća samo proizvode ovog suppliera
      console.log('Fetched products data:', data.data);
      data.data.forEach(p => console.log(`Product ID: ${p.id}, Image URL: ${p.image_url}`));
      setProducts(data.data);
    } catch (err) {
      setError('Failed to load products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getContainerHistory();
      setHistory(data.data); // Assuming getContainerHistory returns paginated data with a 'data' array
    } catch (err) {
      setError('Failed to load shipment history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await getPartnerships();

      // DODAJTE OVAJ RED ZA DEBAGOVANJE
      console.log('API RESPONSE FOR PARTNERS:', data);

      setPartners(data.data || []);
    } catch (err) {
      setError('Failed to load partners.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
   
  useEffect(() => {
    if (isAuthLoading) return;
    if (activeTab === 'my_products') {
      fetchProducts();
    } else if (activeTab === 'shipment_history') {
      fetchHistory();
    } else if (activeTab === 'my_partners') {
      fetchPartners();
    }
  }, [activeTab, isAuthLoading]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        alert('Product deleted successfully!');
        fetchProducts(); // Osveži listu
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const renderMyProducts = () => {
    if (loading) return <p>Loading products...</p>;
    if (error) return <p className={accountStyles.error}>{error}</p>;

    return (
      <div>
        <div className={accountStyles.productCardsContainer}>
          <Link to="/my-products/new" className={`${productCardStyles.card} ${productCardStyles.addProductCard}`}>
            <span className={productCardStyles.plusSign}>+</span>
          </Link>
          {products.map(p => (
            <ProductCard
              key={p.id}
              item={p}
              onDelete={handleDelete}
              showEditDeleteButtons={true} // Always show edit/delete for supplier's own products
            />
          ))}
        </div>
      </div>
    );
  };

  const handleAcceptShipment = async (containerId) => {
    if (window.confirm('Are you sure you want to accept this shipment?')) {
      try {
        await acceptShipment(containerId);
        alert('Shipment accepted successfully!');
        fetchHistory(); // Refresh the list
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const renderShipmentHistory = () => {
    if (loading) return <p>Loading history...</p>;
    if (error) return <p className={accountStyles.error}>{error}</p>;

    if (history.length === 0) {
      return <p>No shipment history found.</p>;
    }

    return (
      <table className={accountStyles.productsTable}><thead>
          <tr>
            <th>Order From</th>
            <th>Total Cost</th>
            <th>Current Volume</th>
            <th>Date Accepted</th>
            <th>Action</th>
          </tr>
        </thead><tbody>
          {history.map(container => (
            <tr key={container.id}>
              <td>{container.importer?.user?.name || 'Unknown Importer'}</td>
              <td>{container.total_cost}€</td>
              <td>{container.total_volume} m³</td>
              <td>{container.status === 'shipped' ? new Date(container.updated_at).toLocaleDateString() : ''}</td>
              <td className={accountStyles.actionCell}>
                {container.status === 'pending_shipping' ? (
                  <button
                    onClick={() => handleAcceptShipment(container.id)}
                    className={accountStyles.acceptButton}
                  >
                    Accept
                  </button>
                ) : (
                  <span className={accountStyles.acceptedText}>Accepted</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderMyPartners = () => {
    if (loading) return <p>Loading partners...</p>;
    if (error) return <p className={accountStyles.error}>{error}</p>;
    if (partners.length === 0) return <p>No partners found.</p>;

    return (
      <div className={accountStyles.partnerList}>
        {partners.map(p => (
          <div key={p.id} className={accountStyles.partnerItem}>
            <h4>{p.importer?.user.name || 'Unknown Partner'}</h4>
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
      case 'my_products':
        return renderMyProducts();
      case 'shipment_history':
        return renderShipmentHistory();
      case 'my_partners':
        return renderMyPartners();
      case 'my_profile':
        return renderMyProfile();
      default:
        return null;
    }
  };

  return (
    <div className={accountStyles.pageContainer}>
      <Header />
      <main className={accountStyles.content}>
        {renderContent()}
      </main>
    </div>
  );
};

export default SupplierAccountPage;