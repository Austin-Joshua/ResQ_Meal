import React, { useState } from 'react';
import { Moon, Sun, Globe, Building2, Heart, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface SettingsPageProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language?: 'en' | 'ta' | 'hi';
  setLanguage?: (lang: 'en' | 'ta' | 'hi') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ darkMode, setDarkMode, language: propLanguage, setLanguage: propSetLanguage }) => {
  const [language, setLanguageLocal] = useState<'en' | 'ta' | 'hi'>(propLanguage || 'en');
  const [expandedSections, setExpandedSections] = useState({
    userDetails: false,
    orgInfo: false,
    donationStats: false,
  });
  
  const currentLanguage = propLanguage || language;
  const handleLanguageChange = (lang: 'en' | 'ta' | 'hi') => {
    if (propSetLanguage) {
      propSetLanguage(lang);
    } else {
      setLanguageLocal(lang);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
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
        organizationInfo: 'Organization Information',
        orgName: 'Organization Name',
        orgType: 'Organization Type',
        license: 'License/Registration Number',
        website: 'Website',
        registrationDate: 'Registration Date',
        donationStats: 'Donation Statistics',
        totalDonations: 'Total Donations',
        mealsContributed: 'Meals Contributed',
        moneyValue: 'Estimated Value',
        impactContribution: 'Your Impact Contribution',
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
        organizationInfo: 'நிறுவன தகவல்',
        orgName: 'நிறுவன பெயர்',
        orgType: 'நிறுவன வகை',
        license: 'உரிமம்/பதிவு எண்',
        website: 'வலைத்தளம்',
        registrationDate: 'பதிவு தேதி',
        donationStats: 'நன்கொடை புள்ளியியல்',
        totalDonations: 'மொத்த நன்கொடைகள்',
        mealsContributed: 'பங்களிக்கப்பட்ட உணவு',
        moneyValue: 'மதிப்பிடப்பட்ட மதிப்பு',
        impactContribution: 'உங்கள் தாக்கம் பங்களிப்பு',
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
        organizationInfo: 'संगठन जानकारी',
        orgName: 'संगठन का नाम',
        orgType: 'संगठन का प्रकार',
        license: 'लाइसेंस/पंजीकरण संख्या',
        website: 'वेबसाइट',
        registrationDate: 'पंजीकरण तिथि',
        donationStats: 'दान आंकड़े',
        totalDonations: 'कुल दान',
        mealsContributed: 'योगदान दिए गए भोजन',
        moneyValue: 'अनुमानित मूल्य',
        impactContribution: 'आपका प्रभाव योगदान',
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
    orgName: 'The Food Company Ltd.',
    orgType: 'Cloud Kitchens',
    license: 'FCC2024-001234',
    website: 'www.foodcompany.in',
    registrationDate: '2023-06-15',
  });

  const donationData = {
    totalDonations: 156,
    mealsContributed: 12480,
    estimatedValue: '₹6,24,000',
    co2Saved: '31.2 tons',
    waterSaved: '15.6M liters',
    familiesHelped: 1248,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' 
        : 'bg-gradient-to-br from-white via-slate-50 to-slate-100'
    }`}>
      <div className="max-w-5xl mx-auto p-6 pt-20">
        <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
          ⚙️ {t('settings')}
        </h1>

        {/* User Details Section */}
        <div className={`rounded-2xl transition border ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm'
        }`}>
          <button
            onClick={() => toggleSection('userDetails')}
            className={`w-full px-8 py-6 flex items-center justify-between transition-all duration-200 hover:opacity-80`}
          >
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${
              darkMode ? 'text-yellow-300' : 'text-slate-900'
            }`}>
              👤 {t('userDetails')}
            </h2>
            {expandedSections.userDetails ? (
              <ChevronUp className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`} />
            ) : (
              <ChevronDown className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`} />
            )}
          </button>

          {expandedSections.userDetails && (
            <div
              className={`px-8 pb-8 space-y-4 border-t ${
                darkMode ? 'border-yellow-600/20' : 'border-blue-300/40'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div>
                  <label
                    htmlFor="settings-name"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('name')}
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-email"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('email')}
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-phone"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('phone')}
                  </label>
                  <input
                    id="settings-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-address"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('address')}
                  </label>
                  <input
                    id="settings-address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-role"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('role')}
                  </label>
                  <select
                    id="settings-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="restaurant">{t('restaurant')}</option>
                    <option value="ngo">{t('ngo')}</option>
                    <option value="volunteer">{t('volunteer')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Organization Information Section */}
        <div className={`rounded-2xl mb-8 transition border ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm'
        }`}>
          <button
            onClick={() => toggleSection('orgInfo')}
            className={`w-full px-8 py-6 flex items-center justify-between transition-all duration-200 hover:opacity-80`}
          >
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${
              darkMode ? 'text-yellow-300' : 'text-slate-900'
            }`}>
              <Building2 className="w-6 h-6" /> {t('organizationInfo')}
            </h2>
            {expandedSections.orgInfo ? (
              <ChevronUp className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`} />
            ) : (
              <ChevronDown className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`} />
            )}
          </button>

          {expandedSections.orgInfo && (
            <div
              className={`px-8 pb-8 space-y-4 border-t ${
                darkMode ? 'border-yellow-600/20' : 'border-blue-300/40'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div>
                  <label
                    htmlFor="settings-org-name"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('orgName')}
                  </label>
                  <input
                    id="settings-org-name"
                    type="text"
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-org-type"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('orgType')}
                  </label>
                  <input
                    id="settings-org-type"
                    type="text"
                    name="orgType"
                    value={formData.orgType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-license"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('license')}
                  </label>
                  <input
                    id="settings-license"
                    type="text"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-website"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('website')}
                  </label>
                  <input
                    id="settings-website"
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-registration-date"
                    className={`block text-sm font-semibold mb-2 ${
                      darkMode ? 'text-blue-200' : 'text-slate-700'
                    }`}
                  >
                    {t('registrationDate')}
                  </label>
                  <input
                    id="settings-registration-date"
                    type="date"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition focus:outline-none ${
                      darkMode
                        ? 'bg-blue-900/50 border-yellow-600/50 text-yellow-300 placeholder-blue-300 focus:border-yellow-400'
                        : 'bg-white border-blue-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Donation Statistics Section */}
        <div className={`rounded-2xl mb-8 transition border ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm'
        }`}>
          <button
            onClick={() => toggleSection('donationStats')}
            className={`w-full px-8 py-6 flex items-center justify-between transition-all duration-200 hover:opacity-80`}
          >
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${
              darkMode ? 'text-yellow-300' : 'text-slate-900'
            }`}>
              <Heart className="w-6 h-6" /> {t('donationStats')}
            </h2>
            {expandedSections.donationStats ? (
              <ChevronUp className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`} />
            ) : (
              <ChevronDown className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`} />
            )}
          </button>

          {expandedSections.donationStats && (
            <div
              className={`px-8 pb-8 pt-6 border-t space-y-6 ${
                darkMode ? 'border-yellow-600/20' : 'border-blue-300/40'
              }`}
            >
              {/* Donation Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-xl p-4 ${
                  darkMode
                    ? 'bg-blue-900/30 border border-yellow-600/20'
                    : 'bg-blue-200/20 border border-blue-300/30'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>{t('totalDonations')}</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                    {donationData.totalDonations}
                  </p>
                </div>

                <div className={`rounded-xl p-4 ${
                  darkMode
                    ? 'bg-blue-900/30 border border-yellow-600/20'
                    : 'bg-blue-200/20 border border-blue-300/30'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>{t('mealsContributed')}</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                    {donationData.mealsContributed.toLocaleString()}
                  </p>
                </div>

                <div className={`rounded-xl p-4 ${
                  darkMode
                    ? 'bg-blue-900/30 border border-yellow-600/20'
                    : 'bg-blue-200/20 border border-blue-300/30'
                }`}>
                  <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>{t('moneyValue')}</p>
                  <p className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                    {donationData.estimatedValue}
                  </p>
                </div>
              </div>

              {/* Impact Metrics */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  darkMode ? 'text-yellow-300' : 'text-blue-700'
                }`}>
                  <TrendingUp className="w-5 h-5" /> {t('impactContribution')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`rounded-xl p-4 ${
                    darkMode
                      ? 'bg-emerald-900/30 border border-emerald-600/20'
                      : 'bg-emerald-200/20 border border-emerald-300/30'
                  }`}>
                    <p className={`text-sm ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>🌱 CO₂ Saved</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-300' : 'text-emerald-700'}`}>
                      {donationData.co2Saved}
                    </p>
                  </div>

                  <div className={`rounded-xl p-4 ${
                    darkMode
                      ? 'bg-blue-900/30 border border-blue-600/20'
                      : 'bg-blue-200/20 border border-blue-300/30'
                  }`}>
                    <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>💧 Water Saved</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                      {donationData.waterSaved}
                    </p>
                  </div>

                  <div className={`rounded-xl p-4 ${
                    darkMode
                      ? 'bg-pink-900/30 border border-pink-600/20'
                      : 'bg-pink-200/20 border border-pink-300/30'
                  }`}>
                    <p className={`text-sm ${darkMode ? 'text-pink-200' : 'text-pink-700'}`}>👨‍👩‍👧‍👦 Families Helped</p>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-yellow-300' : 'text-pink-700'}`}>
                      {donationData.familiesHelped.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className={`rounded-2xl p-8 mb-8 transition border ${
          darkMode 
            ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl' 
            : 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-2xl font-bold mb-8 ${
            darkMode ? 'text-yellow-300' : 'text-slate-900'
          }`}>
            🎨 {t('preferences')}
          </h2>

          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between mb-8 p-4 rounded-xl border ${
            darkMode 
              ? 'bg-blue-900/30 border-yellow-600/20' 
              : 'bg-blue-200/20 border-blue-300/30'
          }`}>
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-6 h-6 text-yellow-300" />
              ) : (
                <Sun className="w-6 h-6 text-blue-600" />
              )}
              <span className={`font-bold text-lg ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                {t('darkMode')}
              </span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                darkMode 
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-300 shadow-lg ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Globe className={`w-6 h-6 ${darkMode ? 'text-yellow-300' : 'text-blue-600'}`} />
              <span className={`font-bold text-lg ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
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
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : darkMode
                        ? 'bg-blue-700/50 text-blue-200 hover:bg-blue-600/50'
                        : 'bg-blue-200/50 text-blue-700 hover:bg-blue-300/50'
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
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
          }`}
          aria-label="Save settings"
        >
          💾 {t('save')}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
