import { useAuth } from '../providers/AuthProvider';
import ImporterHomePage from '../components/importer/ImporterHomePage';
import SupplierHomePage from '../components/supplier/SupplierHomePage';
import AdminDashboard from '../components/admin/AdminDashboard';
import LoadingScreen from '../components/layout/LoadingScreen';

const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoadingScreen />;
  }

  switch (user.role) {
    case 'importer':
      return <ImporterHomePage />;
    case 'supplier':
      return <SupplierHomePage />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Unknown role. Please contact support.</div>;
  }
};

export default HomePage;
