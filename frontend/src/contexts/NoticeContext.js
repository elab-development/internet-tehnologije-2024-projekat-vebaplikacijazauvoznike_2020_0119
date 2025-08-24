import React, { createContext, useState, useContext, useCallback } from 'react';

export const NoticeContext = createContext();

export const useNotice = () => useContext(NoticeContext);

export const NoticeProvider = ({ children }) => {
  const [notice, setNotice] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    buttonText: 'Close',
  });

  const showNotice = useCallback(({ type = 'success', title, message, buttonText = 'Close' }) => {
    setNotice({ isOpen: true, type, title, message, buttonText });
  }, []);

  const hideNotice = useCallback(() => {
    setNotice(prev => ({ ...prev, isOpen: false }));
  }, []);

  const value = { notice, showNotice, hideNotice };

  return React.createElement(NoticeContext.Provider, { value: value }, children);
};
