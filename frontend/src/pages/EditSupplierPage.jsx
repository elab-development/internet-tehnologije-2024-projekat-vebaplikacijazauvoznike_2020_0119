import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SupplierForm from '../components/supplier/SupplierForm';
import { getSupplier, updateSupplier } from '../services/apiService';
import LoadingScreen from '../components/layout/LoadingScreen';

const EditSupplierPage = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await getSupplier(id);
        setSupplier(data);
      } catch (err) {
        setError('Failed to load supplier data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSupplier();
  }, [id]);

  const handleUpdate = async (formData) => {
    await updateSupplier(id, formData);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;

  return <SupplierForm onSubmit={handleUpdate} supplier={supplier} isEdit />;
};

export default EditSupplierPage;
