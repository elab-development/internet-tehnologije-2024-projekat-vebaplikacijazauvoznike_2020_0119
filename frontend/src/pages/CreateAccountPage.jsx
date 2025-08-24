import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import styles from './CreateAccountPage.module.css';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { createAccount } from '../services/authService';
import RightSection from '../components/layout/RightSection';
import { useNotice } from '../contexts/NoticeContext';

import logotype from '../assets/images/logotype_01.01.webp';

const pageConfig = {
  admin: {
    title: 'Create an Admin account. 🧑‍💼',
    subtitle: 'Fill in the details below to create a new admin account.',
    fields: ['fullName', 'email', 'password'],
  },
  importer: {
    title: 'Create an Importer account. 🚢',
    subtitle: 'Fill in the details below to start ordering products.',
    fields: ['companyName', 'country', 'email', 'password'],
  },
  supplier: {
    title: 'Create a Supplier account. 🏭',
    subtitle: 'Fill in the details below to start selling your products.',
    fields: ['companyName', 'country', 'email', 'password'],
  },
};

const validators = {
  fullName: (value) => value.trim().length >= 4,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value),
  companyName: (value) => value.trim().length >= 4,
  country: (value) => value.trim().length >= 4, 
};

const CreateAccountPage = () => {
  const [searchParams] = useSearchParams();
  const { showNotice } = useNotice();
  const navigate = useNavigate();
  const accountType = searchParams.get('type') || 'importer';
  const config = pageConfig[accountType] || pageConfig.importer;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    country: '',
  });
  const [validationState, setValidationState] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const newValidationState = {};
    for (const key in formData) {
      if (config.fields.includes(key) && formData[key]) {
        newValidationState[key] = validators[key](formData[key]);
      }
    }
    setValidationState(newValidationState);
  }, [formData, config.fields]);

  const isFormValid = () => {
    return config.fields.every(field => validationState[field] === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      // The button is disabled, but as a fallback:
      setError(['Please fill all required fields correctly.']);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postData = { role: accountType };
      config.fields.forEach(field => {
        // Map frontend field names to backend field names
        if (field === 'fullName') {
          postData.name = formData.fullName;
        } else if (field === 'companyName') {
          postData.company_name = formData.companyName;
        } else {
          postData[field] = formData[field];
        }
      });

      // Always add password_confirmation for validation
      postData.password_confirmation = formData.password;

      await createAccount(postData);

      showNotice({ 
        type: 'success',
        title: 'Account Created!',
        message: 'You can now log in with your new credentials.',
        buttonText: 'Go to Login'
      });
      navigate('/login');

    } catch (err) {
      if (err && err.errors) {
        // Set the array of error messages
        const errorMessages = Object.values(err.errors).flat();
        setError(errorMessages);
      } else if (err && err.message) {
        setError([err.message]);
      } else {
        setError(['An unexpected error occurred.']);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftSection}>
        <div className={styles.formWrapper}>
          <img className={styles.logotype} src={logotype} alt="Transio Logotype" />
          <div className={styles.headerTexts}>
            <div className={styles.welcomeText} dangerouslySetInnerHTML={{ __html: config.title }} />
            <div className={styles.subtitleText}>{config.subtitle}</div>
          </div>

          <form className={styles.fieldsContainer} onSubmit={handleSubmit} noValidate>
            {config.fields.map((fieldName) => {
              const commonProps = {
                id: fieldName,
                name: fieldName,
                value: formData[fieldName],
                onChange: handleChange,
                disabled: loading,
                isValid: validationState[fieldName],
                required: true,
              };
              switch (fieldName) {
                case 'fullName':
                  return <Input key={fieldName} {...commonProps} label="Full Name" placeholder="Enter your full name" />;
                case 'email':
                  return <Input key={fieldName} {...commonProps} label="E-mail Address" type="email" placeholder="Enter your e-mail address" />;
                case 'password':
                  return <Input key={fieldName} {...commonProps} label="Password" type="password" placeholder="Create a password" hint="At least 8 characters, with uppercase and lowercase letters, and a number." />;
                case 'companyName':
                  return <Input key={fieldName} {...commonProps} label="Company Name" placeholder="Enter your company name" />;
                case 'country':
                  return <Input key={fieldName} {...commonProps} label="Country" placeholder="Enter your country" />;
                default:
                  return null;
              }
            })}

            {error && (
              <div className={styles.errorContainer}>
                {error.map((msg, index) => (
                  <p key={index} className={styles.errorMessage}>{msg}</p>
                ))}
              </div>
            )}

            <div className={styles.buttonSection}>
              <Button type="submit" disabled={!isFormValid() || loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <div className={styles.loginLink}>
                Already have an account? <Link to="/login">Log In</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
      <RightSection />
    </div>
  );
};

export default CreateAccountPage;
