import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import { ASSET_BASE_URL } from '../../config'; // Koristi se ASSET_BASE_URL za slike

const ProductCard = ({ 
  item, 
  onAddToCart, 
  onEdit, 
  onDelete, 
  isAdmin, // Ovaj prop se trenutno ne koristi, ali je dobra praksa ostaviti ga ako je planiran za buduću upotrebu
  showQuantityControls = false, 
  showEditDeleteButtons = false 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState('');

  // useEffect se izvršava kada se komponenta prvi put renderuje ili kada se promene `item.image_url` ili `ASSET_BASE_URL`.
  // Svrha mu je da postavi ispravnu putanju do slike.
  useEffect(() => {
    if (item.image_url) {
      if (item.image_url.startsWith('http://') || item.image_url.startsWith('https://')) {
        // Ako je putanja do slike već potpuni URL, koristi je direktno.
        setImageUrl(item.image_url);
      } else if (item.image_url.startsWith('/storage/')) {
        // Ako je putanja relativna (iz Laravel storage-a), dodaj osnovni URL za resurse.
        setImageUrl(`${ASSET_BASE_URL}${item.image_url}`);
      } else {
        // U slučaju da putanja ne odgovara nijednom formatu, postavi rezervnu sliku.
        setImageUrl('https://placehold.co/600x300/png?text=Image+Not+Found');
      }
    } else {
      // Ako `item.image_url` ne postoji, koristi rezervnu sliku.
      setImageUrl('https://placehold.co/600x300/png?text=No+Image');
    }
  }, [item.image_url, ASSET_BASE_URL]);

  // Funkcija za promenu količine proizvoda.
  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount)); // Osigurava da količina ne bude manja od 1.
  };

  // Funkcija koja se poziva klikom na "ADD" dugme.
  const handleShopClick = () => {
    if (onAddToCart) {
      onAddToCart(item.id, quantity);
    }
  };

  return (
    <div className={styles.card}>
      {/* Prikaz slike proizvoda */}
      {imageUrl && <img src={imageUrl} alt={item.name} className={styles.productImage} />}
      
      {/* Osnovne informacije o proizvodu */}
      <h3 className={styles.name}>{item.name}</h3>
      {item.description && <p className={styles.description}>{item.description}</p>}

      {/* Detalji o proizvodu (kategorija, dobavljač, itd.) */}
      <div className={styles.details}>
        {item.category && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Category</span>
            <span className={styles.detailValue}>{item.category}</span>
          </div>
        )}
        {item.supplier?.company_name && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Supplier</span>
            <span className={styles.detailValue}>{item.supplier.company_name}</span>
          </div>
        )}
        {item.volume && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Volume</span>
            <span className={styles.detailValue}>{item.volume} m³</span>
          </div>
        )}
        {item.price && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Price</span>
            <span className={`${styles.detailValue} ${styles.price}`}>{item.price}€</span>
          </div>
        )}
      </div>

      {/* Deo sa dugmićima (Call to Action) */}
      <div className={styles.cta}>
        
        {/* Uslovno prikazivanje "Edit" i "Delete" dugmića */}
        {showEditDeleteButtons && (
          <>
            <Link to={`/my-products/edit/${item.id}`} className={`${styles.shopButton} ${styles.editButton}`}>Edit</Link>
            <button onClick={() => onDelete(item.id)} className={`${styles.shopButton} ${styles.deleteButton}`}>Delete</button>
          </>
        )}

        {/* Uslovno prikazivanje kontrola za količinu i "ADD" dugmeta */}
        {showQuantityControls && (
          <>
            <div className={styles.qty}>
              <button className={styles.qtyBtn} onClick={() => handleQuantityChange(-1)} aria-label="Decrease quantity">-</button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => handleQuantityChange(1)} aria-label="Increase quantity">+</button>
            </div>
            <button
              className={styles.shopButton}
              onClick={handleShopClick}
            >
              ADD
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;