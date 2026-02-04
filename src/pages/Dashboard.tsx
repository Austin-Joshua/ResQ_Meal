import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Settings as SettingsIcon, Moon, Sun, Globe, ArrowRight, TrendingUp, Users, MapPin, Clock, Shield, BarChart3, Home, Send, Target, Zap, Leaf, Truck, Bell, Heart, ChevronDown, HeartHandshake, FileText, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PostSurplusPage from './PostSurplus';
import logoFull from '@/assets/logo-full.png';

interface DashboardProps {
  onSettingsClick: () => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
}

// Sample chart data
const impactData = [
  { date: 'Mon', meals: 120, co2: 300 },
  { date: 'Tue', meals: 135, co2: 338 },
  { date: 'Wed', meals: 128, co2: 320 },
  { date: 'Thu', meals: 165, co2: 412 },
  { date: 'Fri', meals: 155, co2: 387 },
  { date: 'Sat', meals: 180, co2: 450 },
  { date: 'Sun', meals: 195, co2: 487 },
];

// Translation strings
const translations = {
  en: {
    welcome: 'Welcome back! 👋',
    missionToday: "Here's what's happening with your food rescue mission today",
    dashboard: 'Dashboard',
    postSurplus: 'Post Surplus',
    myMatches: 'My Matches',
    impact: 'Impact',
    mealsSaved: 'Meals Saved',
    foodDiverted: 'Food Diverted',
    co2Prevented: 'CO₂ Prevented',
    waterSaved: 'Water Saved',
    weeklyTrend: 'Weekly Impact Trend',
    oneClickPosting: 'One-Click Posting',
    smartMatching: 'Smart Matching',
    foodSafetyTimer: 'Food Safety Timer',
    liveDeliveryTrack: 'Live Delivery Track',
    notifications: 'Notifications',
    impactMeter: 'Impact Meter',
    carbonSaved: 'Carbon Saved',
    verification: 'Verification',
    features: 'Features',
    donor: 'Donor',
    ngo: 'NGO',
    report: 'Report',
    aboutUs: 'About Us',
    language: 'Language',
    english: 'English',
    tamil: 'Tamil',
    hindi: 'Hindi',
    quickActions: 'Quick Actions',
    recentActivity: "Today's Activity",
    pendingMatches: 'Pending Matches',
    activeDeliveries: 'Active Deliveries',
    didYouKnow: 'Did you know?',
    tipText: 'Every 1 kg of food rescued saves ~2.5 kg CO₂ and helps feed someone in need.',
    howYouCanHelp: 'How you can help',
    postFoodNow: 'Post food now',
    viewMatches: 'View matches',
    seeImpact: 'See impact',
  },
  ta: {
    welcome: 'திரும்பி வந்ததற்கு நன்றி! 👋',
    missionToday: 'உங்கள் உணவு மீட்புப் பணி இன்று எவ்வாறு உள்ளது',
    dashboard: 'டாஷ்போர்டு',
    postSurplus: 'உணவு பதிவு',
    myMatches: 'என் பொருத்தங்கள்',
    impact: 'தாக்கம்',
    mealsSaved: 'சேமிக்கப்பட்ட உணவு',
    foodDiverted: 'திசை மாற்றப்பட்ட உணவு',
    co2Prevented: 'தடுக்கப்பட்ட CO₂',
    waterSaved: 'சேமிக்கப்பட்ட நீர்',
    weeklyTrend: 'வாரவாரி தாக்கம் போக்கு',
    oneClickPosting: 'ஒரு கிளிக் பதிவு',
    smartMatching: 'ஸ்மார்ட் பொருத்தம்',
    foodSafetyTimer: 'உணவு பாதுகாப்பு டைமர்',
    liveDeliveryTrack: 'நேரடி டெலிவரி தடசம்',
    notifications: 'அறிவிப்புகள்',
    impactMeter: 'தாக்கம் மீட்டர்',
    carbonSaved: 'கார்பன் சேமிக்கப்பட்டது',
    verification: 'சரிபார்ப்பு',
    features: 'அம்சங்கள்',
    donor: 'நன்கொடையாளர்',
    ngo: 'NGO',
    report: 'அறிக்கை',
    aboutUs: 'எங்களைப் பற்றி',
    language: 'மொழி',
    english: 'ஆங்கிலம்',
    tamil: 'தமிழ்',
    hindi: 'இந்தி',
    quickActions: 'விரைவு செயல்கள்',
    recentActivity: 'இன்றைய செயல்பாடு',
    pendingMatches: 'நிலுவை பொருத்தங்கள்',
    activeDeliveries: 'செயலில் உள்ள டெலிவரிகள்',
    didYouKnow: 'உங்களுக்கு தெரியுமா?',
    tipText: 'ஒவ்வொரு 1 கிலோ உணவு மீட்பும் ~2.5 கிலோ CO₂ சேமிக்கிறது.',
    howYouCanHelp: 'நீங்கள் எவ்வாறு உதவ முடியும்',
    postFoodNow: 'இப்போது உணவு பதிவு',
    viewMatches: 'பொருத்தங்களைக் காண்க',
    seeImpact: 'தாக்கத்தைக் காண்க',
  },
  hi: {
    welcome: 'वापसी पर स्वागत है! 👋',
    missionToday: 'आज आपके खाद्य बचाव मिशन के साथ क्या हो रहा है',
    dashboard: 'डैशबोर्ड',
    postSurplus: 'अतिरिक्त भोजन पोस्ट करें',
    myMatches: 'मेरे मैच',
    impact: 'प्रभाव',
    mealsSaved: 'बचाए गए भोजन',
    foodDiverted: 'भोजन स्थानांतरित',
    co2Prevented: 'रोका गया CO₂',
    waterSaved: 'बचाया गया पानी',
    weeklyTrend: 'साप्ताहिक प्रभाव प्रवृत्ति',
    oneClickPosting: 'वन-क्लिक पोस्टिंग',
    smartMatching: 'स्मार्ट मिलान',
    foodSafetyTimer: 'खाद्य सुरक्षा टाइमर',
    liveDeliveryTrack: 'लाइव डिलीवरी ट्रैकिंग',
    notifications: 'सूचनाएं',
    impactMeter: 'प्रभाव मीटर',
    carbonSaved: 'कार्बन बचाया गया',
    verification: 'सत्यापन',
    features: 'विशेषताएं',
    donor: 'दानदाता',
    ngo: 'NGO',
    report: 'रिपोर्ट',
    aboutUs: 'हमारे बारे में',
    language: 'भाषा',
    english: 'अंग्रेज़ी',
    tamil: 'तमिल',
    hindi: 'हिंदी',
    quickActions: 'त्वरित कार्य',
    recentActivity: 'आज की गतिविधि',
    pendingMatches: 'लंबित मैच',
    activeDeliveries: 'सक्रिय डिलीवरी',
    didYouKnow: 'क्या आप जानते हैं?',
    tipText: 'हर 1 किलो बचाया भोजन ~2.5 किलो CO₂ बचाता है।',
    howYouCanHelp: 'आप कैसे मदद कर सकते हैं',
    postFoodNow: 'अभी भोजन पोस्ट करें',
    viewMatches: 'मैच देखें',
    seeImpact: 'प्रभाव देखें',
  },
};

