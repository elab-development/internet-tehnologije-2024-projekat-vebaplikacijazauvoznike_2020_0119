import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/FormPage.module.css';
import Input from '../common/Input';
import Button from '../common/Button';
import Header from '../layout/Header';
import { ASSET_BASE_URL } from '../../config'; // Import ASSET_BASE_URL
import inputStyles from '../common/Input.module.css'; // Import styles from Input.module.css

const ProductForm = ({ onSubmit, product, isEdit = false, redirectPath = '/my-products', redirectState = {} }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    volume: '',
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit && product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        description: product.description || '',
        price: product.price || '',
        volume: product.volume || '',
        image: null, // Image is not pre-filled for editing
      });
      if (product.image_url) {
        setPreview(`${ASSET_BASE_URL}${product.image_url}`);
      }
    }
  }, [isEdit, product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      await onSubmit(data);
      navigate(redirectPath, { state: redirectState });
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className={styles.formPageContainer}>
      <Header />
      <main className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>{isEdit ? 'Edit Product' : 'Create New Product'}</h1>
          {error && <p className={styles.error}>{error}</p>}

          <Input
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <label htmlFor="description" className={inputStyles.fieldLabel}>Product Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Product Description"
            className={styles.textarea}
            required
            rows="5"
          />
          <Input
            label="Price (€)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <Input
            label="Volume (m³)"
            name="volume"
            type="number"
            value={formData.volume}
            onChange={handleChange}
            required
          />
          <div className={styles.fileInputContainer}>
            <label htmlFor="image">Product Image</label>
            <input id="image" name="image" type="file" onChange={handleFileChange} />
            {preview && <img src={preview} alt="Preview" className={styles.imagePreview} />}
          </div>

          <Button type="submit" className={styles.submitButton}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default ProductForm;
