import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from './translations';
import { LANGUAGES } from './constants';

type LanguageContextType = {
  language: string;
  languageName: string;
  setLanguage: (lang: string) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const languageName = LANGUAGES.find(l => l.code === language)?.name || 'English';

  const t = (path: string) => {
    const keys = path.split('.');
    let current = translations[language] || translations['en'];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        // Fallback to English if translation missing
        current = translations['en'];
        for (const k of keys) {
            if (current && current[k]) current = current[k];
            else return path; 
        }
        return typeof current === 'string' ? current : path;
      }
      current = current[key];
    }
    return typeof current === 'string' ? current : path;
  };

  return (
    <LanguageContext.Provider value={{ language, languageName, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};