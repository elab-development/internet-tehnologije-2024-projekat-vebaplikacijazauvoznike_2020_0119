import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Card.module.css';

/**
 * Reusable Card Component for account selection
 * @param {object} props
 * @param {string} props.title - The title of the card.
 * @param {React.ReactNode} props.description - The description content.
 * @param {string} props.imageSrc - The source URL for the image.
 * @param {string} props.linkTo - The destination URL for the card link.
 * @param {string} props.buttonText - The text for the button.
 */
const Card = ({ title, description, imageSrc, linkTo, buttonText }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    };

    card.addEventListener('mousemove', handleMouseMove);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Link to={linkTo} className={styles.card} ref={cardRef}>
      <div className={styles.content}>
        <img className={styles.image} src={imageSrc} alt={title} />
        <div className={styles.textContainer}>
          <div className={styles.title}>{title}</div>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.buttonWrapper}>
          <span>{buttonText}</span>
        </div>
      </div>
    </Link>
  );
};

export default Card;
