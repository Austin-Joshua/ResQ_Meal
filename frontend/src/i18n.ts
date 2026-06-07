import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import ta from '@/locales/ta.json';
import hi from '@/locales/hi.json';

const savedLang = (() => {
  try {
    const v = localStorage.getItem('resqmeal_lang');
    return v && ['en', 'ta', 'hi'].includes(v) ? v : 'en';
  } catch {
    return 'en';
  }
})();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
    hi: { translation: hi },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
