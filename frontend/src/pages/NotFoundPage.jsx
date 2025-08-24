import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';
import Button from '../components/common/Button';

// Import images
import logotype from '../assets/images/logotype_01.01.webp';
import image01 from '../assets/images/image_04.01.webp';
import image02 from '../assets/images/image_04.02.webp';

const NotFoundPage = () => {
  return (
    <div className={styles.errorStage}>
      <div className={styles.errorPage}>
        <div className={styles.bg}></div>

        <div className={styles.hero404}>
          <div className={styles.digit}>4</div>
          <div className={styles.dot}></div>
          <div className={styles.digit}>4</div>
        </div>

        <img src={image01} alt="" className={styles.image01} />
        <img src={image02} alt="" className={styles.image02} />

        <div className={styles.gradient01}></div>
        <div className={styles.gradient02}></div>

        <img src={logotype} alt="Transio Logotype" className={styles.logotype} />

        <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Oops! Page Not Found.</h1>
            <p className={styles.desc}>
                The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <Link to="/" style={{ textDecoration: 'none', width: '100%' }}>
                <Button className={styles.cta} variant="primary">
                    Back to Home
                </Button>
            </Link>
            <p className={styles.under}>
                Need help? <a href="#">Contact Support</a>
            </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
