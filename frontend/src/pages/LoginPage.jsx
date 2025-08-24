import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../contexts/AuthContext';
import { useNotice } from '../contexts/NoticeContext';
import RightSection from '../components/layout/RightSection';
import AnimatedBlobs from '../components/common/AnimatedBlobs';

import logotype from '../assets/images/logotype_01.01.webp';

const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value) => value.length >= 8, // Simple check for login
};

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationState, setValidationState] = useState({});
  const { login, loading, isLoggedIn } = useAuth();
  const { showNotice } = useNotice();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/home');
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const newValidationState = {};
    for (const key in formData) {
      if (formData[key]) { // Only validate if there's a value
        newValidationState[key] = validators[key](formData[key]);
      }
    }
    setValidationState(newValidationState);
  }, [formData]);

  const isFormValid = () => {
    return Object.values(validationState).every(isValid => isValid === true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      showNotice({ type: 'error', title: 'Login Failed', message: err.message });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftSection}>
        <AnimatedBlobs variant="left" />
        <div className={styles.formWrapper}>
          <img className={styles.logotype} src={logotype} alt="Transio Logotype" />
          <div className={styles.headerTexts}>
            <div className={styles.welcomeText}>Welcome back<br />to Transio. 👀</div>
            <div className={styles.subtitleText}>
              Enter your details below to <strong>log in to your account</strong>.
            </div>
          </div>

          <form className={styles.fieldsContainer} id="logInForm" noValidate onSubmit={handleLogin}>
            <Input
              label="E-mail Address"
              id="email"
              name="email"
              type="email"
              placeholder="Enter your e-mail address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              isValid={validationState.email}
              required
            />
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              isValid={validationState.password}
              required
              hint="At least 8 characters, with uppercase and lowercase letters, and a number."
            />
            {/* The error from useAuth is no longer needed here, it is handled by the modal */}
          </form>

          <div className={styles.buttonSection}>
            <Button type="submit" onClick={handleLogin} disabled={!isFormValid() || loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
            <div className={styles.loginLink}>
              Don't have an account? <Link to="/choose-account">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
      <RightSection />
    </div>
  );
};

export default LoginPage;