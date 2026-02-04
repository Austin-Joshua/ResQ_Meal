import React, { useState } from 'react';
import { Moon, Sun, Globe } from 'lucide-react';

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language?: 'en' | 'ta' | 'hi';
  setLanguage?: (lang: 'en' | 'ta' | 'hi') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ darkMode, setDarkMode, language: propLanguage, setLanguage: propSetLanguage }) => {
  const [language, setLanguageLocal] = useState<'en' | 'ta' | 'hi'>(propLanguage || 'en');
  
  // Use prop language if provided, otherwise use local state
  const currentLanguage = propLanguage || language;
  const handleLanguageChange = (lang: 'en' | 'ta' | 'hi') => {
    if (propSetLanguage) {
      propSetLanguage(lang);
    } else {
      setLanguageLocal(lang);
    }
  };

  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        settings: 'Settings',
        userDetails: 'User Details',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        role: 'Role',
        language: 'Language',
        darkMode: 'Dark Mode',
        english: 'English',
        tamil: 'Tamil',
        hindi: 'Hindi',
        restaurant: 'Restaurant',
        ngo: 'NGO',
        volunteer: 'Volunteer',
        save: 'Save Changes',
        saved: 'Settings saved successfully!',
        preferences: 'Preferences',
      },
      ta: {
        settings: 'அமைப்புகள்',
        userDetails: 'பயனர் விவரங்கள்',
        name: 'பெயர்',
        email: 'மின்னஞ்சல்',
        phone: 'தொலைபேசி',
        address: 'முகவரி',
        role: 'பங்கு',
        language: 'மொழி',
        darkMode: 'இரண்ட பயன்முறை',
        english: 'ஆங்கிலம்',
        tamil: 'தமிழ்',
        hindi: 'இந்தி',
        restaurant: 'உணவகம்',
        ngo: 'NGO',
        volunteer: 'தன்னார்வலர்',
        save: 'மாற்றங்களை சேமிக்கவும்',
        saved: 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டது!',
        preferences: 'விருப்பங்கள்',
      },
      hi: {
        settings: 'सेटिंग्स',
        userDetails: 'उपयोगकर्ता विवरण',
        name: 'नाम',
        email: 'ईमेल',
        phone: 'फोन',
        address: 'पता',
        role: 'भूमिका',
        language: 'भाषा',
        darkMode: 'डार्क मोड',
        english: 'अंग्रेजी',
        tamil: 'तमिल',
        hindi: 'हिंदी',
        restaurant: 'रेस्तरां',
        ngo: 'NGO',
        volunteer: 'स्वयंसेवक',
        save: 'परिवर्तन सहेजें',
        saved: 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
        preferences: 'वरीयताएँ',
      },
    };
    return translations[currentLanguage]?.[key] || key;
  };

  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    address: 'Chennai, India',
    role: 'restaurant' as 'restaurant' | 'ngo' | 'volunteer',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
        : 'bg-gradient-to-br from-emerald-50 via-white to-blue-50'
    }`}>
      <div className="max-w-2xl mx-auto p-6 pt-20">
        <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-yellow-300' : 'text-emerald-700'}`}>
          ⚙️ {t('settings')}
        </h1>

        {/* User Details Section */}
        <div className={`rounded-2xl p-8 mb-8 transition border ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-blue-700/50 shadow-xl' 
            : 'bg-gradient-to-br from-emerald-400/10 to-blue-400/10 border-emerald-300/50 shadow-lg'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
            darkMode ? 'text-yellow-300' : 'text-emerald-700'
          }`}>
            👤 {t('userDetails')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-blue-200' : 'text-slate-700'
              }`}>
                {t('name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                  darkMode
                    ? 'bg-blue-900/50 border-blue-700 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                    : 'bg-white border-emerald-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-blue-200' : 'text-slate-700'
              }`}>
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                  darkMode
                    ? 'bg-blue-900/50 border-blue-700 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                    : 'bg-white border-emerald-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-blue-200' : 'text-slate-700'
              }`}>
                {t('phone')}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                  darkMode
                    ? 'bg-blue-900/50 border-blue-700 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                    : 'bg-white border-emerald-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-blue-200' : 'text-slate-700'
              }`}>
                {t('address')}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                  darkMode
                    ? 'bg-blue-900/50 border-blue-700 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                    : 'bg-white border-emerald-300 text-slate-900 placeholder-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-blue-200' : 'text-slate-700'
              }`}>
                {t('role')}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                  darkMode
                    ? 'bg-blue-900/50 border-blue-700 text-yellow-300 focus:border-yellow-400'
                    : 'bg-white border-emerald-300 text-slate-900 focus:border-emerald-500'
                }`}
              >
                <option value="restaurant">{t('restaurant')}</option>
                <option value="ngo">{t('ngo')}</option>
                <option value="volunteer">{t('volunteer')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className={`rounded-2xl p-8 mb-8 transition border ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-blue-700/50 shadow-xl' 
            : 'bg-gradient-to-br from-emerald-400/10 to-blue-400/10 border-emerald-300/50 shadow-lg'
        }`}>
          <h2 className={`text-2xl font-bold mb-8 ${
            darkMode ? 'text-yellow-300' : 'text-emerald-700'
          }`}>
            🎨 {t('preferences')}
          </h2>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-8 p-4 rounded-xl" style={{
            backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)'
          }}>
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-6 h-6 text-yellow-300" />
              ) : (
                <Sun className="w-6 h-6 text-emerald-600" />
              )}
              <span className={`font-bold text-lg ${darkMode ? 'text-yellow-300' : 'text-emerald-700'}`}>
                {t('darkMode')}
              </span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                darkMode 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-lg ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Globe className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-emerald-600'}`} />
              <span className={`font-bold text-lg ${darkMode ? 'text-yellow-300' : 'text-emerald-700'}`}>
                {t('language')}
              </span>
            </div>
            <div className="flex gap-3 flex-wrap">
              {(['en', 'ta', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                    currentLanguage === lang
                      ? darkMode
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                      : darkMode
                        ? 'bg-blue-700/50 text-blue-200 hover:bg-blue-600/50'
                        : 'bg-emerald-200/50 text-emerald-700 hover:bg-emerald-300/50'
                  }`}
                >
                  {lang === 'en' && '🇬🇧 ' + t('english')}
                  {lang === 'ta' && '🇮🇳 ' + t('tamil')}
                  {lang === 'hi' && '🇮🇳 ' + t('hindi')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => alert(t('saved'))}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 ${
            darkMode
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900 shadow-lg'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg'
          }`}
        >
          💾 {t('save')}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
