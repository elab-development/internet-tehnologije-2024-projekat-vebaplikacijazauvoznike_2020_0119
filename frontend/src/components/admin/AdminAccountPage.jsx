import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { deleteProfile } from '../../services/apiService';
import ProfileInfo from '../common/ProfileInfo';
import Header from '../layout/Header';
import styles from '../../pages/AccountPage.module.css';

const AdminAccountPage = ({ activeTab: activeTabProp }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(activeTabProp || 'my_profile');

  useEffect(() => {
    setActiveTab(activeTabProp);
  }, [activeTabProp]);

  const handleDeleteProfile = async () => {
    if (window.confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
      try {
        await deleteProfile();
        alert('Profile deleted successfully.');
        logout();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.content}>
        <ProfileInfo user={user} handleDelete={handleDeleteProfile} />
      </main>
    </div>
  );
};

export default AdminAccountPage;
