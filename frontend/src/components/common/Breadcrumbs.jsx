import { useLocation, Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

const Breadcrumbs = () => {
  const location = useLocation();

  // Handle the root/home case specifically
  if (location.pathname === '/' || location.pathname === '/home') {
    return (
      <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
        <span aria-current="page">Home</span>
      </nav>
    );
  }

  // For all other pages, build the breadcrumb trail
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="breadcrumb" className={styles.breadcrumbs}>
      <Link to="/home">Home</Link>
      {pathnames.map((name, index) => {
        // Don't show the 'home' crumb in a longer path, as we already have the link
        if (name.toLowerCase() === 'home') {
          return null;
        }

        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return isLast ? (
          <span key={routeTo} aria-current="page">
            {' / '}{displayName}
          </span>
        ) : (
          <span key={routeTo}>
            {' / '}
            <Link to={routeTo}>{displayName}</Link>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;