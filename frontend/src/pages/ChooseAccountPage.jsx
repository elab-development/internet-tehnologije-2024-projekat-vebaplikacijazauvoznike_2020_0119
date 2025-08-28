import styles from './ChooseAccountPage.module.css';
import Card from '../components/common/Card';
import { Link } from 'react-router-dom';

// Import images
import adminImage from '../assets/images/image_02.01.webp';
import importerImage from '../assets/images/image_02.02.webp';
import supplierImage from '../assets/images/image_02.03.webp';

const ChooseAccountPage = () => {
  const adminDescription = (
    <>
      Sign in as an admin to <strong>manage users</strong>, <strong>access all data</strong>, and <strong>configure the entire system</strong>.
    </>
  );

  const importerDescription = (
    <>
      Sign in as an importer to <strong>order products from suppliers</strong> and <strong>track your shipments</strong> in real time.
    </>
  );

  const supplierDescription = (
    <>
      Sign in as a supplier to <strong>add products</strong> and <strong>connect with importers</strong> for new business.
    </>
  );

  return (
    <div className={styles.page}>
      {/* Blob container can be added here if needed */}
      <div className={styles.wrapper}>
        <div className={styles.accountTypeTitle}>Create Account As:</div>
        <div className={styles.cardGroup}>
          <Card
            title="Admin"
            description={adminDescription}
            imageSrc={adminImage}
            linkTo="/create-account?type=admin"
            buttonText="Create Account"
          />
          <Card
            title="Importer"
            description={importerDescription}
            imageSrc={importerImage}
            linkTo="/create-account?type=importer"
            buttonText="Create Account"
          />
          <Card
            title="Supplier"
            description={supplierDescription}
            imageSrc={supplierImage}
            linkTo="/create-account?type=supplier"
            buttonText="Create Account"
          />
        </div>
        <div className={styles.loginLink}>
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseAccountPage;
