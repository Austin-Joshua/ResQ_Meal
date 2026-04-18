import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AppLogo } from '@/components/AppLogo';

export type LanguageOption = 'en' | 'ta' | 'hi';

const LANGUAGE_OPTIONS: { value: LanguageOption; label: string; labelNative: string }[] = [
  { value: 'en', label: 'English', labelNative: 'English' },
  { value: 'ta', label: 'Tamil', labelNative: 'தமிழ்' },
  { value: 'hi', label: 'Hindi', labelNative: 'हिन्दी' },
];

interface LanguageSelectorPageProps {
  darkMode: boolean;
  onSelect: (lang: LanguageOption) => void;
}

const LanguageSelectorPage: React.FC<LanguageSelectorPageProps> = ({ darkMode, onSelect }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
        darkMode ? 'bg-[hsl(var(--background))]' : 'bg-blue-50/40'
      }`}
    >
      <div
        className={`w-full max-w-lg p-6 sm:p-8 transition-all duration-300 rounded-2xl border shadow-lg ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-[#D4AF37]/30'
            : 'bg-white border-blue-200 shadow-blue-900/5'
        }`}
      >
        <div className="flex justify-center mb-6">
          <div
            className={`rounded-lg p-2 border-2 ${
              darkMode ? 'bg-white/10 border-white/30' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <AppLogo
              size="login"
              placeholderVariant={darkMode ? 'dark' : 'light'}
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>
        <h1
          className={`text-2xl sm:text-3xl font-bold text-center mb-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          ResQ Meal
        </h1>
        <p
          className={`text-center text-base font-medium mb-1 ${
            darkMode ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {t('chooseLanguage')}
        </p>
        <p
          className={`text-center text-sm mb-8 ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          {t('chooseLanguageSubtitle')}
        </p>

        <div className="flex flex-col gap-3">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl border-2 font-semibold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                darkMode
                  ? 'border-[#D4AF37]/50 bg-blue-900/40 text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]'
                  : 'border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:border-[#D4AF37]'
              }`}
            >
              <Globe className="w-6 h-6 shrink-0" />
              <span>{opt.labelNative}</span>
              {opt.value !== 'en' && (
                <span className={`text-sm font-normal ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  ({opt.label})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorPage;
