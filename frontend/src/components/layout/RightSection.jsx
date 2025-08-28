import styles from './RightSection.module.css';
import AnimatedBlobs from '../common/AnimatedBlobs'; // Import the blobs

// Import images
import starIcon from '../../assets/images/icon_01.01.webp';
import customer1 from '../../assets/images/customer_01.01.webp';
import customer2 from '../../assets/images/customer_01.02.webp';
import customer3 from '../../assets/images/customer_01.03.webp';
import customer4 from '../../assets/images/customer_01.04.webp';
import customer5 from '../../assets/images/customer_01.05.webp';

const RightSection = () => {
  return (
    <div className={styles.rightSection}>
      <AnimatedBlobs variant="right" />
      <div className={styles.imageTextContainer}>
        <div className={styles.imageTextContent}>
          <div className={styles.imageTitle}>Connecting Goods to Destinations. 🗺️</div>
          <div className={styles.imageDescription}>
            Transio connects businesses and individuals with reliable freight
            and transport solutions. Let’s move forward together.
          </div>
        </div>
        <div className={styles.customerFeedbackGroup}>
          <div className={styles.customersAvatarsGroup}>
            <div className={`${styles.avatarWrapper} ${styles.zIndex5}`}>
              <img src={customer1} alt="Avatar" className={styles.customerAvatar} />
            </div>
            <div className={`${styles.avatarWrapper} ${styles.zIndex4}`}>
              <img src={customer2} alt="Avatar" className={styles.customerAvatar} />
            </div>
            <div className={`${styles.avatarWrapper} ${styles.zIndex3}`}>
              <img src={customer3} alt="Avatar" className={styles.customerAvatar} />
            </div>
            <div className={`${styles.avatarWrapper} ${styles.zIndex2}`}>
              <img src={customer4} alt="Avatar" className={styles.customerAvatar} />
            </div>
            <div className={`${styles.avatarWrapper} ${styles.zIndex1}`}>
              <img src={customer5} alt="Avatar" className={styles.customerAvatar} />
            </div>
          </div>
          <div className={styles.ratingInfo}>
            <div className={styles.ratingStarsContainer}>
              <div className={styles.stars}>
                <img src={starIcon} alt="Star" />
                <img src={starIcon} alt="Star" />
                <img src={starIcon} alt="Star" />
                <img src={starIcon} alt="Star" />
                <img src={starIcon} alt="Star" />
              </div>
              <span className={styles.ratingText}>5.0</span>
            </div>
            <div className={styles.reviewsText}>from 200+ reviews</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSection;
