import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../pages/FormPage.module.css';
import Input from '../common/Input';
import Button from '../common/Button';
import Header from '../layout/Header';

const SupplierForm = ({ onSubmit, supplier, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    country: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit && supplier) {
      setFormData({
        company_name: supplier.company_name || '',
        country: supplier.country || '',
      });
    }
  }, [isEdit, supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      await onSubmit(data);
      navigate('/home', { state: { searchType: 'suppliers' } }); // Redirect to admin dashboard with state
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className={styles.formPageContainer}>
      <Header />
      <main className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>{isEdit ? 'Edit Supplier' : 'Create New Supplier'}</h1>
          {error && <p className={styles.error}>{error}</p>}

          <Input
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />

          <Button type="submit" className={styles.submitButton}>
            {isEdit ? 'Save Changes' : 'Create Supplier'}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default SupplierForm;
