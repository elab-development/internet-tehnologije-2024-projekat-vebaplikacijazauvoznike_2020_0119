import './styles/global.css';
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider.jsx';
import { ContainerProvider } from './contexts/ContainerContext.js';
import { NoticeProvider, useNotice } from './contexts/NoticeContext.js';

import NoticeModal from './components/common/NoticeModal';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import SplashScreen from './components/layout/SplashScreen';
import LoadingScreen from './components/layout/LoadingScreen';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChooseAccountPage from './pages/ChooseAccountPage';
import CreateAccountPage from './pages/CreateAccountPage';
import AccountPage from './pages/AccountPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import CreateProductPage from './pages/CreateProductPage';
import EditProductPage from './pages/EditProductPage';
import EditSupplierPage from './pages/EditSupplierPage';
import EditImporterPage from './pages/EditImporterPage';

const AppContent = () => {
  const { notice, hideNotice } = useNotice();
  const { loading: isAuthLoading } = useAuth();

  // Show loading screen during initial auth check
  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <NoticeModal {...notice} onClose={hideNotice} />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<ChooseAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/choose-account" element={<ChooseAccountPage />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/my-profile" element={<AccountPage activeTab="my_profile" />} />
          <Route path="/my-products" element={<AccountPage activeTab="my_products" />} />
          <Route path="/my-products/new" element={<CreateProductPage />} />
          <Route path="/my-products/edit/:id" element={<EditProductPage />} />
          <Route path="/suppliers/edit/:id" element={<EditSupplierPage />} />
          <Route path="/importers/edit/:id" element={<EditImporterPage />} />
          <Route path="/shipment-history" element={<AccountPage activeTab="shipment_history" />} />
          <Route path="/my-partners" element={<AccountPage activeTab="my_partners" />} />
          <Route path="/current-container" element={<AccountPage activeTab="current_container" />} />
          <Route path="/order-history" element={<AccountPage activeTab="order_history" />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000); // Show splash for 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    // return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <NoticeProvider>
        <AuthProvider>
          <ContainerProvider>
            <AppContent />
          </ContainerProvider>
        </AuthProvider>
      </NoticeProvider>
    </BrowserRouter>
  );
}

export default App;
