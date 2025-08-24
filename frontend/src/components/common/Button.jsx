import { Link } from 'react-router-dom';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', size, disabled = false, to, as, className }) => {
  const Component = as || (to ? Link : 'button');

  const variantClasses = {
    primary: styles.primary,
    secondary: styles.secondary,
    danger: styles.danger,
    orange: styles.orange,
    cta: styles.cta,
    toggle: styles.toggle,
  };

  const sizeClasses = {
    large: styles.large,
  };

  const btnClasses = [
    styles.button,
    variantClasses[variant] || styles.primary,
    size ? sizeClasses[size] : '',
    className || '',
  ].join(' ');

  const commonProps = {
    className: btnClasses,
    onClick,
    disabled,
  };

  const isLink = Component === Link;

  return (
    <Component
      {...commonProps}
      type={!isLink ? type : undefined}
      to={isLink ? to : undefined}
    >
      {children}
    </Component>
  );
};

export default Button;