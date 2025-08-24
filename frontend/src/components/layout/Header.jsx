import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import styles from './Header.module.css';
import Breadcrumbs from '../common/Breadcrumbs';

// Import assets
import logoImg from '../../assets/images/logotype_01.02.webp';

const Header = () => {
  const { user, logout } = useAuth();

  const renderNavLinks = () => {
    if (!user) {
      return null;
    }

    const role = user.role; // Assuming user.role exists

    if (role === 'admin') {
      return (
        <>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/my-profile" role="button">
            <span className={styles.btnText}>My Profile</span>
          </Link>
        </>
      );
    }

    if (role === 'supplier') {
      return (
        <>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/my-products" role="button">
            <span className={styles.btnText}>My Products</span>
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/shipment-history" role="button">
            <span className={styles.btnText}>Shipment History</span>
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/my-profile" role="button">
            <span className={styles.btnText}>My Profile</span>
          </Link>
        </>
      );
    }

    if (role === 'importer') {
      return (
        <>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/current-container" role="button">
            <span className={styles.btnText}>My Container</span>
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/order-history" role="button">
            <span className={styles.btnText}>Order History</span>
          </Link>
          <Link className={`${styles.btn} ${styles.btnGhost}`} to="/my-profile" role="button">
            <span className={styles.btnText}>My Profile</span>
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.leftSection}>
          <Link className={`${styles.logo} ${styles.popfx}`} to="/home" aria-label="Go to Home">
            <img src={logoImg} alt="Transio" className={styles.logoImg} />
          </Link>
          <Breadcrumbs />
        </div>

        <nav className={styles.actions} aria-label="Header actions">
          {renderNavLinks()}
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={logout} type="button">
            <span className={`${styles.btnText} ${styles.btnTextPrimary}`}>Log Out</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;