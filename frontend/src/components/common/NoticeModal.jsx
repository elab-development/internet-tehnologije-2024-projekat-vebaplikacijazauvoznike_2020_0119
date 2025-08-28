import { useEffect } from 'react';
import styles from './NoticeModal.module.css';
import Button from './Button';

// Import images
import successIcon from '../../assets/images/image_03.01.webp';
import errorIcon from '../../assets/images/image_03.02.webp';

const noticeConfig = {
  success: {
    icon: successIcon,
    defaultTitle: 'Success!',
  },
  error: {
    icon: errorIcon,
    defaultTitle: 'Something went wrong',
  },
};

const NoticeModal = ({ isOpen, onClose, type = 'success', title, message, buttonText = 'Close' }) => {
  const config = noticeConfig[type];

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.isOpen : ''}`} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <img className={styles.illustration} src={config.icon} alt={type} />
        <h2 className={styles.title}>{title || config.defaultTitle}</h2>
        {message && <p className={styles.desc}>{message}</p>}
        <Button onClick={onClose} variant="cta" size="large">{buttonText}</Button>
      </div>
    </div>
  );
};

export default NoticeModal;