export const Dashboard: React.FC<DashboardProps> = ({ onSettingsClick, darkMode, setDarkMode, language, setLanguage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<'dashboard' | 'post' | 'matches' | 'impact' | 'feature' | 'about'>('dashboard');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const features = [
    { id: 'post', icon: '📤', label: 'Post Food', color: 'from-emerald-500 to-emerald-600' },
    { id: 'matches', icon: '🎯', label: 'Matches', color: 'from-yellow-500 to-yellow-600' },
    { id: 'impact', icon: '🌍', label: 'Impact', color: 'from-blue-600 to-blue-700' },
  ];

  const languageLabels = { en: t.english, ta: t.tamil, hi: t.hindi };

  const navigationItems = [
    { id: 'dashboard', icon: Home, label: t.dashboard },
    { id: 'post', icon: HeartHandshake, label: t.donor },
    { id: 'matches', icon: Users, label: t.ngo },
    { id: 'impact', icon: FileText, label: t.report },
    { id: 'about', icon: Info, label: t.aboutUs },
  ];

  const menuFeatures = [
    { id: 'oneClick', icon: <Send className="w-5 h-5" />, label: t.oneClickPosting, color: '#10B981', desc: 'Post surplus food in seconds' },
    { id: 'smartMatch', icon: <Target className="w-5 h-5" />, label: t.smartMatching, color: '#F59E0B', desc: 'AI-powered NGO matching' },
    { id: 'foodTimer', icon: <Zap className="w-5 h-5" />, label: t.foodSafetyTimer, color: '#1D72F5', desc: 'Real-time expiry countdown' },
    { id: 'liveTrack', icon: <Truck className="w-5 h-5" />, label: t.liveDeliveryTrack, color: '#10B981', desc: 'Track deliveries live' },
    { id: 'notify', icon: <Bell className="w-5 h-5" />, label: t.notifications, color: '#F59E0B', desc: 'Donation alerts & thanks' },
    { id: 'impact', icon: <Heart className="w-5 h-5" />, label: t.impactMeter, color: '#1D72F5', desc: 'View environmental impact' },
    { id: 'carbon', icon: <Leaf className="w-5 h-5" />, label: t.carbonSaved, color: '#10B981', desc: 'CO₂ reduction statistics' },
    { id: 'verify', icon: <Shield className="w-5 h-5" />, label: t.verification, color: '#F59E0B', desc: 'Food quality verification' },
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950' 
        : 'bg-gradient-to-br from-white via-slate-50 to-slate-100'
    }`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg transition-all duration-300 border-b ${
        darkMode 
          ? 'bg-gradient-to-r from-slate-950/98 to-blue-950/98 border-yellow-600/30' 
          : 'bg-gradient-to-r from-white/98 to-blue-50/98 border-yellow-300/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-yellow-900/40 text-yellow-300'
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={() => {
                setActivePage('dashboard');
                setSelectedFeature(null);
                setSidebarOpen(false);
              }}
              className="flex items-center focus:outline-none"
              aria-label="ResQ Meal - Back to dashboard"
            >
              <img src={logoFull} alt="ResQ Meal - Turning surplus into sustenance" className="h-12 w-auto max-w-[200px]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Button (dropdown) */}
            <div className="relative" ref={languageMenuRef}>
              <button
                type="button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  darkMode ? 'bg-amber-600/15 text-yellow-200 hover:bg-amber-600/25' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={t.language}
              >
                <Globe className="w-4 h-4" />
                <span>{languageLabels[language]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {languageMenuOpen && (
                <div
                  className={`absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border shadow-lg py-1 z-50 ${
                    darkMode ? 'bg-slate-800 border-amber-600/30' : 'bg-white border-gray-200'
                  }`}
                >
                  {(['en', 'ta', 'hi'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setLanguage(lang);
                        setLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition ${
                        language === lang
                          ? darkMode ? 'bg-amber-600/30 text-yellow-300' : 'bg-slate-100 text-slate-900'
                          : darkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {languageLabels[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-yellow-900/40 text-yellow-300'
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={onSettingsClick}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-yellow-900/40 text-yellow-300'
                  : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar / Hamburger Menu: Dashboard, Donor, NGO, Report, About Us */}
      <aside className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 transition-all duration-300 transform overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-r border-yellow-600/20' 
          : 'bg-gradient-to-b from-slate-50 to-emerald-50/80 border-r border-slate-200/50'
      } backdrop-blur-lg z-30`}>
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as any);
                  setSidebarOpen(false);
                  setSelectedFeature(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? darkMode
                      ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 shadow-lg border border-yellow-500/40'
                      : 'bg-gradient-to-r from-emerald-400/30 to-emerald-500/20 shadow-md border border-emerald-400/40'
                    : darkMode
                    ? 'hover:bg-yellow-900/20 text-slate-200'
                    : 'hover:bg-slate-200/30 text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`font-semibold transition-all duration-200 ${
                  isActive ? (darkMode ? 'text-yellow-300' : 'text-emerald-700') : (darkMode ? 'text-slate-200' : 'text-slate-700')
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <ArrowRight className={`w-4 h-4 ml-auto ${darkMode ? 'text-yellow-300' : 'text-emerald-600'}`} />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'md:ml-64' : ''} transition-all duration-300`}>
        {/* Dashboard Page */}
        {activePage === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
            {/* Welcome Card */}
            <div className={`rounded-2xl p-6 md:p-8 transition-all duration-300 border ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-yellow-600/30 shadow-xl'
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h2 className={`text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t.welcome}
              </h2>
              <p className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {t.missionToday}
              </p>
            </div>

            {/* Quick Actions - Minimized */}
            <div className={`rounded-xl p-3 transition-all duration-300 border ${
              darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
                {t.quickActions}
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActivePage('post')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  <Send className="w-3 h-3" /> {t.postFoodNow}
                </button>
                <button
                  onClick={() => setActivePage('matches')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  <Target className="w-3 h-3" /> {t.viewMatches}
                </button>
                <button
                  onClick={() => setActivePage('impact')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-teal-600/30 text-teal-300 hover:bg-teal-600/50' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  <BarChart3 className="w-3 h-3" /> {t.seeImpact}
                </button>
              </div>
            </div>

            {/* Today's Activity + Pending / Active */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-2xl p-6 transition-all duration-300 border ${
                darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
                  <Clock className="w-4 h-4" /> {t.recentActivity}
                </h3>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  <li className="flex items-center gap-2">✓ 2 posts matched with NGOs today</li>
                  <li className="flex items-center gap-2">✓ 1 delivery completed</li>
                  <li className="flex items-center gap-2">○ 1 match awaiting your response</li>
                </ul>
              </div>
              <div className={`rounded-2xl p-6 transition-all duration-300 border ${
                darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
                  {t.howYouCanHelp}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-600/20' : 'bg-amber-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>3</p>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>{t.pendingMatches}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-600/20' : 'bg-emerald-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>1</p>
                    <p className={`text-xs font-medium ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>{t.activeDeliveries}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Did you know tip - Minimized */}
            <div className={`rounded-xl p-3 transition-all duration-300 border ${
              darkMode ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <p className={`text-xs font-semibold flex items-center gap-1.5 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                <Leaf className="w-3 h-3" /> {t.didYouKnow}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-200' : 'text-amber-900/90'}`}>
                {t.tipText}
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActivePage(feature.id as any)}
                  className={`group relative rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden border ${
                    darkMode
                      ? 'shadow-xl border-yellow-600/20 bg-gradient-to-br from-blue-900/60 to-slate-900/60'
                      : 'shadow-lg border-blue-200/60 bg-gradient-to-br from-white to-blue-100'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative">
                    <div className="text-5xl mb-3">{feature.icon}</div>
                    <h3
                      className={`text-xl font-bold mb-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {feature.label}
                    </h3>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-blue-100/80' : 'text-slate-700'
                      }`}
                    >
                      Get started now
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: '🍽️', label: t.mealsSaved, value: '3,450', color: 'from-emerald-500/30 to-emerald-600/30', border: 'emerald' },
                { icon: '⚖️', label: t.foodDiverted, value: '8,625 kg', color: 'from-blue-500/30 to-blue-600/30', border: 'blue' },
                { icon: '💨', label: t.co2Prevented, value: '21.5 tons', color: 'from-yellow-500/30 to-yellow-600/30', border: 'yellow' },
                { icon: '💧', label: t.waterSaved, value: '8.6M L', color: 'from-cyan-500/30 to-cyan-600/30', border: 'cyan' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 transition-all duration-300 border ${
                    darkMode
                      ? `bg-gradient-to-br ${stat.color} border-yellow-600/30 shadow-lg`
                      : `bg-gradient-to-br ${stat.color} border-slate-300/50 shadow-md`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <span className="text-4xl opacity-50">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Card */}
            <div className={`rounded-2xl p-8 transition-all duration-300 border ${
              darkMode
                ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
                : 'bg-gradient-to-br from-slate-50 to-emerald-50/15 border-slate-300/50 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-yellow-300' : 'text-slate-900'
                }`}>
                  <TrendingUp className="w-6 h-6" />
                  {t.weeklyTrend}
                </h3>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#cbd5e1'} />
                    <XAxis dataKey="date" stroke={darkMode ? '#cbd5e1' : '#64748b'} />
                    <YAxis stroke={darkMode ? '#cbd5e1' : '#64748b'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        border: darkMode ? '2px solid #fbbf24' : '2px solid #64748b',
                        borderRadius: '8px',
                        color: darkMode ? '#fbbf24' : '#1e293b',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="meals"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Meals Saved"
                      dot={{ fill: '#10b981', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="co2"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      name="CO₂ Prevented"
                      dot={{ fill: '#f59e0b', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Feature Details Page */}
        {activePage === 'feature' && selectedFeature && (
          <FeatureDetailsPage 
            feature={selectedFeature} 
            darkMode={darkMode} 
            onBack={() => setActivePage('dashboard')}
            menuFeatures={menuFeatures}
          />
        )}

        {/* Post Surplus Page */}
        {activePage === 'post' && (
          <PostSurplusPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} />
        )}

        {/* Matches Page */}
        {activePage === 'matches' && (
          <MatchesPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} />
        )}

        {/* Impact Page */}
        {activePage === 'impact' && (
          <ImpactPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} />
        )}

        {/* About Us Page */}
        {activePage === 'about' && (
          <AboutPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} />
        )}
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Feature Details Page Component
const FeatureDetailsPage: React.FC<{ feature: string; darkMode: boolean; onBack: () => void; menuFeatures: any[] }> = ({ feature, darkMode, onBack, menuFeatures }) => {
  const selectedFeature = menuFeatures.find(f => f.id === feature);

  const featureDetails: Record<string, { title: string; description: string; benefits: string[]; stats: string[] }> = {
    oneClick: {
      title: '📤 One-Click Posting',
      description: 'Post your surplus food in just one click. Perfect for restaurants, catering services, and food businesses.',
      benefits: [
        'Quick posting process - 30 seconds max',
        'Automatic NGO matching',
        'Real-time notifications',
        'Food safety verification included',
      ],
      stats: [
        'Over 50,000+ successful posts',
        'Average 15 minutes to match',
        '95% success rate',
      ],
    },
    smartMatch: {
      title: '🎯 Smart Matching',
      description: 'Our AI-powered matching engine connects your surplus food with the most suitable NGOs based on their needs.',
      benefits: [
        'AI analyzes NGO requirements',
        'Distance-based matching',
        'Capacity aware recommendations',
        'Real-time availability check',
      ],
      stats: [
        'Machine learning model trained on 10K+ matches',
        'Average accuracy: 94%',
        'Processing time: <2 seconds',
      ],
    },
    foodTimer: {
      title: '⚡ Food Safety Timer',
      description: 'Real-time countdown timer to ensure food is consumed within safe consumption window.',
      benefits: [
        'Visual countdown indicator',
        'Alert notifications',
        'Temperature tracking',
        'Food quality monitoring',
      ],
      stats: [
        'Tracks 100,000+ food items daily',
        '99.8% accuracy rate',
        'Prevents 5+ tons of waste monthly',
      ],
    },
    liveTrack: {
      title: '🚚 Live Delivery Tracking',
      description: 'Track your food donations in real-time as volunteers deliver them to NGOs.',
      benefits: [
        'Google Maps integration',
        'Live location updates',
        'Delivery proof photos',
        'Impact metrics in real-time',
      ],
      stats: [
        'Covers 50+ cities',
        'Average delivery time: 45 minutes',
        '200,000+ successful deliveries',
      ],
    },
    notify: {
      title: '🔔 Notifications',
      description: 'Stay informed with personalized notifications about your donations and their impact.',
      benefits: [
        'Thank you messages',
        'Donation milestones',
        'Impact updates',
        'Urgent requests',
      ],
      stats: [
        'Sends 500K+ notifications daily',
        '87% engagement rate',
        'Customizable preferences',
      ],
    },
    impact: {
      title: '💚 Impact Meter',
      description: 'Visualize your contribution to fighting food waste and hunger in your community.',
      benefits: [
        'Personal impact dashboard',
        'Community rankings',
        'Environmental metrics',
        'Social impact stories',
      ],
      stats: [
        '3.5M+ meals saved',
        '8,625 kg food diverted',
        '21.5 tons CO₂ prevented',
      ],
    },
    carbon: {
      title: '🌱 Carbon Saved',
      description: 'Track the environmental impact of your food donations in terms of carbon reduction.',
      benefits: [
        'CO₂ reduction calculations',
        'Water saved metrics',
        'Carbon offset certificates',
        'Environmental badges',
      ],
      stats: [
        '1 kg food = 2.5 kg CO₂ saved',
        'Monthly carbon reports',
        'Share impact on social media',
      ],
    },
    verify: {
      title: '🛡️ Verification',
      description: 'AI-powered photo verification ensures all donated food meets safety and quality standards.',
      benefits: [
        'AI image recognition',
        'Quality scoring',
        'Safety assessment',
        'Approval workflows',
      ],
      stats: [
        '100,000+ items verified daily',
        '98% accuracy rate',
        'Multi-level verification system',
      ],
    },
  };

  const details = featureDetails[feature] || featureDetails.oneClick;

  return (
    <div className={`max-w-5xl mx-auto px-4 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        ← Back to Dashboard
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {details.title}
        </h1>
        <p className={`text-lg ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {details.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Benefits */}
        <div className={`rounded-2xl p-8 transition-all duration-300 border ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-yellow-600/30 shadow-lg'
            : 'bg-gradient-to-br from-blue-400/10 to-emerald-400/10 border-blue-300/50 shadow-md'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
            ✨ Key Benefits
          </h2>
          <ul className="space-y-3">
            {details.benefits.map((benefit, idx) => (
              <li key={idx} className={`flex items-start gap-3 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
                <span className={`text-xl mt-1 ${darkMode ? 'text-yellow-300' : 'text-blue-600'}`}>✓</span>
                <span className="font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Statistics */}
        <div className={`rounded-2xl p-8 transition-all duration-300 border ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-yellow-600/30 shadow-lg'
            : 'bg-gradient-to-br from-blue-400/10 to-emerald-400/10 border-blue-300/50 shadow-md'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
            📊 Impact Stats
          </h2>
          <ul className="space-y-3">
            {details.stats.map((stat, idx) => (
              <li key={idx} className={`flex items-center gap-3 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
                <span className={`text-2xl ${darkMode ? 'text-yellow-400' : 'text-blue-600'}`}>📈</span>
                <span className="font-medium">{stat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Matches Page Component
const MatchesPage: React.FC<{ darkMode: boolean; onBack: () => void }> = ({ darkMode, onBack }) => {
  const matches = [
    {
      id: 1,
      foodName: 'Fresh Grilled Vegetables',
      ngo: 'Save Children NGO',
      org: 'Registered NGO - License #NGO2024001',
      distance: '1.2 km',
      status: 'MATCHED',
      meals: 25,
      donation: '₹5,000 equivalent',
    },
    {
      id: 2,
      foodName: 'Cooked Pasta Dishes',
      ngo: 'Community Kitchen',
      org: 'Community Food Bank - Est. 2015',
      distance: '2.5 km',
      status: 'ACCEPTED',
      meals: 40,
      donation: '₹8,000 equivalent',
    },
  ];

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        ← Back to Dashboard
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          🎯 Your Matches
        </h2>
        <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
          See which NGOs are interested in your food
        </p>
      </div>

      <div className="space-y-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className={`rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer border ${
              darkMode
                ? 'bg-gradient-to-br from-blue-900/40 to-slate-900/40 border-yellow-600/30 shadow-xl hover:shadow-2xl'
                : 'bg-gradient-to-br from-blue-400/10 to-emerald-400/10 border-blue-300/50 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                  {match.foodName}
                </h3>
                <div className={`mb-3 ${darkMode ? 'text-blue-200' : 'text-slate-700'}`}>
                  <p className={`text-sm mb-1 font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    Organization: {match.ngo}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-blue-300/70' : 'text-slate-600'}`}>
                    📋 {match.org}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-lg font-bold mb-2 block ${
                  match.status === 'MATCHED'
                    ? darkMode ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-200/50 text-blue-700'
                    : darkMode ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-200/50 text-emerald-700'
                }`}>
                  {match.status}
                </span>
              </div>
            </div>

            <div className={`grid grid-cols-3 gap-4 mb-4 pb-4 border-b ${darkMode ? 'border-blue-600/30' : 'border-blue-200/50'}`}>
              <div>
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>📍 Distance</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>{match.distance}</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>🍽️ Meals</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>{match.meals}</p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>💰 Donation Value</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>{match.donation}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-2 rounded-lg transition-all duration-200">
                ✅ Accept
              </button>
              <button className={`flex-1 border-2 font-bold py-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'border-blue-600 text-blue-200 hover:bg-blue-700/50'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-100/50'
              }`}>
                ❌ Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Impact Page Component
const ImpactPage: React.FC<{ darkMode: boolean; onBack: () => void }> = ({ darkMode, onBack }) => {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        ← Back to Dashboard
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          📊 Your Impact
        </h2>
        <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
          See how much difference you're making
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: '🍽️', label: 'Total Meals', value: '3,450', color: 'from-emerald-500/30 to-emerald-600/30', border: 'emerald' },
          { icon: '⚖️', label: 'Food Diverted', value: '8,625 kg', color: 'from-blue-500/30 to-blue-600/30', border: 'blue' },
          { icon: '💨', label: 'CO₂ Saved', value: '21.5 tons', color: 'from-yellow-500/30 to-yellow-600/30', border: 'yellow' },
          { icon: '💧', label: 'Water Saved', value: '8.6M L', color: 'from-cyan-500/30 to-cyan-600/30', border: 'cyan' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-8 transition-all duration-300 border ${
              darkMode
                ? `bg-gradient-to-br ${stat.color} border-yellow-600/30 shadow-lg`
                : `bg-gradient-to-br ${stat.color} border-blue-300/50 shadow-md`
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {stat.label}
                </p>
                <p className={`text-4xl font-bold mt-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-5xl opacity-40">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// About Us Page Component – full website details and features
const AboutPage: React.FC<{ darkMode: boolean; onBack: () => void }> = ({ darkMode, onBack }) => {
  const aboutFeatures = [
    { icon: Zap, title: 'Fresh Food Checker (AI)', desc: 'Upload a photo or enter storage conditions. Our ML models assess freshness and quality so only safe food gets redistributed.' },
    { icon: Send, title: 'One-Click Surplus Posting', desc: 'Donors and restaurants post surplus food in seconds. Add quantity, expiry, location, and optional freshness check.' },
    { icon: Target, title: 'Smart NGO Matching', desc: 'AI-powered matching connects your surplus with NGOs by need, distance, and capacity. Accept or decline matches easily.' },
    { icon: Truck, title: 'Live Delivery Tracking', desc: 'Volunteers pick up and deliver. Track status and route in real time with proof-of-delivery and impact updates.' },
    { icon: BarChart3, title: 'Impact & Reports', desc: 'See meals saved, food diverted, CO₂ and water saved. Weekly trends and exportable reports for your records.' },
    { icon: Shield, title: 'Food Quality Verification', desc: 'Optional AI verification (image or environment) helps ensure food safety before it reaches beneficiaries.' },
    { icon: Globe, title: 'Multi-Language Support', desc: 'Use the platform in English, Tamil, and Hindi. Language switcher available in the header.' },
    { icon: Users, title: 'Roles: Donor, NGO, Volunteer', desc: 'Separate flows for donors posting food, NGOs requesting matches, and volunteers completing deliveries.' },
  ];

  const steps = [
    { step: 1, title: 'Post surplus', body: 'Donors add surplus food with quantity, expiry, and optional AI freshness check.' },
    { step: 2, title: 'Get matched', body: 'NGOs see relevant listings; our system suggests the best matches by need and distance.' },
    { step: 3, title: 'Confirm & deliver', body: 'Volunteers pick up and deliver. Track status and complete with proof of delivery.' },
    { step: 4, title: 'See impact', body: 'Meals saved, CO₂ prevented, and water saved are tracked and shown in your dashboard.' },
  ];

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 animate-fadeIn space-y-8`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        ← Back to Dashboard
      </button>

      {/* Hero */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          About ResQ Meal
        </h2>
        <p className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          Turning surplus into sustenance.
        </p>
        <p className={`mt-2 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          ResQ Meal is a full-stack platform that connects donors, NGOs, and volunteers to redistribute surplus food—reducing waste and fighting hunger. Post food, get matched, track delivery, and see your impact.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          Our mission
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          To ensure good food reaches people, not landfills. We help restaurants and donors post surplus, match it with NGOs in need, and track delivery so every meal counts.
        </p>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          Our vision
        </h3>
        <p className={darkMode ? 'text-blue-100' : 'text-slate-700'}>
          A world where surplus food is routinely rescued, shared, and measured—reducing hunger and environmental impact in every community we serve.
        </p>
      </div>

      {/* How it works */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          How it works
        </h3>
        <ul className="space-y-4">
          {steps.map(({ step, title, body }) => (
            <li key={step} className={`flex gap-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                darkMode ? 'bg-amber-600/40 text-amber-300' : 'bg-blue-100 text-blue-700'
              }`}>
                {step}
              </span>
              <div>
                <span className="font-semibold">{title}</span> — {body}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Website features */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          Website features & details
        </h3>
        <p className={`mb-6 text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>
          ResQ Meal includes the following features to support donors, NGOs, and volunteers:
        </p>
        <ul className="space-y-4">
          {aboutFeatures.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className={`flex gap-4 p-4 rounded-xl ${
                darkMode ? 'bg-slate-700/30' : 'bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${darkMode ? 'text-amber-400' : 'text-blue-600'}`} />
              <div>
                <h4 className={`font-semibold mb-1 ${darkMode ? 'text-yellow-200' : 'text-slate-900'}`}>{title}</h4>
                <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Technology */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-slate-800/50 border-amber-600/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          Technology & AI
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          The Fresh Food Checker uses optional ML models for quality and freshness: image-based (e.g. Bedrock/Claude Vision, TFLite, Roboflow YOLO, FreshVision, Food-101 classification) and environment-based (temperature, humidity, storage time). Food-Image-Recognition can classify dishes and return nutrition. All of this helps donors and NGOs trust that surplus food is safe to redistribute.
        </p>
      </div>

      {/* Get involved */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-50 border-amber-200'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
          Get involved
        </h3>
        <p className={darkMode ? 'text-blue-100' : 'text-amber-900/90'}>
          Post surplus as a donor, request matches as an NGO, or sign up as a volunteer to deliver. Use the Dashboard, Donor, NGO, and Report sections to get started. For support or partnerships, reach out through your account or settings.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
