import { useAuth } from '../providers/AuthProvider';
import ProductForm from '../components/supplier/ProductForm';
import { createProduct } from '../services/apiService';

const CreateProductPage = () => {
  const { user } = useAuth();

  const handleCreate = async (formData) => {
    await createProduct(formData);
  };

  const redirectPath = user.role === 'admin' ? '/home' : '/my-products';
  const redirectState = user.role === 'admin' ? { searchType: 'products' } : {};

  return <ProductForm onSubmit={handleCreate} redirectPath={redirectPath} redirectState={redirectState} />;
};

export default CreateProductPage;
