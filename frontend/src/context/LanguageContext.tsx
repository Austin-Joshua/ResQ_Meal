import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

type Language = 'en' | 'ta' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  language?: Language;
  setLanguage?: (lang: Language) => void;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  language: controlledLang,
  setLanguage: controlledSetLang,
}) => {
  const { t: i18nT, i18n } = useTranslation();

  const language = (controlledLang ?? (i18n.language as Language)) || 'en';

  useEffect(() => {
    if (controlledLang && i18n.language !== controlledLang) {
      void i18n.changeLanguage(controlledLang);
    }
  }, [controlledLang, i18n]);

  const setLanguage = (lang: Language) => {
    void i18n.changeLanguage(lang);
    try {
      localStorage.setItem('resqmeal_lang', lang);
    } catch {
      /* ignore */
    }
    controlledSetLang?.(lang);
  };

  const t = (key: string, options?: Record<string, string | number>): string => {
    return i18nT(key, options);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
