import React from 'react';
import styles from './Loader.module.css';
import logo from '../../assets/images/logotype_01.02.webp';
import AnimatedBlobs from '../common/AnimatedBlobs';

const LoadingScreen = () => {
  return (
    <div className={styles.loaderContainer}>
      <AnimatedBlobs variant="right" />
      <img className={styles.introLogo} src={logo} alt="Loading..." />
      <div className={styles.introFooter}>
        <b>Transio</b> | Copyright ©️ 2025<br />All rights reserved.
      </div>
    </div>
  );
};

export default LoadingScreen;