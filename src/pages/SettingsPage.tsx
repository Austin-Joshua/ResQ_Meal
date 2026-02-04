import React, { useState } from 'react';
import { Moon, Sun, Globe, Building2, Heart, TrendingUp, ChevronDown, ChevronUp, Settings, User, Palette } from 'lucide-react';

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
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-950' 
        : 'bg-white'
    }`}>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight mb-8 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          <Settings className="w-7 h-7 opacity-90" /> {t('settings')}
        </h1>

        {/* User Details Section */}
        <div className={`rounded-xl transition-all duration-200 border ${
          darkMode 
            ? 'bg-emerald-900/20 border-emerald-700/30' 
            : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
        }`}>
          <button
            onClick={() => toggleSection('userDetails')}
            className={`w-full px-6 py-5 flex items-center justify-between transition-colors duration-200 ${
              darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'
            }`}
          >
            <h2 className={`text-lg font-semibold flex items-center gap-2.5 ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <User className="w-5 h-5 opacity-80" /> {t('userDetails')}
            </h2>
            {expandedSections.userDetails ? (
              <ChevronUp className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
            )}
          </button>

          {expandedSections.userDetails && (
            <div
              className={`px-6 pb-6 space-y-4 border-t ${
                darkMode ? 'border-emerald-700/20 pt-5' : 'border-slate-100 pt-5'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div>
                  <label
                    htmlFor="settings-name"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-email"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-phone"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-address"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-role"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {t('role')}
                  </label>
                  <select
                    id="settings-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 focus:border-slate-300 focus:ring-slate-200'
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
        <div className={`rounded-xl mb-6 transition-all duration-200 border ${
          darkMode 
            ? 'bg-emerald-900/20 border-emerald-700/30' 
            : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
        }`}>
          <button
            onClick={() => toggleSection('orgInfo')}
            className={`w-full px-6 py-5 flex items-center justify-between transition-colors duration-200 ${
              darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'
            }`}
          >
            <h2 className={`text-lg font-semibold flex items-center gap-2.5 ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Building2 className="w-5 h-5 opacity-80" /> {t('organizationInfo')}
            </h2>
            {expandedSections.orgInfo ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSections.orgInfo && (
            <div
              className={`px-6 pb-6 space-y-4 border-t ${
                darkMode ? 'border-emerald-700/20 pt-5' : 'border-slate-100 pt-5'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label
                    htmlFor="settings-org-name"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-org-type"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-license"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-website"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-registration-date"
                    className={`block text-sm font-medium mb-1.5 ${
                      darkMode ? 'text-slate-400' : 'text-slate-600'
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
                    className={`w-full px-4 py-2.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      darkMode
                        ? 'bg-emerald-900/30 border-emerald-600/30 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30'
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-200'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Donation Statistics Section */}
        <div className={`rounded-xl mb-6 transition-all duration-200 border ${
          darkMode 
            ? 'bg-emerald-900/20 border-emerald-700/30' 
            : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
        }`}>
          <button
            onClick={() => toggleSection('donationStats')}
            className={`w-full px-6 py-5 flex items-center justify-between transition-colors duration-200 ${
              darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50/80'
            }`}
          >
            <h2 className={`text-lg font-semibold flex items-center gap-2.5 ${
              darkMode ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Heart className="w-5 h-5 opacity-80" /> {t('donationStats')}
            </h2>
            {expandedSections.donationStats ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {expandedSections.donationStats && (
            <div
              className={`px-6 pb-6 pt-5 border-t space-y-6 ${
                darkMode ? 'border-emerald-700/20' : 'border-slate-100'
              }`}
            >
              {/* Donation Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-lg p-4 ${
                  darkMode
                    ? 'bg-emerald-900/25 border border-emerald-700/20'
                    : 'bg-slate-50/80 border border-slate-100'
                }`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('totalDonations')}</p>
                  <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {donationData.totalDonations}
                  </p>
                </div>

                <div className={`rounded-lg p-4 ${
                  darkMode
                    ? 'bg-emerald-900/25 border border-emerald-700/20'
                    : 'bg-slate-50/80 border border-slate-100'
                }`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('mealsContributed')}</p>
                  <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {donationData.mealsContributed.toLocaleString()}
                  </p>
                </div>

                <div className={`rounded-lg p-4 ${
                  darkMode
                    ? 'bg-emerald-900/25 border border-emerald-700/20'
                    : 'bg-slate-50/80 border border-slate-100'
                }`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('moneyValue')}</p>
                  <p className={`text-2xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {donationData.estimatedValue}
                  </p>
                </div>
              </div>

              {/* Impact Metrics */}
              <div>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <TrendingUp className="w-4 h-4" /> {t('impactContribution')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`rounded-lg p-4 ${
                    darkMode
                      ? 'bg-emerald-900/25 border border-emerald-700/20'
                      : 'bg-slate-50/80 border border-slate-100'
                  }`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>CO₂ Saved</p>
                    <p className={`text-xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {donationData.co2Saved}
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    darkMode
                      ? 'bg-emerald-900/25 border border-emerald-700/20'
                      : 'bg-slate-50/80 border border-slate-100'
                  }`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Water Saved</p>
                    <p className={`text-xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {donationData.waterSaved}
                    </p>
                  </div>

                  <div className={`rounded-lg p-4 ${
                    darkMode
                      ? 'bg-emerald-900/25 border border-emerald-700/20'
                      : 'bg-slate-50/80 border border-slate-100'
                  }`}>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Families Helped</p>
                    <p className={`text-xl font-semibold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                      {donationData.familiesHelped.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className={`rounded-xl p-6 mb-8 transition-all duration-200 border ${
          darkMode 
            ? 'bg-emerald-900/20 border-emerald-700/30' 
            : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
        }`}>
          <h2 className={`text-lg font-semibold mb-6 flex items-center gap-2.5 ${
            darkMode ? 'text-slate-200' : 'text-slate-800'
          }`}>
            <Palette className="w-5 h-5 opacity-80" /> {t('preferences')}
          </h2>

          {/* Dark Mode Toggle */}
          <div className={`flex items-center justify-between mb-6 p-4 rounded-lg border ${
            darkMode 
              ? 'bg-emerald-900/20 border-emerald-700/20' 
              : 'bg-slate-50/50 border-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-slate-500" />
              )}
              <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {t('darkMode')}
              </span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                darkMode 
                  ? 'bg-emerald-500' 
                  : 'bg-slate-300'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
                  darkMode ? 'left-7' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Language Selection */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Globe className={`w-5 h-5 opacity-80 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              <span className={`font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {t('language')}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['en', 'ta', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                    currentLanguage === lang
                      ? darkMode
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-slate-800 text-white'
                      : darkMode
                        ? 'bg-white/10 text-slate-200 hover:bg-white/15 border border-slate-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {lang === 'en' && t('english')}
                  {lang === 'ta' && t('tamil')}
                  {lang === 'hi' && t('hindi')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => alert(t('saved'))}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
            darkMode
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-900 text-white'
          }`}
          aria-label="Save settings"
        >
          {t('save')}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
