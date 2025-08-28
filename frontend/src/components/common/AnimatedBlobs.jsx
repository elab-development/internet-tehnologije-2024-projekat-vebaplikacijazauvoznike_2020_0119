import styles from './AnimatedBlobs.module.css';

const AnimatedBlobs = ({ variant = 'right' }) => {
  return (
    <div className={styles.blobContainer}>
      {variant === 'right' && (
        <>
          <div className={`${styles.blob} ${styles.rightBlob1}`}></div>
          <div className={`${styles.blob} ${styles.rightBlob2}`}></div>
          <div className={`${styles.blob} ${styles.rightBlob3}`}></div>
          <div className={`${styles.blob} ${styles.rightBlob4}`}></div>
        </>
      )}
      {variant === 'left' && (
        <>
          <div className={`${styles.blob} ${styles.leftBlob1}`}></div>
          <div className={`${styles.blob} ${styles.leftBlob2}`}></div>
        </>
      )}
    </div>
  );
};

export default AnimatedBlobs;