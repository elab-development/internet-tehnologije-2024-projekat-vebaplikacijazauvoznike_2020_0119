import { useAuth } from '../providers/AuthProvider';
import ImporterAccountPage from '../components/importer/ImporterAccountPage';
import SupplierAccountPage from '../components/supplier/SupplierAccountPage';
import AdminAccountPage from '../components/admin/AdminAccountPage'; // Import the new component
import LoadingScreen from '../components/layout/LoadingScreen';

const AccountPage = ({ activeTab }) => {
  const { user } = useAuth();

  if (!user) {
    return <LoadingScreen />;
  }

  switch (user.role) {
    case 'importer':
      return <ImporterAccountPage activeTab={activeTab} />;
    case 'supplier':
      return <SupplierAccountPage activeTab={activeTab} />;
    case 'admin':
      return <AdminAccountPage activeTab={activeTab} />; // Render the new component for admin
    default:
      return <div>Unknown role. Please contact support.</div>;
  }
};

export default AccountPage;