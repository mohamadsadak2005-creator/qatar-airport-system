import React, { createContext, useState, useContext, useEffect } from 'react';

// Import translation files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar');
  const [translations, setTranslations] = useState(arTranslations);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      setTranslations(savedLanguage === 'en' ? enTranslations : arTranslations);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setTranslations(lang === 'en' ? enTranslations : arTranslations);
    localStorage.setItem('appLanguage', lang);
    
    // Update HTML dir and lang attributes
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return value;
  };

  const value = {
    language,
    translations,
    t,
    changeLanguage,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Helper HOC for using translations
export const withTranslation = (Component) => {
  return function WrappedComponent(props) {
    const { t } = useLanguage();
    return <Component {...props} t={t} />;
  };
};