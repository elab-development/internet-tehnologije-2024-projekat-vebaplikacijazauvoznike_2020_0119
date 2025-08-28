import styles from './LeftBlob.module.css';

const LeftBlob = () => {
  return (
    <div className={styles.blobContainer}>
      <div className={`${styles.blob} ${styles.blob1}`}></div>
    </div>
  );
};

export default LeftBlob;
