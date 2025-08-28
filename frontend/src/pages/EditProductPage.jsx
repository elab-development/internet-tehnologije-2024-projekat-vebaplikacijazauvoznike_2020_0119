import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductForm from '../components/supplier/ProductForm';
import { getProduct, updateProduct } from '../services/apiService';
import LoadingScreen from '../components/layout/LoadingScreen';
import { useAuth } from '../providers/AuthProvider';

const EditProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product data.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleUpdate = async (formData) => {
    await updateProduct(id, formData);
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;

  const redirectPath = user.role === 'admin' ? '/home' : '/my-products';
  const redirectState = user.role === 'admin' ? { searchType: 'products' } : {};

  return <ProductForm onSubmit={handleUpdate} product={product} isEdit redirectPath={redirectPath} redirectState={redirectState} />;
};

export default EditProductPage;
