import React, { createContext, useContext, useState } from 'react';
import { translations } from '../data/translations';

const I18nContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('safeher_lang') || 'en';
  });

  const toggleLanguage = (lang) => {
    const newLang = lang || (language === 'en' ? 'hi' : 'en');
    setLanguage(newLang);
    localStorage.setItem('safeher_lang', newLang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage: toggleLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export default I18nContext;
