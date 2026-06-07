import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, TrendingUp, Users, MapPin, Clock, Shield, BarChart3, Home, Send, Target, Zap, Leaf, Truck, Bell, Heart, FileText, Info, Crown, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppShell } from '@/components/AppShell';
import { AvailableFoodCarousel } from '@/components/AvailableFoodCarousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FreshFoodChecker } from '@/components/FreshFoodChecker';
import { AppLogo } from '@/components/AppLogo';
import { useLanguage } from '@/context/LanguageContext';
import { NATIVE_LANGUAGE_LABELS } from '@/lib/utils';
import { AboutPage } from '@/components/dashboard/AboutPage';
import { CardPucId, PAGE_ID_TO_PATH, pickRandomTip } from '@/components/dashboard/dashboardConstants';
import { EliteModePage } from '@/components/dashboard/EliteModePage';
import { FeatureDetailsPage } from '@/components/dashboard/FeatureDetailsPage';
import { ImpactPage } from '@/components/dashboard/ImpactPage';
import { MatchesPage } from '@/components/dashboard/MatchesPage';
import { StatDetailPage } from '@/components/dashboard/StatDetailPage';

interface DashboardProps {
  onSettingsClick: () => void;
  auth?: { name: string; email: string; role: string } | null;
  loginKey?: number;
  onOpenSignIn?: () => void;
  onLogout?: () => void;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  /** Current page from URL path (dashboard, freshness, matches, elite, impact, about, settings) */
  currentPageFromPath?: string;
  /** When using URL routes, navigate to path when sidebar item is clicked */
  onNavigateToPath?: (path: string) => void;
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

export function Dashboard({
  onSettingsClick,
  auth = null,
  loginKey = 0,
  onOpenSignIn,
  onLogout,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  currentPageFromPath,
  onNavigateToPath,
}: DashboardProps) {
  type DashboardActivePage =
    | 'dashboard'
    | 'freshness'
    | 'matches'
    | 'impact'
    | 'feature'
    | 'about'
    | 'elite'
    | 'settings'
    | 'mealsSaved'
    | 'foodDiverted'
    | 'co2Prevented'
    | 'waterSaved';
  const [activePage, setActivePage] = useState<DashboardActivePage>(
    (currentPageFromPath as DashboardActivePage) || 'dashboard'
  );
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [, setSelectedStat] = useState<string | null>(null);
  const [cardPucOpen, setCardPucOpen] = useState<CardPucId | null>(null);
  const [didYouKnowTip, setDidYouKnowTip] = useState(() => pickRandomTip());
  const { t } = useLanguage();

  useEffect(() => {
    setDidYouKnowTip(pickRandomTip());
  }, [loginKey]);

  useEffect(() => {
    if (currentPageFromPath && ['dashboard', 'freshness', 'matches', 'impact', 'about', 'elite', 'settings', 'mealsSaved', 'foodDiverted', 'co2Prevented', 'waterSaved'].includes(currentPageFromPath)) {
      setActivePage(currentPageFromPath as typeof activePage);
    }
  }, [currentPageFromPath]);

  const goToDashboard = () => {
    if (onNavigateToPath) onNavigateToPath(PAGE_ID_TO_PATH.dashboard);
    else setActivePage('dashboard');
    setSelectedFeature(null);
  };
  const goToImpact = () => {
    if (onNavigateToPath) onNavigateToPath(PAGE_ID_TO_PATH.impact);
    else setActivePage('impact');
  };
  
  const goToStatDetail = (statId: string) => {
    if (onNavigateToPath) {
      onNavigateToPath(PAGE_ID_TO_PATH[statId] || PAGE_ID_TO_PATH.impact);
    } else {
      setActivePage(statId as any);
    }
  };

  const features = [
    { id: 'freshness', icon: '🔬', label: t('freshnessChecker'), color: 'from-emerald-600 to-emerald-700' },
    { id: 'matches', icon: '🎯', label: 'Matches', color: 'from-yellow-500 to-yellow-600' },
    { id: 'impact', icon: '🌍', label: 'Impact', color: 'from-blue-600 to-blue-700' },
  ];


  const navigationItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'freshness', icon: Zap, label: t('freshnessChecker') },
    { id: 'matches', icon: Users, label: t('ngo') },
    { id: 'elite', icon: Crown, label: t('eliteMode') },
    { id: 'impact', icon: FileText, label: t('report') },
    { id: 'about', icon: Info, label: t('aboutUs') },
    { id: 'settings', icon: SettingsIcon, label: t('settings') },
  ];

  const menuFeatures = [
    { id: 'oneClick', icon: <Send className="w-5 h-5" />, label: t('oneClickPosting'), color: '#10B981', desc: 'Post surplus food in seconds' },
    { id: 'smartMatch', icon: <Target className="w-5 h-5" />, label: t('smartMatching'), color: '#F59E0B', desc: 'AI-powered NGO matching' },
    { id: 'foodTimer', icon: <Zap className="w-5 h-5" />, label: t('foodSafetyTimer'), color: '#1D72F5', desc: 'Real-time expiry countdown' },
    { id: 'liveTrack', icon: <Truck className="w-5 h-5" />, label: t('liveDeliveryTrack'), color: '#10B981', desc: 'Track deliveries live' },
    { id: 'notify', icon: <Bell className="w-5 h-5" />, label: t('notifications'), color: '#F59E0B', desc: 'Donation alerts & thanks' },
    { id: 'impact', icon: <Heart className="w-5 h-5" />, label: t('impactMeter'), color: '#1D72F5', desc: 'View environmental impact' },
    { id: 'carbon', icon: <Leaf className="w-5 h-5" />, label: t('carbonSaved'), color: '#10B981', desc: 'CO₂ reduction statistics' },
    { id: 'verify', icon: <Shield className="w-5 h-5" />, label: t('verification'), color: '#F59E0B', desc: 'Food quality verification' },
  ];

  return (
    <AppShell
      title="ResQ Meal"
      logo={<AppLogo size="header" className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[260px]" />}
      onLogoClick={() => {
        if (onNavigateToPath) onNavigateToPath('/Dashboard');
        else setActivePage('dashboard');
        setSelectedFeature(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      sidebarItems={navigationItems}
      activeId={activePage}
      onNavigate={(id) => {
        if (id === 'settings') {
          onSettingsClick();
          if (onNavigateToPath) onNavigateToPath(PAGE_ID_TO_PATH.settings);
        } else {
          if (onNavigateToPath && PAGE_ID_TO_PATH[id]) onNavigateToPath(PAGE_ID_TO_PATH[id]);
          else setActivePage(id as typeof activePage);
          setSelectedFeature(null);
        }
      }}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      languageLabels={NATIVE_LANGUAGE_LABELS}
      user={auth ?? undefined}
      onLogout={onLogout}
      onSettingsClick={onSettingsClick}
      onSignIn={onOpenSignIn}
    >
        {/* Dashboard Page – consistent max-width and text alignment */}
        {activePage === 'dashboard' && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
            {/* Welcome Card – green tint to match app shell */}
            <div className={`rounded-2xl p-6 md:p-8 transition-all duration-300 border text-left ${
              darkMode
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-[#D4AF37]/30 shadow-xl'
                : 'bg-white border-blue-200 shadow-sm shadow-blue-900/5'
            }`}>
              <h2 className={`text-4xl md:text-5xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {auth?.name ? t('welcomeBackWithName').replace('{{name}}', auth.name) : t('welcome')}
              </h2>
              <p className={`text-lg font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {t('missionToday')}
              </p>
            </div>

            {/* Quick Actions – left-aligned, dark blue with gold accents */}
            <div className={`rounded-xl p-4 transition-all duration-300 border text-left ${
              darkMode ? 'bg-blue-900/30 border-[#D4AF37]/25' : 'bg-white border-blue-200 shadow-sm shadow-blue-900/5'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
                {t('quickActions')}
              </h3>
              <div className="flex flex-wrap gap-2 justify-start">
                <button
                  onClick={() => onNavigateToPath ? onNavigateToPath(PAGE_ID_TO_PATH.matches) : setActivePage('matches')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  <Target className="w-3 h-3" /> {t('viewMatches')}
                </button>
                <button
                  onClick={() => onNavigateToPath ? onNavigateToPath(PAGE_ID_TO_PATH.impact) : setActivePage('impact')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-teal-600/30 text-teal-300 hover:bg-teal-600/50' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  <BarChart3 className="w-3 h-3" /> {t('seeImpact')}
                </button>
              </div>
            </div>

            {/* Today's Available Food – carousel (day nav + plate + info card) */}
            <AvailableFoodCarousel
              darkMode={darkMode}
              title={t('availableFood')}
              searchPlaceholder={t('searchFood')}
            />

            {/* Today's Activity + Pending / Active – touch/click opens dedicated PUC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                type="button"
                onClick={() => setCardPucOpen('activity')}
                className={`rounded-2xl p-6 transition-all duration-300 border text-left cursor-pointer touch-manipulation hover:ring-2 hover:ring-[#D4AF37]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] active:scale-[0.99] ${
                  darkMode ? 'bg-blue-900/30 border-[#D4AF37]/25' : 'bg-white border-blue-200 shadow-sm shadow-blue-900/5'
                }`}
                aria-label={`${t('recentActivity')}. Tap for details`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
                  <Clock className="w-4 h-4 shrink-0" /> {t('recentActivity')}
                </h3>
                <ul className={`space-y-3 text-sm text-left ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  <li className="flex items-center gap-2 text-left">
                    <span className="shrink-0" aria-hidden>✓</span>
                    <span>2 {t('postsMatchedToday')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-left">
                    <span className="shrink-0" aria-hidden>✓</span>
                    <span>1 {t('deliveryCompleted')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-left">
                    <span className="shrink-0" aria-hidden>○</span>
                    <span>1 {t('matchAwaiting')}</span>
                  </li>
                </ul>
              </button>
              <button
                type="button"
                onClick={() => setCardPucOpen('help')}
                className={`rounded-2xl p-6 transition-all duration-300 border text-left cursor-pointer touch-manipulation hover:ring-2 hover:ring-[#D4AF37]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] active:scale-[0.99] ${
                  darkMode ? 'bg-blue-900/30 border-[#D4AF37]/25' : 'bg-white border-blue-200 shadow-sm shadow-blue-900/5'
                }`}
                aria-label={`${t('howYouCanHelp')}. Tap for details`}
              >
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
                  {t('howYouCanHelp')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl text-left ${darkMode ? 'bg-amber-600/20' : 'bg-amber-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>3</p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>{t('pendingMatches')}</p>
                  </div>
                  <div className={`p-4 rounded-xl text-left ${darkMode ? 'bg-[#D4AF37]/20' : 'bg-blue-50'}`}>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-[#D4AF37]' : 'text-blue-700'}`}>1</p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>{t('activeDeliveries')}</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Did you know tip – left-aligned, dark blue with gold accents */}
            <div className={`rounded-xl p-4 transition-all duration-300 border text-left ${
              darkMode ? 'bg-blue-900/25 border-[#D4AF37]/30' : 'bg-blue-50/80 border-blue-200'
            }`}>
              <p className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                <Leaf className="w-4 h-4 shrink-0" /> {t('didYouKnow')}
              </p>
              <p className={`text-sm mt-2 pl-6 ${darkMode ? 'text-slate-200' : 'text-amber-900/90'}`}>
                {didYouKnowTip}
              </p>
            </div>

            {/* Needed food areas – map – text left-aligned, dark blue with gold accents */}
            <div className={`rounded-2xl overflow-hidden transition-all duration-300 border text-left ${
              darkMode ? 'bg-blue-900/30 border-[#D4AF37]/25' : 'bg-white border-blue-200 shadow-sm shadow-blue-900/5'
            }`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider px-4 py-3 flex items-center gap-2 border-b ${
                darkMode ? 'text-[#D4AF37] border-blue-800/30' : 'text-slate-600 border-slate-100'
              }`}>
                <MapPin className="w-4 h-4 shrink-0" /> {t('neededFoodMap')}
              </h3>
              <div className="relative w-full aspect-[16/9] min-h-[320px] max-h-[50vh] bg-slate-100">
                <iframe
                  title="Needed food areas map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497512.457502766!2d79.5!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265ea4f7d3361%3A0x50e27e77c60c6d4a!2sChennai%2C%20Tamil%20Nadu%2C%20India!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className={`text-sm px-4 py-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                View areas where surplus food is needed. Zoom and pan to explore.
              </p>
            </div>

            {/* Feature Cards Grid – text left-aligned */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => onNavigateToPath && PAGE_ID_TO_PATH[feature.id] ? onNavigateToPath(PAGE_ID_TO_PATH[feature.id]) : setActivePage(feature.id as any)}
                  className={`group relative rounded-2xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer overflow-hidden border text-left touch-manipulation min-h-[140px] sm:min-h-[160px] ${
                    darkMode
                      ? 'shadow-xl border-[#D4AF37]/25 bg-gradient-to-br from-blue-900/50 to-blue-950/60'
                      : 'shadow-lg border-blue-200/60 bg-gradient-to-br from-white to-blue-100'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative text-left">
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{feature.icon}</div>
                    <h3
                      className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                        darkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {feature.label}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm ${
                        darkMode ? 'text-blue-100/80' : 'text-slate-700'
                      }`}
                    >
                      {t('getStartedNow')}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Stats Grid – text left-aligned */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[
                { id: 'mealsSaved', icon: '🍽️', label: t('mealsSaved'), value: '3,450', color: 'from-blue-500/30 to-blue-600/30', border: 'blue' },
                { id: 'foodDiverted', icon: '⚖️', label: t('foodDiverted'), value: '8,625 kg', color: 'from-blue-500/30 to-blue-600/30', border: 'blue' },
                { id: 'co2Prevented', icon: '💨', label: t('co2Prevented'), value: '21.5 tons', color: 'from-yellow-500/30 to-yellow-600/30', border: 'yellow' },
                { id: 'waterSaved', icon: '💧', label: t('waterSaved'), value: '8.6M L', color: 'from-cyan-500/30 to-cyan-600/30', border: 'cyan' },
              ].map((stat) => (
                <button
                  key={stat.id}
                  type="button"
                  onClick={() => {
                    setSelectedStat(stat.id);
                    if (onNavigateToPath) {
                      onNavigateToPath(PAGE_ID_TO_PATH[stat.id] || '/Report');
                    } else {
                      setActivePage(stat.id as any);
                    }
                  }}
                  className={`group rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 border cursor-pointer transform hover:scale-105 active:scale-95 text-left touch-manipulation min-h-[100px] sm:min-h-[120px] ${
                    darkMode
                      ? `bg-gradient-to-br ${stat.color} border-[#D4AF37]/30 shadow-lg hover:shadow-xl hover:border-[#D4AF37]`
                      : `bg-gradient-to-br ${stat.color} border-slate-300/50 shadow-md hover:shadow-lg hover:border-blue-400`
                  }`}
                  aria-label={`View detailed report for ${stat.label}`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                        {stat.value}
                      </p>
                      <p className={`text-[10px] sm:text-xs mt-2 opacity-0 group-hover:opacity-70 transition-opacity ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        Click to view detailed report →
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl opacity-50 group-hover:opacity-70 transition-opacity shrink-0" aria-hidden>{stat.icon}</span>
                  </div>
                </button>
              ))}
            </div>

{/* Chart Card – touch/click opens dedicated PUC */}
            <button
              type="button"
              onClick={() => setCardPucOpen('weeklyTrend')}
              className={`rounded-2xl p-8 transition-all duration-300 border text-left w-full cursor-pointer touch-manipulation hover:ring-2 hover:ring-[#D4AF37]/50 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] active:scale-[0.99] ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-[#D4AF37]/30 shadow-xl'
                  : 'bg-gradient-to-br from-slate-50 to-blue-50/15 border-slate-300/50 shadow-lg'
              }`}
              aria-label={`${t('weeklyTrend')}. Tap for details`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-yellow-300' : 'text-slate-900'
                }`}>
                  <TrendingUp className="w-6 h-6 shrink-0" />
                  {t('weeklyTrend')}
                </h3>
              </div>
              <div className="w-full h-80 pointer-events-none">
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
            </button>

            {/* Dedicated PUC (pop-up) when touching a card */}
            <Dialog open={cardPucOpen !== null} onOpenChange={(open) => !open && setCardPucOpen(null)}>
              <DialogContent className={darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {cardPucOpen === 'activity' && <><Clock className="w-5 h-5" /> {t('recentActivity')}</>}
                    {cardPucOpen === 'help' && <><Target className="w-5 h-5" /> {t('howYouCanHelp')}</>}
                    {cardPucOpen === 'weeklyTrend' && <><TrendingUp className="w-5 h-5" /> {t('weeklyTrend')}</>}
                  </DialogTitle>
                </DialogHeader>
                {cardPucOpen === 'activity' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Summary of today&apos;s activity. Respond to matches and track deliveries.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">✓ 2 {t('postsMatchedToday')}</li>
                      <li className="flex items-center gap-2">✓ 1 {t('deliveryCompleted')}</li>
                      <li className="flex items-center gap-2">○ 1 {t('matchAwaiting')}</li>
                    </ul>
                    <button
                      type="button"
                      onClick={() => { setCardPucOpen(null); setActivePage('matches'); }}
                      className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                    >
                      {t('viewMatches')}
                    </button>
                  </div>
                )}
                {cardPucOpen === 'help' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Quick overview of pending matches and active deliveries. Take action from here.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-600/20' : 'bg-amber-50'}`}>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">3</p>
                        <p className="text-xs font-medium">{t('pendingMatches')}</p>
                      </div>
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-[#D4AF37]/20' : 'bg-blue-50'}`}>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">1</p>
                        <p className="text-xs font-medium">{t('activeDeliveries')}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCardPucOpen(null); setActivePage('matches'); }}
                      className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                    >
                      {t('viewMatches')}
                    </button>
                  </div>
                )}
                {cardPucOpen === 'weeklyTrend' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Weekly trend of meals saved and CO₂ prevented. Green line: meals; orange line: CO₂ (kg).
                    </p>
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={impactData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#cbd5e1'} />
                          <XAxis dataKey="date" stroke={darkMode ? '#cbd5e1' : '#64748b'} fontSize={12} />
                          <YAxis stroke={darkMode ? '#cbd5e1' : '#64748b'} fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                              border: darkMode ? '2px solid #fbbf24' : '2px solid #64748b',
                              borderRadius: '8px',
                            }}
                          />
                          <Line type="monotone" dataKey="meals" stroke="#10b981" strokeWidth={2} name="Meals" dot={{ fill: '#10b981', r: 4 }} />
                          <Line type="monotone" dataKey="co2" stroke="#f59e0b" strokeWidth={2} name="CO₂" dot={{ fill: '#f59e0b', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCardPucOpen(null); setActivePage('impact'); }}
                      className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500"
                    >
                      {t('seeImpact')}
                    </button>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Social media links – end of home page */}
            <footer className={`mt-12 pt-8 pb-6 border-t rounded-b-2xl ${
              darkMode ? 'border-emerald-700/30' : 'border-slate-200'
            }`}>
              <p className={`text-sm font-semibold mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {t('followUs')}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl transition ${
                    darkMode ? 'text-slate-300 hover:bg-emerald-800/40 hover:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl transition ${
                    darkMode ? 'text-slate-300 hover:bg-emerald-800/40 hover:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="Twitter"
                >
                  <Twitter className="w-6 h-6" />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl transition ${
                    darkMode ? 'text-slate-300 hover:bg-emerald-800/40 hover:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl transition ${
                    darkMode ? 'text-slate-300 hover:bg-emerald-800/40 hover:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl transition ${
                    darkMode ? 'text-slate-300 hover:bg-emerald-800/40 hover:text-emerald-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </footer>
          </div>
        )}

        {/* Feature Details Page */}
        {activePage === 'feature' && selectedFeature && (
          <FeatureDetailsPage 
            feature={selectedFeature} 
            darkMode={darkMode} 
            onBack={goToDashboard}
            menuFeatures={menuFeatures}
            t={t}
          />
        )}

        {/* Freshness Food Checker (standalone) */}
        {activePage === 'freshness' && (
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
            <button
              type="button"
              onClick={goToDashboard}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                darkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
              }`}
            >
              {t('backToDashboard')}
            </button>
            <FreshFoodChecker darkMode={darkMode} />
          </div>
        )}

        {/* Matches Page */}
        {activePage === 'matches' && (
          <MatchesPage darkMode={darkMode} onBack={goToDashboard} t={t} />
        )}

        {/* Impact Page */}
        {activePage === 'impact' && (
          <ImpactPage
            darkMode={darkMode}
            onBack={goToDashboard}
            onStatClick={(statId) => goToStatDetail(statId)}
            t={t}
          />
        )}

        {/* About Us Page */}
        {activePage === 'about' && (
          <AboutPage darkMode={darkMode} onBack={goToDashboard} t={t} />
        )}

        {/* Elite Mode Page */}
        {activePage === 'elite' && (
          <EliteModePage darkMode={darkMode} onBack={goToDashboard} t={t} />
        )}

        {/* Stat Detail Pages */}
        {activePage === 'mealsSaved' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={goToImpact}
            stat={{
              id: 'mealsSaved',
              icon: '🍽️',
              label: t('mealsSaved'),
              value: '3,450',
              color: 'from-blue-500/30 to-blue-600/30',
            }}
            t={t}
            onNavigateToPath={onNavigateToPath}
          />
        )}

        {activePage === 'foodDiverted' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={goToImpact}
            stat={{
              id: 'foodDiverted',
              icon: '⚖️',
              label: t('foodDiverted'),
              value: '8,625 kg',
              color: 'from-blue-500/30 to-blue-600/30',
            }}
            t={t}
            onNavigateToPath={onNavigateToPath}
          />
        )}

        {activePage === 'co2Prevented' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={goToImpact}
            stat={{
              id: 'co2Prevented',
              icon: '💨',
              label: t('co2Prevented'),
              value: '21.5 tons',
              color: 'from-yellow-500/30 to-yellow-600/30',
            }}
            t={t}
            onNavigateToPath={onNavigateToPath}
          />
        )}

        {activePage === 'waterSaved' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={goToImpact}
            stat={{
              id: 'waterSaved',
              icon: '💧',
              label: t('waterSaved'),
              value: '8.6M L',
              color: 'from-cyan-500/30 to-cyan-600/30',
            }}
            t={t}
            onNavigateToPath={onNavigateToPath}
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
    </AppShell>
  );
};