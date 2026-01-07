import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer>
      <p>{t('app.copyright')} | {t('app.disclaimer')}</p>
    </footer>
  );
};

export default Footer;