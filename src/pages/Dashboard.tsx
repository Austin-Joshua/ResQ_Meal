import React, { useState } from 'react';
import { Menu, X, Settings as SettingsIcon, Moon, Sun, Globe, ArrowRight, TrendingUp, Users, MapPin, Clock, Shield, BarChart3, Home, Send, Target, Zap, Leaf, Truck, Bell, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PostSurplusPage from './PostSurplus';

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
  },
};

export const Dashboard: React.FC<DashboardProps> = ({ onSettingsClick, darkMode, setDarkMode, language, setLanguage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<'dashboard' | 'post' | 'matches' | 'impact' | 'feature'>('dashboard');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const t = translations[language];

  const features = [
    { id: 'post', icon: '📤', label: 'Post Food', color: 'from-emerald-500 to-emerald-600' },
    { id: 'matches', icon: '🎯', label: 'Matches', color: 'from-yellow-500 to-yellow-600' },
    { id: 'impact', icon: '🌍', label: 'Impact', color: 'from-blue-600 to-blue-700' },
  ];

  const navigationItems = [
    { id: 'dashboard', icon: '🏠', label: t.dashboard, color: '#10B981' },
    { id: 'post', icon: '📤', label: t.postSurplus, color: '#F59E0B' },
    { id: 'matches', icon: '🎯', label: t.myMatches, color: '#1D72F5' },
    { id: 'impact', icon: '📊', label: t.impact, color: '#10B981' },
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
        : 'bg-gradient-to-br from-blue-50 via-emerald-50 to-yellow-50'
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
                  : 'hover:bg-blue-200 text-blue-700'
              }`}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="text-3xl">🌱</div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>ResQ Meal</h1>
                <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Food Rescue Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <div className="flex items-center gap-1 rounded-lg p-1" style={{
              backgroundColor: darkMode ? 'rgba(217, 119, 6, 0.15)' : 'rgba(59, 130, 246, 0.15)'
            }}>
              {(['en', 'ta', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                    language === lang
                      ? darkMode
                        ? 'bg-yellow-500 text-slate-900'
                        : 'bg-blue-600 text-white'
                      : darkMode
                      ? 'text-yellow-200 hover:text-yellow-300'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-yellow-900/40 text-yellow-300'
                  : 'hover:bg-blue-200 text-blue-700'
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
                  : 'hover:bg-blue-200 text-blue-700'
              }`}
              title="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 transition-all duration-300 transform overflow-y-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-gradient-to-b from-slate-900 to-blue-950/80 border-r border-yellow-600/20' 
          : 'bg-gradient-to-b from-blue-50 to-emerald-50/80 border-r border-blue-200/50'
      } backdrop-blur-lg z-30`}>
        <nav className="p-6 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id as any);
                  setSidebarOpen(false);
                  setSelectedFeature(null);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activePage === item.id && !selectedFeature
                    ? darkMode
                      ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/20 shadow-lg border border-yellow-500/40'
                      : 'bg-gradient-to-r from-blue-400/30 to-emerald-400/20 shadow-md border border-blue-400/40'
                    : darkMode
                    ? 'hover:bg-yellow-900/20 text-blue-100'
                    : 'hover:bg-blue-200/30 text-blue-800'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className={`font-semibold transition-all duration-200 ${
                  activePage === item.id && !selectedFeature
                    ? darkMode ? 'text-yellow-300' : 'text-blue-700'
                    : darkMode ? 'text-blue-200' : 'text-slate-700'
                }`}>
                  {item.label}
                </span>
                {activePage === item.id && !selectedFeature && (
                  <ArrowRight className={`w-4 h-4 ml-auto ${darkMode ? 'text-yellow-300' : 'text-blue-600'}`} />
                )}
              </button>
            ))}
          </div>

          {/* Features Section */}
          <div className="pt-6 border-t" style={{
            borderColor: darkMode ? 'rgba(217, 119, 6, 0.3)' : 'rgba(59, 130, 246, 0.3)'
          }}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 px-2 ${
              darkMode ? 'text-yellow-400' : 'text-blue-700'
            }`}>
              {t.features}
            </h3>
            <div className="space-y-2">
              {menuFeatures.map((feature, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedFeature(feature.id);
                    setActivePage('feature');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer text-left ${
                    selectedFeature === feature.id
                      ? darkMode
                        ? 'bg-yellow-500/30 border border-yellow-500/50'
                        : 'bg-blue-400/20 border border-blue-400/50'
                      : darkMode
                      ? 'hover:bg-yellow-900/20 text-blue-100'
                      : 'hover:bg-blue-200/20 text-slate-700'
                  }`}
                  style={{ color: selectedFeature === feature.id ? feature.color : 'inherit' }}
                >
                  {feature.icon}
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
                      {feature.label}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-blue-300/60' : 'text-slate-600'}`}>
                      {feature.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'md:ml-64' : ''} transition-all duration-300`}>
        {/* Dashboard Page */}
        {activePage === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
            {/* Welcome Card */}
            <div className={`rounded-2xl p-8 transition-all duration-300 border ${
              darkMode
                ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
                : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
            }`}>
              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
                {t.welcome}
              </h2>
              <p className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                {t.missionToday}
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActivePage(feature.id as any)}
                  className={`group rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden border ${
                    darkMode ? 'shadow-xl border-yellow-600/20' : 'shadow-lg border-blue-300/30'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className="text-5xl mb-3">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.label}</h3>
                    <p className="text-white/80 text-sm">Get started now</p>
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
                      : `bg-gradient-to-br ${stat.color} border-blue-300/50 shadow-md`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
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
                ? 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-yellow-600/30 shadow-xl'
                : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-yellow-300' : 'text-blue-700'
                }`}>
                  <TrendingUp className="w-6 h-6" />
                  {t.weeklyTrend}
                </h3>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e3a8a' : '#bfdbfe'} />
                    <XAxis dataKey="date" stroke={darkMode ? '#93c5fd' : '#1e40af'} />
                    <YAxis stroke={darkMode ? '#93c5fd' : '#1e40af'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#eff6ff',
                        border: darkMode ? '2px solid #fbbf24' : '2px solid #1e40af',
                        borderRadius: '8px',
                        color: darkMode ? '#fbbf24' : '#1e40af',
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

export default Dashboard;
