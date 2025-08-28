
import React from 'react';
import styles from './ProfileInfo.module.css';

const ProfileInfo = ({ user, handleDelete }) => {
  if (!user) {
    return <p>Loading...</p>;
  }

  const getAvatarUrl = (seed) => {
    return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
  };

  return (
    <div className={styles.profileCard}>
      <img 
        src={getAvatarUrl(user.name || user.company_name)} 
        alt="Avatar" 
        className={styles.avatar} 
      />
      <div className={styles.infoContainer}>
        <h1 className={styles.title}>{user.name || user.company_name}</h1>
        <div className={styles.infoItem}>
          <strong>Email:</strong> {user.email}
        </div>
        {user.country && (
          <div className={styles.infoItem}>
            <strong>Country:</strong> {user.country}
          </div>
        )}
        <div className={styles.infoItem}>
          <span className={styles.role}>{user.role}</span>
        </div>
      </div>
      <button onClick={handleDelete} className={styles.deleteButton}>
        Delete Account
      </button>
    </div>
  );
};

export default ProfileInfo;
