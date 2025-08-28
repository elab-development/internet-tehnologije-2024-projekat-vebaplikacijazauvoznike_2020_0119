import { useState } from 'react';
import styles from './Input.module.css';

import showPassIcon from '../../assets/images/icon_03.01.webp';
import hidePassIcon from '../../assets/images/icon_03.02.webp';
import validIcon from '../../assets/images/icon_02.01.webp';
import invalidIcon from '../../assets/images/icon_02.02.webp';

const Input = ({ id, label, hint, type = 'text', isValid, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  const validationIconSrc = isValid === true ? validIcon : (isValid === false ? invalidIcon : null);

  return (
    <div className={styles.fieldGroup}>
      {label && <label htmlFor={id} className={styles.fieldLabel}>{label}</label>}
      <div className={styles.inputWrapper}>
        <input id={id} type={inputType} className={styles.input} {...props} />
        <div className={styles.iconGroup}>
          {type === 'password' && (
            <img
              src={isPasswordVisible ? hidePassIcon : showPassIcon}
              alt="Toggle password visibility"
              className={styles.passwordToggleIcon}
              onClick={handleToggleVisibility}
            />
          )}
          {validationIconSrc && (
            <img
              src={validationIconSrc}
              alt="Validation status"
              className={`${styles.validationIcon} ${styles.visible}`}
            />
          )}
        </div>
      </div>
      {hint && <div className={styles.fieldHint}>{hint}</div>}
    </div>
  );
};

export default Input;