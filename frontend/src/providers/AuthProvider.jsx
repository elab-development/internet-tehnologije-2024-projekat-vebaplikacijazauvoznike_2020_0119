import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useNotice } from '../contexts/NoticeContext'; // Import useNotice
import * as authService from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotice } = useNotice(); // Get showNotice from context

  const initAuth = useCallback(async () => {
    if (token) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);




  const login = async (email, password) => {
    // Pozivamo API servis
    const response = await authService.login(email, password);

    // --- DODAJTE OVU LINIJU ---
    console.log('Odgovor sa servera:', response);
    // --------------------------

    // Destrukturiranje odgovora
    const { access_token: token, user } = response;

    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    navigate('/home');

    showNotice({
      type: 'success',
      title: `Welcome back, ${user.name}! 👋`,
      message: 'You have been successfully logged in.',
      buttonText: 'Let\'s Go!'
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const value = {
    user,
    token,
    isLoggedIn: !!token,
    loading,
    login,
    logout,
  };

  return (<AuthContext.Provider value={value}>{children}</AuthContext.Provider>);
};

export const useAuth = () => {
  return useContext(AuthContext);
};
