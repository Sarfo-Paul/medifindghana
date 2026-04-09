import React, { createContext, useContext, useState, ReactNode } from 'react';
import translations from '../i18n/translations';

type Locale = 'en' | 'twi';

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const stored = (typeof window !== 'undefined' && localStorage.getItem('locale')) || 'en';
  const [locale, setLocaleState] = useState<Locale>((stored as Locale) || 'en');

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== 'undefined') localStorage.setItem('locale', l);
  };

  const t = (key: string) => {
    return (translations[locale] && translations[locale][key]) || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
