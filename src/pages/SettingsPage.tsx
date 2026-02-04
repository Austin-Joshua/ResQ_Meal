import React, { useState } from 'react';
import { Moon, Sun, Globe } from 'lucide-react';

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ darkMode, setDarkMode }) => {
  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>('en');

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
      },
    };
    return translations[language]?.[key] || key;
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

  const handleLanguageChange = (lang: 'en' | 'ta' | 'hi') => {
    setLanguage(lang);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">{t('settings')}</h1>

        {/* User Details Section */}
        <div className={`rounded-lg p-6 mb-8 transition ${
          darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-teal-400' : 'text-teal-600'
          }`}>
            {t('userDetails')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('name')}</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                } focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                } focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('phone')}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                } focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('address')}</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                } focus:outline-none`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('role')}</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border transition ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-teal-600'
                } focus:outline-none`}
              >
                <option value="restaurant">{t('restaurant')}</option>
                <option value="ngo">{t('ngo')}</option>
                <option value="volunteer">{t('volunteer')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className={`rounded-lg p-6 mb-8 transition ${
          darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${
            darkMode ? 'text-teal-400' : 'text-teal-600'
          }`}>
            Preferences
          </h2>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-amber-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <span className="font-medium">{t('darkMode')}</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-7 rounded-full transition ${
                darkMode ? 'bg-teal-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-3 mb-4">
            <Globe className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-500'}`} />
            <span className="font-medium">{t('language')}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['en', 'ta', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  language === lang
                    ? darkMode
                      ? 'bg-teal-600 text-white'
                      : 'bg-teal-600 text-white'
                    : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang === 'en' && t('english')}
                {lang === 'ta' && t('tamil')}
                {lang === 'hi' && t('hindi')}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => alert(t('saved'))}
          className={`w-full py-3 rounded-lg font-semibold text-white transition ${
            darkMode
              ? 'bg-teal-600 hover:bg-teal-700'
              : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
