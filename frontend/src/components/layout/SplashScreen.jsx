import React from 'react';
import styles from './Loader.module.css'; // Reuse loader styles for consistency
import logo from '../../assets/images/logotype_01.02.webp';
import Footer from './Footer';
import AnimatedBlobs from '../common/AnimatedBlobs';

const SplashScreen = () => {
  return (
    <div className={styles.loaderContainer}>
      <AnimatedBlobs variant="right" />
      <img className={styles.introLogo} src={logo} alt="Transio Logo" />
      <div className={styles.introFooter}>
        <Footer />
      </div>
    </div>
  );
};

export default SplashScreen;