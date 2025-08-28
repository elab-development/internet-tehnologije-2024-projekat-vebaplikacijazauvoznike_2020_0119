import { useState } from 'react';
import styles from '../common/ProductCard.module.css';
import ProductCard from '../common/ProductCard'; // Import the new ProductCard component

const ResultCard = ({ item, type, onAddToCart, onEdit, onDelete, isAdmin }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleShopClick = () => {
    if (onAddToCart) {
      onAddToCart(item.id, quantity);
    }
  };

  // --- RENDER LOGIC ---

  if (type === 'importers' || type === 'suppliers') {
    const name = type === 'importers' ? item.user?.name : item.company_name;
    const location = item.country;
    const email = item.user?.email;
    const subtitle = item.subtitle; // Only for suppliers

    return (
      <div className={styles.card}>
        <h3 className={styles.name}>{name}</h3>
        {type === 'suppliers' && subtitle && <p className={styles.description}>{subtitle}</p>}

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Location</span>
            <span className={styles.detailValue}>{location}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <span className={styles.detailValue}>{email}</span>
          </div>
        </div>

        {isAdmin && (
          <div className={styles.cta}>
            <button className={`${styles.shopButton} ${styles.editButton}`} onClick={() => onEdit(item.id)}>Edit</button>
            <button className={`${styles.shopButton} ${styles.deleteButton}`} onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        )}
      </div>
    );
  }

  // Render the full product card using the new ProductCard component
  return (
    <ProductCard
      item={item}
      onAddToCart={onAddToCart}
      onEdit={onEdit}
      onDelete={onDelete}
      isAdmin={isAdmin}
      showQuantityControls={!isAdmin} // Show quantity controls if not admin
      showEditDeleteButtons={isAdmin} // Show edit/delete buttons if admin
    />
  );
};

export default ResultCard;