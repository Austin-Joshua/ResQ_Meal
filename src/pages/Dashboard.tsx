import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Settings as SettingsIcon, Moon, Sun, Globe, ArrowRight, TrendingUp, Users, MapPin, Clock, Shield, BarChart3, Home, Send, Target, Zap, Leaf, Truck, Bell, Heart, ChevronDown, HeartHandshake, FileText, Info, Thermometer, User, Crown, LogOut, ShieldCheck, Navigation, Plus, Trash2, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppShell } from '@/components/AppShell';
import { AvailableFoodCarousel } from '@/components/AvailableFoodCarousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PostSurplusPage from './PostSurplus';
import { AppLogo } from '@/components/AppLogo';
import { useLanguage } from '@/context/LanguageContext';
import { NATIVE_LANGUAGE_LABELS } from '@/lib/utils';

type CardPucId = 'activity' | 'help' | 'weeklyTrend';

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
}

/** "Did you know?" facts – one is picked at random each time the user logs in */
const DID_YOU_KNOW_TIPS = [
  'Every 1 kg of food rescued saves ~2.5 kg CO₂ and helps feed someone in need.',
  'Roughly one third of food produced for human consumption is lost or wasted globally each year.',
  'Food waste in landfills produces methane, a greenhouse gas many times more potent than CO₂.',
  'Donating surplus food can reduce your organisation’s carbon footprint and support local communities.',
  'Rescuing just 10% of avoidable food waste could feed millions of people in need.',
  'Keeping surplus food in the “human consumption” loop saves water, energy, and land used to grow it.',
];

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

function pickRandomTip() {
  return DID_YOU_KNOW_TIPS[Math.floor(Math.random() * DID_YOU_KNOW_TIPS.length)];
}

export const Dashboard: React.FC<DashboardProps> = ({ onSettingsClick, auth = null, loginKey = 0, onOpenSignIn, onLogout, darkMode, setDarkMode, language, setLanguage }) => {
  const [activePage, setActivePage] = useState<'dashboard' | 'post' | 'matches' | 'impact' | 'feature' | 'about' | 'elite' | 'settings' | 'mealsSaved' | 'foodDiverted' | 'co2Prevented' | 'waterSaved'>('dashboard');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [cardPucOpen, setCardPucOpen] = useState<CardPucId | null>(null);
  const [didYouKnowTip, setDidYouKnowTip] = useState(() => pickRandomTip());
  const { t } = useLanguage();

  const user = auth ?? { name: 'Guest', email: '', role: 'guest', profilePhoto: null };

  useEffect(() => {
    setDidYouKnowTip(pickRandomTip());
  }, [loginKey]);

  const features = [
    { id: 'post', icon: '📤', label: 'Post Food', color: 'from-blue-600 to-blue-700' },
    { id: 'matches', icon: '🎯', label: 'Matches', color: 'from-yellow-500 to-yellow-600' },
    { id: 'impact', icon: '🌍', label: 'Impact', color: 'from-blue-600 to-blue-700' },
  ];


  const navigationItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'post', icon: HeartHandshake, label: t('donor') },
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
        setActivePage('dashboard');
        setSelectedFeature(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      sidebarItems={navigationItems}
      activeId={activePage}
      onNavigate={(id) => {
        if (id === 'settings') onSettingsClick();
        else { setActivePage(id as typeof activePage); setSelectedFeature(null); }
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
                {t('welcome')}{auth?.name && `, ${auth.name}`}!
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
                  onClick={() => setActivePage('post')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/50' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  <Send className="w-3 h-3" /> {t('postFoodNow')}
                </button>
                <button
                  onClick={() => setActivePage('matches')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-amber-600/30 text-amber-300 hover:bg-amber-600/50' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  <Target className="w-3 h-3" /> {t('viewMatches')}
                </button>
                <button
                  onClick={() => setActivePage('impact')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                    darkMode ? 'bg-teal-600/30 text-teal-300 hover:bg-teal-600/50' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  }`}
                >
                  <BarChart3 className="w-3 h-3" /> {t('seeImpact')}
                </button>
                {onOpenSignIn && (
                  <button
                    type="button"
                    onClick={onOpenSignIn}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition ${
                      darkMode ? 'bg-slate-600/30 text-slate-300 hover:bg-slate-600/50 border border-slate-500/50' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title="Sign in as organisation / admin"
                  >
                    <ShieldCheck className="w-3 h-3" /> {t('adminOrg')}
                  </button>
                )}
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
                  onClick={() => setActivePage(feature.id as any)}
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
                    setActivePage(stat.id as any);
                  }}
                  className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 border cursor-pointer transform hover:scale-105 active:scale-95 text-left touch-manipulation min-h-[100px] sm:min-h-[120px] ${
                    darkMode
                      ? `bg-gradient-to-br ${stat.color} border-[#D4AF37]/30 shadow-lg hover:shadow-xl`
                      : `bg-gradient-to-br ${stat.color} border-slate-300/50 shadow-md hover:shadow-lg`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <span className="text-2xl sm:text-3xl md:text-4xl opacity-50 shrink-0" aria-hidden>{stat.icon}</span>
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
            onBack={() => setActivePage('dashboard')}
            menuFeatures={menuFeatures}
            t={t}
          />
        )}

        {/* Post Surplus Page */}
        {activePage === 'post' && (
          <PostSurplusPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} />
        )}

        {/* Matches Page */}
        {activePage === 'matches' && (
          <MatchesPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} t={t} />
        )}

        {/* Impact Page */}
        {activePage === 'impact' && (
          <ImpactPage
            darkMode={darkMode}
            onBack={() => setActivePage('dashboard')}
            onStatClick={(statId) => setActivePage(statId)}
            t={t}
          />
        )}

        {/* About Us Page */}
        {activePage === 'about' && (
          <AboutPage darkMode={darkMode} onBack={() => setActivePage('dashboard')} t={t} />
        )}

        {/* Elite Mode Page */}
        {activePage === 'elite' && (
          <EliteModePage darkMode={darkMode} onBack={() => setActivePage('dashboard')} t={t} />
        )}

        {/* Stat Detail Pages */}
        {activePage === 'mealsSaved' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={() => setActivePage('impact')}
            stat={{
              id: 'mealsSaved',
              icon: '🍽️',
              label: t('mealsSaved'),
              value: '3,450',
              color: 'from-blue-500/30 to-blue-600/30',
            }}
            t={t}
          />
        )}

        {activePage === 'foodDiverted' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={() => setActivePage('impact')}
            stat={{
              id: 'foodDiverted',
              icon: '⚖️',
              label: t('foodDiverted'),
              value: '8,625 kg',
              color: 'from-blue-500/30 to-blue-600/30',
            }}
            t={t}
          />
        )}

        {activePage === 'co2Prevented' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={() => setActivePage('impact')}
            stat={{
              id: 'co2Prevented',
              icon: '💨',
              label: t('co2Prevented'),
              value: '21.5 tons',
              color: 'from-yellow-500/30 to-yellow-600/30',
            }}
            t={t}
          />
        )}

        {activePage === 'waterSaved' && (
          <StatDetailPage
            darkMode={darkMode}
            onBack={() => setActivePage('impact')}
            stat={{
              id: 'waterSaved',
              icon: '💧',
              label: t('waterSaved'),
              value: '8.6M L',
              color: 'from-cyan-500/30 to-cyan-600/30',
            }}
            t={t}
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

// Feature Details Page Component
const FeatureDetailsPage: React.FC<{ feature: string; darkMode: boolean; onBack: () => void; menuFeatures: any[]; t: any }> = ({ feature, darkMode, onBack, menuFeatures, t }) => {
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
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
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
            ? 'bg-gradient-to-br from-emerald-900/35 to-blue-900/45 border-emerald-600/30 shadow-lg'
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
            ? 'bg-gradient-to-br from-emerald-900/35 to-blue-900/45 border-emerald-600/30 shadow-lg'
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
type MatchTab = 'all' | 'pending' | 'accepted' | 'in_delivery' | 'completed';
const MATCH_TAB_STATUSES: Record<MatchTab, string[]> = {
  all: [],
  pending: ['MATCHED'],
  accepted: ['ACCEPTED'],
  in_delivery: ['PICKED_UP', 'IN_TRANSIT'],
  completed: ['DELIVERED'],
};

type MatchItem = {
  id: number;
  foodName: string;
  ngo: string;
  org: string;
  address: string;
  distance: string;
  status: string;
  meals: number;
  donation: string;
  minTemp?: number;
  maxTemp?: number;
  availabilityHours?: number;
};

const INITIAL_MATCHES: MatchItem[] = [
  {
    id: 1,
    foodName: 'Fresh Grilled Vegetables',
    ngo: 'Save Children NGO',
    org: 'Registered NGO - License #NGO2024001',
    address: 'Save Children NGO, Downtown, Chennai',
    distance: '1.2 km',
    status: 'MATCHED',
    meals: 25,
    donation: '₹5,000 equivalent',
    minTemp: 0,
    maxTemp: 10,
    availabilityHours: 48,
  },
  {
    id: 2,
    foodName: 'Cooked Pasta Dishes',
    ngo: 'Community Kitchen',
    org: 'Community Food Bank - Est. 2015',
    address: 'Community Kitchen, Midtown, Chennai',
    distance: '2.5 km',
    status: 'MATCHED',
    meals: 40,
    donation: '₹8,000 equivalent',
    minTemp: 4,
    maxTemp: 60,
    availabilityHours: 4,
  },
  {
    id: 3,
    foodName: 'Boiled eggs + apple shake',
    ngo: 'Homeless Shelter',
    org: 'City Shelter - Est. 2010',
    address: 'Homeless Shelter, City Center, Chennai',
    distance: '0.8 km',
    status: 'MATCHED',
    meals: 12,
    donation: '₹2,500 equivalent',
    minTemp: 4,
    maxTemp: 60,
    availabilityHours: 2,
  },
  {
    id: 4,
    foodName: 'Bread and pastries',
    ngo: 'School Meals Program',
    org: 'Education Trust - Est. 2018',
    address: 'School Meals Program, Education District, Chennai',
    distance: '3.1 km',
    status: 'MATCHED',
    meals: 50,
    donation: '₹6,000 equivalent',
    minTemp: 0,
    maxTemp: 25,
    availabilityHours: 24,
  },
  {
    id: 5,
    foodName: 'Biryani & Raita',
    ngo: 'Food for All Foundation',
    org: 'Registered NGO - License #NGO2024002',
    address: 'Food for All Foundation, Anna Nagar, Chennai',
    distance: '1.8 km',
    status: 'MATCHED',
    meals: 30,
    donation: '₹7,500 equivalent',
    minTemp: 4,
    maxTemp: 55,
    availabilityHours: 3,
  },
  {
    id: 6,
    foodName: 'Mixed Fruit Platter',
    ngo: 'Health Care Initiative',
    org: 'Health Trust - Est. 2012',
    address: 'Health Care Initiative, Adyar, Chennai',
    distance: '2.2 km',
    status: 'MATCHED',
    meals: 20,
    donation: '₹4,000 equivalent',
    minTemp: 2,
    maxTemp: 8,
    availabilityHours: 6,
  },
  {
    id: 7,
    foodName: 'Curd Rice & Sambar',
    ngo: 'Elder Care Center',
    org: 'Senior Support NGO - Est. 2008',
    address: 'Elder Care Center, Mylapore, Chennai',
    distance: '1.5 km',
    status: 'MATCHED',
    meals: 35,
    donation: '₹5,500 equivalent',
    minTemp: 4,
    maxTemp: 60,
    availabilityHours: 2,
  },
  {
    id: 8,
    foodName: 'Croissants & Danish Pastries',
    ngo: 'Morning Meals Program',
    org: 'Breakfast Initiative - Est. 2019',
    address: 'Morning Meals Program, T Nagar, Chennai',
    distance: '2.8 km',
    status: 'MATCHED',
    meals: 18,
    donation: '₹4,500 equivalent',
    minTemp: 15,
    maxTemp: 25,
    availabilityHours: 4,
  },
  {
    id: 9,
    foodName: 'Fresh Paneer & Milk Sweets',
    ngo: 'Dairy Distribution Network',
    org: 'Dairy Trust - Est. 2016',
    address: 'Dairy Distribution Network, Velachery, Chennai',
    distance: '3.5 km',
    status: 'MATCHED',
    meals: 15,
    donation: '₹3,500 equivalent',
    minTemp: 2,
    maxTemp: 6,
    availabilityHours: 12,
  },
  {
    id: 10,
    foodName: 'Stir-fried Greens & Beans',
    ngo: 'Vegetable Rescue Program',
    org: 'Green Initiative - Est. 2020',
    address: 'Vegetable Rescue Program, Egmore, Chennai',
    distance: '1.0 km',
    status: 'MATCHED',
    meals: 22,
    donation: '₹4,200 equivalent',
    minTemp: 4,
    maxTemp: 50,
    availabilityHours: 2,
  },
  {
    id: 11,
    foodName: 'Sandwiches & Wraps',
    ngo: 'Quick Meals Foundation',
    org: 'Fast Food Rescue - Est. 2021',
    address: 'Quick Meals Foundation, OMR, Chennai',
    distance: '4.2 km',
    status: 'MATCHED',
    meals: 28,
    donation: '₹5,200 equivalent',
    minTemp: 4,
    maxTemp: 25,
    availabilityHours: 4,
  },
  {
    id: 12,
    foodName: 'Bananas & Seasonal Fruits',
    ngo: 'Fruit Distribution Network',
    org: 'Fruit Trust - Est. 2017',
    address: 'Fruit Distribution Network, Porur, Chennai',
    distance: '3.8 km',
    status: 'MATCHED',
    meals: 45,
    donation: '₹6,500 equivalent',
    minTemp: 10,
    maxTemp: 25,
    availabilityHours: 24,
  },
];

const MatchesPage: React.FC<{ darkMode: boolean; onBack: () => void; t: any }> = ({ darkMode, onBack, t }) => {
  const [activeTab, setActiveTab] = useState<MatchTab>('all');
  const [matches, setMatches] = useState<MatchItem[]>(INITIAL_MATCHES);

  const openMapsWithDirections = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleAccept = (match: MatchItem) => {
    setMatches((prev) => prev.map((m) => (m.id === match.id ? { ...m, status: 'ACCEPTED' } : m)));
  };

  const handleDecline = (matchId: number) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  const tabLabels: { id: MatchTab; label: string }[] = [
    { id: 'all', label: t('allMatches') },
    { id: 'pending', label: t('matchPending') },
    { id: 'accepted', label: t('matchAccepted') },
    { id: 'in_delivery', label: t('matchInDelivery') },
    { id: 'completed', label: t('matchCompleted') },
  ];

  const filteredMatches = activeTab === 'all'
    ? matches
    : matches.filter((m) => MATCH_TAB_STATUSES[activeTab].includes(m.status));

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      <div className={`rounded-2xl p-8 mb-6 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          🎯 {t('yourMatches')}
        </h2>
        <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
          {t('seeWhichNGOs')}
        </p>
      </div>

      {/* Match status tabs */}
      <div className={`flex flex-wrap gap-2 mb-4 sm:mb-6 rounded-xl p-2 border ${
        darkMode ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-100 border-slate-200'
      }`}>
        {tabLabels.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition touch-manipulation min-h-[36px] sm:min-h-[40px] ${
              activeTab === tab.id
                ? darkMode
                  ? 'bg-amber-600/50 text-amber-200'
                  : 'bg-amber-200 text-amber-900'
                : darkMode
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700 active:bg-slate-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 border ${
              darkMode
                ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-600/30 shadow-xl'
                : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg'
            }`}
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {match.foodName}
                </h3>
                <p className={`text-xs sm:text-sm font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Organization: {match.ngo}
                </p>
                <div className="flex items-center gap-1.5">
                  <FileText className={`w-3 h-3 shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                  <p className={`text-xs truncate ${darkMode ? 'text-blue-300/80' : 'text-slate-600'}`}>
                    {match.org}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold text-xs sm:text-sm ${
                  match.status === 'MATCHED'
                    ? darkMode ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-100 text-blue-700'
                    : darkMode ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {match.status}
                </span>
              </div>
            </div>

            {/* First Row: Distance, Meals, Donation Value */}
            <div className={`grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b ${darkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <MapPin className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>Distance</p>
                </div>
                <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{match.distance}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <span className="text-base sm:text-lg">🍽️</span>
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>meals</p>
                </div>
                <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{match.meals}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                  <span className="text-base sm:text-lg">💰</span>
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>Donation Value</p>
                </div>
                <p className={`text-sm sm:text-base font-bold truncate ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>{match.donation}</p>
              </div>
            </div>

            {/* Second Row: Storage Temperature, Available For */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b ${darkMode ? 'border-blue-600/30' : 'border-blue-200'}`}>
              {match.minTemp !== undefined && match.maxTemp !== undefined && (
                <div>
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                    <Thermometer className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-slate-600'}`}>Storage Temperature</p>
                  </div>
                  <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                    {match.minTemp}°C - {match.maxTemp}°C
                  </p>
                </div>
              )}
              {match.availabilityHours !== undefined && (
                <div>
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                    <Clock className={`w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                    <p className={`text-xs ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>Available For</p>
                  </div>
                  <p className={`text-sm sm:text-base font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
                    {match.availabilityHours} hours
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {match.status === 'MATCHED' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAccept(match)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    <span className="text-base sm:text-lg">✓</span>
                    {t('accept')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(match.id)}
                    className={`flex-1 border-2 font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px] ${
                      darkMode
                        ? 'border-blue-400 bg-white/10 text-red-400 hover:bg-white/20 active:bg-white/30'
                        : 'border-blue-300 bg-white text-red-600 hover:bg-red-50 active:bg-red-100'
                    }`}
                  >
                    <span className="text-base sm:text-lg">✕</span>
                    {t('decline')}
                  </button>
                </>
              ) : (match.status === 'ACCEPTED' || match.status === 'PICKED_UP' || match.status === 'IN_TRANSIT') && match.address ? (
                <>
                  <button
                    type="button"
                    onClick={() => openMapsWithDirections(match.address)}
                    className={`flex-1 border-2 font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px] ${
                      darkMode
                        ? 'border-emerald-500 bg-white/10 text-emerald-300 hover:bg-white/20 active:bg-white/30'
                        : 'border-emerald-500 bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    {t('viewOnMap')}
                  </button>
                  <button
                    type="button"
                    onClick={() => openMapsWithDirections(match.address)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 sm:py-3.5 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px]"
                  >
                    <Navigation className="w-4 h-4" />
                    {t('startTravel')}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Impact Page Component – cards open separate result (StatDetail) page when clicked
type ImpactStatId = 'mealsSaved' | 'foodDiverted' | 'co2Prevented' | 'waterSaved';
const ImpactPage: React.FC<{
  darkMode: boolean;
  onBack: () => void;
  onStatClick?: (statId: ImpactStatId) => void;
  t: any;
}> = ({ darkMode, onBack, onStatClick, t }) => {
  const impactStats: { id: ImpactStatId; icon: string; label: string; value: string; color: string; border: string }[] = [
    { id: 'mealsSaved', icon: '🍽️', label: t('mealsSaved'), value: '3,450', color: 'from-emerald-500/30 to-emerald-600/30', border: 'emerald' },
    { id: 'foodDiverted', icon: '⚖️', label: t('foodDiverted'), value: '8,625 kg', color: 'from-blue-500/30 to-blue-600/30', border: 'blue' },
    { id: 'co2Prevented', icon: '💨', label: t('co2Prevented'), value: '21.5 tons', color: 'from-yellow-500/30 to-yellow-600/30', border: 'yellow' },
    { id: 'waterSaved', icon: '💧', label: t('waterSaved'), value: '8.6M L', color: 'from-cyan-500/30 to-cyan-600/30', border: 'cyan' },
  ];
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          📊 {t('yourImpact')}
        </h2>
        <p className={darkMode ? 'text-blue-200' : 'text-blue-700'}>
          {t('seeHowMuch')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {impactStats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => {
              if (onStatClick) {
                onStatClick(stat.id);
              }
            }}
            className={`group rounded-2xl p-8 transition-all duration-300 border-2 text-left w-full cursor-pointer hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation ${
              darkMode
                ? `bg-gradient-to-br ${stat.color} border-[#D4AF37]/30 shadow-lg hover:border-[#D4AF37] hover:shadow-[#D4AF37]/20 focus:ring-[#D4AF37]`
                : `bg-gradient-to-br ${stat.color} border-blue-300/50 shadow-md hover:border-blue-500 hover:shadow-blue-500/20 focus:ring-blue-500`
            }`}
            aria-label={`View detailed report for ${stat.label}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  {stat.label}
                </p>
                <p className={`text-4xl font-bold mt-3 ${darkMode ? 'text-[#D4AF37]' : 'text-blue-700'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-4 opacity-70 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Click to view detailed report →
                </p>
              </div>
              <span className="text-5xl opacity-40 group-hover:opacity-60 transition-opacity">{stat.icon}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Elite registration: home address + list of foods (for "My registrations" and map link)
interface EliteFoodItem {
  id: string;
  name: string;
  type: string;
  quantity: string;
}
interface EliteRegistration {
  id: string;
  fullName: string;
  phoneNumber: string;
  careHomeName: string;
  address: string;
  foods: EliteFoodItem[];
  registeredAt: string;
}

// Elite Mode Page – for elders in care homes who eat marriage/event food and food ordered by kids, not donated surplus
const EliteModePage: React.FC<{ darkMode: boolean; onBack: () => void; t: any }> = ({ darkMode, onBack, t }) => {
  const [eliteView, setEliteView] = useState<'info' | 'register' | 'confirmed'>('info');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [careHomeName, setCareHomeName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [foods, setFoods] = useState<EliteFoodItem[]>([{ id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
  const [registrations, setRegistrations] = useState<EliteRegistration[]>([]);
  const [lastRegistration, setLastRegistration] = useState<EliteRegistration | null>(null);

  const openMapsForAddress = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const addFood = () => {
    setFoods((prev) => [...prev, { id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
  };
  const removeFood = (id: string) => {
    setFoods((prev) => (prev.length > 1 ? prev.filter((f) => f.id !== id) : prev));
  };
  const updateFood = (id: string, field: keyof EliteFoodItem, value: string) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const submitRegistration = () => {
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedCareHome = careHomeName.trim();
    const trimmedAddress = homeAddress.trim();

    if (!trimmedFullName || !trimmedPhone || !trimmedCareHome || !trimmedAddress) {
      alert('Please fill in all required fields: Full Name, Phone Number, Care Home Name, and Address');
      return;
    }

    const foodList = foods.filter((f) => f.name.trim() || f.type.trim() || f.quantity.trim());
    const newRegistration: EliteRegistration = {
      id: crypto.randomUUID(),
      fullName: trimmedFullName,
      phoneNumber: trimmedPhone,
      careHomeName: trimmedCareHome,
      address: trimmedAddress,
      foods: foodList.length
        ? foodList
        : foods.map((f) => ({
            ...f,
            name: f.name || '—',
            type: f.type || '—',
            quantity: f.quantity || '—',
          })),
      registeredAt: new Date().toLocaleString(),
    };

    setRegistrations((prev) => [...prev, newRegistration]);
    setLastRegistration(newRegistration);
    setEliteView('confirmed');
  };

  const cardCls = darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm';
  const inputCls = darkMode
    ? 'bg-slate-800/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-amber-500/50 focus:border-amber-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-amber-400 focus:border-amber-500';

  // Register view: form + My registrations with map link
  if (eliteView === 'register') {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
        <button
          onClick={() => setEliteView('info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-emerald-800/40 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          {t('eliteBackToElite')}
        </button>

        <div className={`rounded-2xl p-8 transition-all duration-300 border ${cardCls}`}>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteRegisterHome')}
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-blue-100' : 'text-slate-600'}`}>
            Please fill in all your details to register for Elite Mode and start receiving notifications about special foods near your area.
          </p>

          {/* Personal Details Section */}
          <div className="mb-8 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50">
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
              👤 Your Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name *
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full rounded-lg border px-4 py-2.5 ${inputCls}`}
                />
              </label>
              <label className="block">
                <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Phone Number *
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className={`w-full rounded-lg border px-4 py-2.5 ${inputCls}`}
                />
              </label>
            </div>
            <label className="block mt-4">
              <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Care Home / Organization Name *
              </span>
              <input
                type="text"
                value={careHomeName}
                onChange={(e) => setCareHomeName(e.target.value)}
                placeholder="Enter the care home or organization name"
                className={`w-full rounded-lg border px-4 py-2.5 ${inputCls}`}
              />
            </label>
          </div>

          {/* Address Section */}
          <label className="block mb-6">
            <span className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              📍 Your Address *
            </span>
            <input
              type="text"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder={t('eliteHomeAddressPlaceholder')}
              className={`w-full rounded-xl border px-4 py-3 ${inputCls}`}
            />
          </label>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {t('eliteFoodsAvailable')}
              </span>
              <button
                type="button"
                onClick={addFood}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  darkMode ? 'bg-amber-600/40 text-amber-200 hover:bg-amber-600/60' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                <Plus className="w-4 h-4" /> {t('eliteAddFood')}
              </button>
            </div>
            <div className="space-y-3">
              {foods.map((f) => (
                <div key={f.id} className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                  <input
                    type="text"
                    value={f.name}
                    onChange={(e) => updateFood(f.id, 'name', e.target.value)}
                    placeholder={t('eliteFoodName')}
                    className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                  />
                  <input
                    type="text"
                    value={f.type}
                    onChange={(e) => updateFood(f.id, 'type', e.target.value)}
                    placeholder={t('eliteFoodType')}
                    className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                  />
                  <input
                    type="text"
                    value={f.quantity}
                    onChange={(e) => updateFood(f.id, 'quantity', e.target.value)}
                    placeholder={t('eliteQuantity')}
                    className={`w-24 rounded-lg border px-3 py-2 text-sm ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeFood(f.id)}
                    className={`p-2 rounded-lg transition ${darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'}`}
                    aria-label="Remove food"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={submitRegistration}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition ${
              darkMode ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-500 text-white hover:bg-amber-600'
            }`}
          >
            {t('eliteSubmitRegistration')}
          </button>
        </div>

        <div className={`rounded-2xl p-6 transition-all duration-300 border ${cardCls}`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteMyRegistrations')}
          </h3>
          {registrations.length === 0 ? (
            <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t('eliteNoRegistrationsYet')}</p>
          ) : (
            <ul className="space-y-4">
              {registrations.map((reg) => (
                <li
                  key={reg.id}
                  className={`rounded-xl p-4 border transition ${
                    darkMode ? 'bg-slate-800/40 border-slate-600' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className={`font-medium mb-2 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {reg.address}
                  </p>
                  {reg.foods.length > 0 && (
                    <p className={`text-sm mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {reg.foods.map((f) => `${f.name || '—'} (${f.type || '—'}) × ${f.quantity || '—'}`).join(' · ')}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => openMapsForAddress(reg.address)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      darkMode ? 'bg-emerald-600/50 text-emerald-200 hover:bg-emerald-600/70' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    <MapPin className="w-4 h-4" /> {t('eliteViewOnMap')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Confirmation view: show after successful registration
  if (eliteView === 'confirmed' && lastRegistration) {
    // Sample matched elite foods based on location/type
    const matchedEliteFoods = [
      {
        id: '1',
        name: 'Diwali Sweets & Savouries',
        description: 'Traditional sweets prepared for Diwali celebrations - gulab jamuns, kheer, and savory namkeen assorted boxes',
        distance: '2.3 km',
        icon: '🪔',
      },
      {
        id: '2',
        name: 'Pongal Specialties',
        description: 'Fresh Pongal with jaggery and cashews, served with pickle and papad - authentic South Indian harvest festival meal',
        distance: '1.8 km',
        icon: '🎊',
      },
      {
        id: '3',
        name: 'Eid Biryani & Kebabs',
        description: 'Fragrant biryani with marinated meat, kebabs, and cooling raita - prepared for Eid celebrations',
        distance: '3.1 km',
        icon: '🍛',
      },
      {
        id: '4',
        name: 'Wedding Feast Platter',
        description: 'Multi-course wedding meal prepared by professional caterers - includes appetizers, main course, and desserts',
        distance: '4.2 km',
        icon: '💒',
      },
    ];

    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
        <button
          onClick={() => {
            setEliteView('info');
            setFullName('');
            setPhoneNumber('');
            setCareHomeName('');
            setHomeAddress('');
            setFoods([{ id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
            setLastRegistration(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-emerald-800/40 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          ← Back to Elite Mode
        </button>

        {/* Success Confirmation Card */}
        <div className={`rounded-2xl p-8 transition-all duration-300 border-2 ${
          darkMode
            ? 'bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border-emerald-500/60 shadow-lg shadow-emerald-500/20'
            : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-400/60 shadow-lg shadow-emerald-400/20'
        }`}>
          <div className="text-center mb-6">
            <div className={`text-6xl mb-4 animate-bounce`}>✅</div>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Registration Successful!
            </h2>
            <p className={`text-lg ${darkMode ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Your Elite Mode registration has been confirmed
            </p>
          </div>

          {/* Registration Summary */}
          <div className={`rounded-xl p-4 mb-6 ${darkMode ? 'bg-slate-800/40 border-slate-600' : 'bg-white border-slate-200'} border`}>
            <h3 className={`font-semibold mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              📋 Your Registration Details
            </h3>
            <div className="space-y-2 text-sm">
              <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <span className="font-medium">Name:</span> {lastRegistration.fullName}
              </p>
              <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <span className="font-medium">Phone:</span> {lastRegistration.phoneNumber}
              </p>
              <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <span className="font-medium">Organization:</span> {lastRegistration.careHomeName}
              </p>
              <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <span className="font-medium">Address:</span> {lastRegistration.address}
              </p>
              <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                <span className="font-medium">Registered:</span> {lastRegistration.registeredAt}
              </p>
            </div>
          </div>

          {/* Notification Message */}
          <div className={`rounded-xl p-4 mb-6 border-l-4 ${
            darkMode
              ? 'bg-blue-900/30 border-blue-500 border-l-4'
              : 'bg-blue-50 border-blue-300 border-l-4'
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center gap-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              🔔 How You'll Be Notified
            </h3>
            <p className={`text-sm mb-2 ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
              Your address has been successfully added to Elite Mode!
            </p>
            <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
              <li>✓ We'll notify you when special foods (weddings, festivals, celebrations) are prepared near your surroundings</li>
              <li>✓ You'll receive alerts based on your location: <strong>{lastRegistration.address}</strong></li>
              <li>✓ Accept the notification, and meals will be delivered to your doorstep</li>
              <li>✓ Contact: We'll reach you at <strong>{lastRegistration.phoneNumber}</strong></li>
            </ul>
          </div>
        </div>

        {/* Matched Elite Food Examples */}
        <div className={`rounded-2xl p-8 transition-all duration-300 border ${
          darkMode
            ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/25'
            : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300/50'
        }`}>
          <h3 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            🎉 Foods You May Receive
          </h3>
          <p className={`mb-6 text-sm ${darkMode ? 'text-amber-100' : 'text-amber-700'}`}>
            Here are examples of special foods that are often made near your area and available for Elite Mode members
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedEliteFoods.map((food) => (
              <div
                key={food.id}
                className={`rounded-xl p-5 border-2 transition transform hover:scale-[1.02] ${
                  darkMode
                    ? 'bg-slate-800/40 border-slate-600 hover:border-amber-500/60'
                    : 'bg-white border-slate-200 hover:border-amber-400/60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl flex-shrink-0">{food.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-bold text-lg ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      {food.name}
                    </h4>
                    <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      📍 {food.distance} away
                    </p>
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {food.description}
                </p>
              </div>
            ))}
          </div>

          <p className={`text-center text-sm mt-6 ${darkMode ? 'text-amber-100' : 'text-amber-700'}`}>
            🎯 When any of these foods are available near your area, you'll receive an instant notification!
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => {
            setEliteView('register');
            setFullName('');
            setPhoneNumber('');
            setCareHomeName('');
            setHomeAddress('');
            setFoods([{ id: crypto.randomUUID(), name: '', type: '', quantity: '' }]);
            setLastRegistration(null);
          }}
          className={`w-full py-3 rounded-xl font-semibold text-lg transition ${
            darkMode ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          Register Another Care Home / Organization
        </button>
      </div>
    );
  }

  // Info view (default): main Elite Mode info page
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-emerald-800/40 text-slate-200'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      {/* Hero */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <Crown className={`w-10 h-10 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
            {t('eliteTitle')}
          </h2>
        </div>
        <p className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {t('eliteSubtitle')}
        </p>
      </div>

      {/* Who is Elite Mode for? */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('eliteWho')}
        </h3>
        <p className={`${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('eliteWhoDesc')}
        </p>
      </div>

      {/* What food do they eat? */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('eliteWhat')}
        </h3>
        <p className={`${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('eliteWhatDesc')}
        </p>
      </div>

      {/* Festival-made food – also served on the website */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-amber-900/20 border-amber-600/30' : 'bg-amber-50/80 border-amber-200 shadow-sm'
      }`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            {t('eliteFestivalTitle')}
          </h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            darkMode ? 'bg-emerald-600/40 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {t('eliteFestivalServed')}
          </span>
        </div>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('eliteFestivalDesc')}
        </p>
        <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-amber-200/90' : 'text-amber-800'}`}>
          {t('eliteFestivalExamplesLabel')}
        </p>
        <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx1')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx2')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx3')}
          </li>
          <li className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx4')}
          </li>
          <li className="flex items-center gap-2 sm:col-span-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${darkMode ? 'bg-amber-400' : 'bg-amber-500'}`} aria-hidden />
            {t('eliteFestivalEx5')}
          </li>
        </ul>
      </div>

      {/* How Elite Mode works */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('eliteHow')}
        </h3>
        <ul className="space-y-4">
          {[
            { step: 1, body: t('eliteHow1') },
            { step: 2, body: t('eliteHow2') },
            { step: 3, body: t('eliteHow3') },
          ].map(({ step, body }) => (
            <li key={step} className={`flex gap-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
              <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                darkMode ? 'bg-amber-600/40 text-amber-300' : 'bg-amber-100 text-amber-700'
              }`}>
                {step}
              </span>
              <span className="font-medium">{body}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Get involved + Register button */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/25 border-emerald-600/30' : 'bg-amber-50 border-amber-200 shadow-sm'
      }`}>
        <p className={`font-semibold mb-4 ${darkMode ? 'text-amber-200' : 'text-amber-800'}`}>
          {t('getInvolvedElite')}
        </p>
        <button
          type="button"
          onClick={() => setEliteView('register')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition ${
            darkMode ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <Plus className="w-4 h-4" /> {t('eliteRegister')}
        </button>
      </div>
    </div>
  );
};

// About Us Page Component – full website details and features
const AboutPage: React.FC<{ darkMode: boolean; onBack: () => void; t: any }> = ({ darkMode, onBack, t }) => {
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
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-blue-200 text-blue-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      {/* Hero */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/40 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-gradient-to-br from-blue-400/15 to-emerald-400/15 border-blue-300/50 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('aboutResQMeal')}
        </h2>
        <p className={`text-lg font-medium ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
          {t('turningSurplus')}
        </p>
        <p className={`mt-2 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('fullStackPlatform')}
        </p>
      </div>

      {/* Mission & Vision */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('ourMission')}
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('missionText')}
        </p>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('ourVision')}
        </h3>
        <p className={darkMode ? 'text-blue-100' : 'text-slate-700'}>
          {t('visionText')}
        </p>
      </div>

      {/* How it works */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('howItWorks')}
        </h3>
        <ul className="space-y-4">
          {[
            { step: 1, title: t('postSurplus'), body: t('postSurplusDesc') },
            { step: 2, title: t('getMatched'), body: t('getMatchedDesc') },
            { step: 3, title: t('confirmDeliver'), body: t('confirmDeliverDesc') },
            { step: 4, title: t('seeImpact'), body: t('seeImpactDesc') },
          ].map(({ step, title, body }) => (
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
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('websiteFeatures')}
        </h3>
        <p className={`mb-6 text-sm ${darkMode ? 'text-blue-200' : 'text-slate-600'}`}>
          {t('websiteFeaturesDesc')}
        </p>
        <ul className="space-y-4">
          {aboutFeatures.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className={`flex gap-4 p-4 rounded-xl ${
                darkMode ? 'bg-emerald-900/25' : 'bg-slate-50'
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
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-yellow-300' : 'text-blue-700'}`}>
          {t('technologyAI')}
        </h3>
        <p className={`mb-4 ${darkMode ? 'text-blue-100' : 'text-slate-700'}`}>
          {t('technologyAIText')}
        </p>
      </div>

      {/* Get involved */}
      <div className={`rounded-2xl p-6 transition-all duration-300 border ${
        darkMode ? 'bg-emerald-900/25 border-emerald-600/30' : 'bg-amber-50 border-amber-200'
      }`}>
        <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
          {t('getInvolved')}
        </h3>
        <p className={darkMode ? 'text-blue-100' : 'text-amber-900/90'}>
          {t('getInvolvedText')}
        </p>
      </div>
    </div>
  );
};

// Stat Detail Page Component - Expanded view for each metric
// Progress bar fill with width set via ref (no inline style for linter)
const ProgressFill: React.FC<{ percentage: number; className: string }> = ({ percentage, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current('style').width = `${percentage}%`;
  }, [percentage]);
  return <div ref={ref} className={className} />;
};

const StatDetailPage: React.FC<{ darkMode: boolean; onBack: () => void; stat: { id: string; icon: string; label: string; value: string; color: string }; t: any }> = ({ darkMode, onBack, stat, t }) => {
  const [detailedView, setDetailedView] = useState<{ type: 'category' | 'period' | 'insights' | 'trend' | null; data?: any }>({ type: null });

  // Mock data for each stat type
  const getStatData = () => {
    const data: Record<string, { 
      total: string; 
      breakdown: { label: string; value: string; percentage: number }[];
      timeline: { date: string; value: number }[];
      insights: string[];
      comparison: { period: string; value: string; change: number }[];
    }> = {
      mealsSaved: {
        total: '3,450',
        breakdown: [
          { label: t('thisWeek'), value: '892', percentage: 26 },
          { label: t('thisMonth'), value: '2,340', percentage: 68 },
          { label: t('thisYear'), value: '3,450', percentage: 100 },
        ],
        timeline: [
          { date: 'Mon', value: 120 },
          { date: 'Tue', value: 135 },
          { date: 'Wed', value: 128 },
          { date: 'Thu', value: 165 },
          { date: 'Fri', value: 155 },
          { date: 'Sat', value: 180 },
          { date: 'Sun', value: 195 },
        ],
        insights: [
          'Average 492 meals saved per week',
          'Peak day: Sunday with 195 meals',
          'Consistent growth trend observed',
          'Top contributor: Restaurant partnerships',
        ],
        comparison: [
          { period: t('lastWeek'), value: '875', change: 1.9 },
          { period: t('lastMonth'), value: '2,100', change: 11.4 },
          { period: t('lastYear'), value: '2,800', change: 23.2 },
        ],
      },
      foodDiverted: {
        total: '8,625 kg',
        breakdown: [
          { label: 'Vegetables', value: '3,200 kg', percentage: 37 },
          { label: 'Cooked Meals', value: '2,850 kg', percentage: 33 },
          { label: 'Fruits', value: '1,575 kg', percentage: 18 },
          { label: 'Other', value: '1,000 kg', percentage: 12 },
        ],
        timeline: [
          { date: 'Mon', value: 1200 },
          { date: 'Tue', value: 1350 },
          { date: 'Wed', value: 1280 },
          { date: 'Thu', value: 1650 },
          { date: 'Fri', value: 1550 },
          { date: 'Sat', value: 1800 },
          { date: 'Sun', value: 1950 },
        ],
        insights: [
          'Average 1,232 kg diverted per week',
          'Vegetables account for largest share',
          'Consistent upward trend',
          'Prevents landfill waste effectively',
        ],
        comparison: [
          { period: 'Last Week', value: '1,200 kg', change: 2.7 },
          { period: 'Last Month', value: '7,800 kg', change: 10.6 },
          { period: 'Last Year', value: '6,500 kg', change: 32.7 },
        ],
      },
      co2Prevented: {
        total: '21.5 tons',
        breakdown: [
          { label: 'This Week', value: '5.2 tons', percentage: 24 },
          { label: 'This Month', value: '14.8 tons', percentage: 69 },
          { label: 'This Year', value: '21.5 tons', percentage: 100 },
        ],
        timeline: [
          { date: 'Mon', value: 0.3 },
          { date: 'Tue', value: 0.34 },
          { date: 'Wed', value: 0.32 },
          { date: 'Thu', value: 0.41 },
          { date: 'Fri', value: 0.39 },
          { date: 'Sat', value: 0.45 },
          { date: 'Sun', value: 0.49 },
        ],
        insights: [
          'Equivalent to 45 car trips avoided',
          'Saves 2.5 kg CO₂ per kg food rescued',
          'Significant climate impact',
          'Growing environmental contribution',
        ],
        comparison: [
          { period: 'Last Week', value: '5.0 tons', change: 4.0 },
          { period: 'Last Month', value: '13.2 tons', change: 12.1 },
          { period: 'Last Year', value: '18.5 tons', change: 16.2 },
        ],
      },
      waterSaved: {
        total: '8.6M L',
        breakdown: [
          { label: 'This Week', value: '2.1M L', percentage: 24 },
          { label: 'This Month', value: '5.9M L', percentage: 69 },
          { label: 'This Year', value: '8.6M L', percentage: 100 },
        ],
        timeline: [
          { date: 'Mon', value: 300 },
          { date: 'Tue', value: 338 },
          { date: 'Wed', value: 320 },
          { date: 'Thu', value: 412 },
          { date: 'Fri', value: 387 },
          { date: 'Sat', value: 450 },
          { date: 'Sun', value: 487 },
        ],
        insights: [
          'Average 1.23M L saved per week',
          'Equivalent to 3,440 swimming pools',
          'Critical water conservation impact',
          'Sustainable resource management',
        ],
        comparison: [
          { period: 'Last Week', value: '2.0M L', change: 5.0 },
          { period: 'Last Month', value: '5.5M L', change: 7.3 },
          { period: 'Last Year', value: '7.2M L', change: 19.4 },
        ],
      },
    };
    return data[stat.id] || data.mealsSaved;
  };

  const statData = getStatData();

  // Detailed Report Components
  const CategoryDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => {
    const categoryData: Record<string, any> = {
      'Vegetables': {
        dailyBreakdown: [
          { day: 'Monday', value: '450 kg', items: ['Carrots', 'Tomatoes', 'Potatoes', 'Onions'] },
          { day: 'Tuesday', value: '520 kg', items: ['Broccoli', 'Cauliflower', 'Bell Peppers'] },
          { day: 'Wednesday', value: '480 kg', items: ['Spinach', 'Lettuce', 'Cucumbers'] },
          { day: 'Thursday', value: '600 kg', items: ['Carrots', 'Tomatoes', 'Zucchini'] },
          { day: 'Friday', value: '550 kg', items: ['Potatoes', 'Onions', 'Garlic'] },
          { day: 'Saturday', value: '400 kg', items: ['Mixed Vegetables'] },
          { day: 'Sunday', value: '200 kg', items: ['Fresh Greens'] },
        ],
        topSources: ['Restaurant A (35%)', 'Restaurant B (28%)', 'Restaurant C (22%)', 'Others (15%)'],
        impact: 'Prevented 1,184 kg CO₂ emissions',
      },
      'Cooked Meals': {
        dailyBreakdown: [
          { day: 'Monday', value: '380 kg', items: ['Curry', 'Rice', 'Bread'] },
          { day: 'Tuesday', value: '420 kg', items: ['Pasta', 'Soup', 'Stew'] },
          { day: 'Wednesday', value: '400 kg', items: ['Fried Rice', 'Noodles'] },
          { day: 'Thursday', value: '500 kg', items: ['Biryani', 'Curry', 'Roti'] },
          { day: 'Friday', value: '450 kg', items: ['Pasta', 'Pizza', 'Salad'] },
          { day: 'Saturday', value: '400 kg', items: ['Meals', 'Desserts'] },
          { day: 'Sunday', value: '300 kg', items: ['Special Meals'] },
        ],
        topSources: ['Catering Service A (40%)', 'Restaurant B (30%)', 'Event Hall C (20%)', 'Others (10%)'],
        impact: 'Fed 1,425 people',
      },
      'Fruits': {
        dailyBreakdown: [
          { day: 'Monday', value: '220 kg', items: ['Apples', 'Bananas', 'Oranges'] },
          { day: 'Tuesday', value: '250 kg', items: ['Mangoes', 'Grapes', 'Berries'] },
          { day: 'Wednesday', value: '230 kg', items: ['Pineapples', 'Papayas'] },
          { day: 'Thursday', value: '280 kg', items: ['Watermelons', 'Melons'] },
          { day: 'Friday', value: '260 kg', items: ['Apples', 'Pears', 'Peaches'] },
          { day: 'Saturday', value: '200 kg', items: ['Mixed Fruits'] },
          { day: 'Sunday', value: '135 kg', items: ['Fresh Fruits'] },
        ],
        topSources: ['Fruit Market A (32%)', 'Grocery Store B (28%)', 'Farm C (25%)', 'Others (15%)'],
        impact: 'Prevented 394 kg CO₂ emissions',
      },
      'Other': {
        dailyBreakdown: [
          { day: 'Monday', value: '140 kg', items: ['Baked Goods', 'Dairy'] },
          { day: 'Tuesday', value: '150 kg', items: ['Snacks', 'Beverages'] },
          { day: 'Wednesday', value: '145 kg', items: ['Packaged Foods'] },
          { day: 'Thursday', value: '180 kg', items: ['Baked Goods', 'Desserts'] },
          { day: 'Friday', value: '165 kg', items: ['Dairy', 'Snacks'] },
          { day: 'Saturday', value: '120 kg', items: ['Mixed Items'] },
          { day: 'Sunday', value: '100 kg', items: ['Various'] },
        ],
        topSources: ['Bakery A (35%)', 'Store B (30%)', 'Cafe C (20%)', 'Others (15%)'],
        impact: 'Prevented 250 kg CO₂ emissions',
      },
    };

    const details = categoryData[data.label] || categoryData['Other'];

    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          ← {t('backToReport') || 'Back to Report'}
        </button>

        <div className={`rounded-2xl p-8 border ${
          darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {data.label} - {t('detailedReport') || 'Detailed Report'}
          </h2>
          <p className={`text-xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-slate-700'}`}>
            {data.value} ({data.percentage}% {t('ofTotal')})
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('dailyBreakdown') || 'Daily Breakdown'}
              </h3>
              <div className="space-y-3">
                {details.dailyBreakdown.map((day: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{day.day}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{day.value}</span>
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {day.items.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('topSources') || 'Top Sources'}
              </h3>
              <div className="space-y-3">
                {details.topSources.map((source: string, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{source}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-emerald-900/40 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className={`font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  💚 {details.impact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PeriodDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => {
    const periodData: Record<string, any> = {
      [t('lastWeek')]: {
        dailyData: [
          { day: 'Monday', value: data.statId === 'foodDiverted' ? '1,150 kg' : data.statId === 'co2Prevented' ? '4.8 tons' : data.statId === 'waterSaved' ? '1.9M L' : '850 meals' },
          { day: 'Tuesday', value: data.statId === 'foodDiverted' ? '1,200 kg' : data.statId === 'co2Prevented' ? '5.0 tons' : data.statId === 'waterSaved' ? '2.0M L' : '880 meals' },
          { day: 'Wednesday', value: data.statId === 'foodDiverted' ? '1,180 kg' : data.statId === 'co2Prevented' ? '4.9 tons' : data.statId === 'waterSaved' ? '1.95M L' : '870 meals' },
          { day: 'Thursday', value: data.statId === 'foodDiverted' ? '1,250 kg' : data.statId === 'co2Prevented' ? '5.2 tons' : data.statId === 'waterSaved' ? '2.1M L' : '920 meals' },
          { day: 'Friday', value: data.statId === 'foodDiverted' ? '1,220 kg' : data.statId === 'co2Prevented' ? '5.1 tons' : data.statId === 'waterSaved' ? '2.05M L' : '900 meals' },
          { day: 'Saturday', value: data.statId === 'foodDiverted' ? '1,300 kg' : data.statId === 'co2Prevented' ? '5.4 tons' : data.statId === 'waterSaved' ? '2.15M L' : '950 meals' },
          { day: 'Sunday', value: data.statId === 'foodDiverted' ? '1,350 kg' : data.statId === 'co2Prevented' ? '5.6 tons' : data.statId === 'waterSaved' ? '2.2M L' : '980 meals' },
        ],
        summary: t('lastWeekSummary') || 'Last week showed consistent performance with steady growth.',
      },
      [t('lastMonth')]: {
        weeklyData: [
          { week: 'Week 1', value: data.statId === 'foodDiverted' ? '1,800 kg' : data.statId === 'co2Prevented' ? '7.2 tons' : data.statId === 'waterSaved' ? '3.0M L' : '1,400 meals' },
          { week: 'Week 2', value: data.statId === 'foodDiverted' ? '1,950 kg' : data.statId === 'co2Prevented' ? '7.8 tons' : data.statId === 'waterSaved' ? '3.2M L' : '1,500 meals' },
          { week: 'Week 3', value: data.statId === 'foodDiverted' ? '2,000 kg' : data.statId === 'co2Prevented' ? '8.0 tons' : data.statId === 'waterSaved' ? '3.3M L' : '1,550 meals' },
          { week: 'Week 4', value: data.statId === 'foodDiverted' ? '2,050 kg' : data.statId === 'co2Prevented' ? '8.2 tons' : data.statId === 'waterSaved' ? '3.4M L' : '1,600 meals' },
        ],
        summary: t('lastMonthSummary') || 'Last month demonstrated strong growth with increasing impact each week.',
      },
      [t('lastYear')]: {
        monthlyData: [
          { month: 'Jan', value: data.statId === 'foodDiverted' ? '500 kg' : data.statId === 'co2Prevented' ? '2.0 tons' : data.statId === 'waterSaved' ? '0.8M L' : '400 meals' },
          { month: 'Feb', value: data.statId === 'foodDiverted' ? '520 kg' : data.statId === 'co2Prevented' ? '2.1 tons' : data.statId === 'waterSaved' ? '0.85M L' : '420 meals' },
          { month: 'Mar', value: data.statId === 'foodDiverted' ? '550 kg' : data.statId === 'co2Prevented' ? '2.2 tons' : data.statId === 'waterSaved' ? '0.9M L' : '450 meals' },
          { month: 'Apr', value: data.statId === 'foodDiverted' ? '580 kg' : data.statId === 'co2Prevented' ? '2.3 tons' : data.statId === 'waterSaved' ? '0.95M L' : '480 meals' },
          { month: 'May', value: data.statId === 'foodDiverted' ? '600 kg' : data.statId === 'co2Prevented' ? '2.4 tons' : data.statId === 'waterSaved' ? '1.0M L' : '500 meals' },
          { month: 'Jun', value: data.statId === 'foodDiverted' ? '620 kg' : data.statId === 'co2Prevented' ? '2.5 tons' : data.statId === 'waterSaved' ? '1.05M L' : '520 meals' },
        ],
        summary: t('lastYearSummary') || 'Last year showed progressive improvement with consistent monthly growth.',
      },
    };

    const details = periodData[data.period] || periodData[t('lastWeek')];

    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          ← {t('backToReport') || 'Back to Report'}
        </button>

        <div className={`rounded-2xl p-8 border ${
          darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {data.period} - {t('detailedReport') || 'Detailed Report'}
          </h2>
          <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-slate-700'}`}>
            {data.value}
          </p>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {data.change > 0 ? '↑' : '↓'} {Math.abs(data.change)}% {t('change')}
          </p>

          {details.dailyData && (
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('dailyBreakdown') || 'Daily Breakdown'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.dailyData.map((day: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{day.day}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{day.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.weeklyData && (
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('weeklyBreakdown') || 'Weekly Breakdown'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.weeklyData.map((week: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{week.week}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{week.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.monthlyData && (
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('monthlyBreakdown') || 'Monthly Breakdown'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {details.monthlyData.map((month: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{month.month}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{month.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-emerald-900/40 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-200'}`}>
            <p className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{details.summary}</p>
          </div>
        </div>
      </div>
    );
  };

  const InsightsDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        ← {t('backToReport') || 'Back to Report'}
      </button>

      <div className={`rounded-2xl p-8 border ${
        darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
          {t('keyInsights')} - {t('detailedReport') || 'Detailed Report'}
        </h2>
        <div className="space-y-4">
          {data.insights.map((insight: string, idx: number) => (
            <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
              <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TrendDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        ← {t('backToReport') || 'Back to Report'}
      </button>

      <div className={`rounded-2xl p-8 border ${
        darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
          {t('weeklyTrend')} - {t('detailedReport') || 'Detailed Report'}
        </h2>
        <div className="w-full h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline}>
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
                dataKey="value"
                stroke={stat.id === 'mealsSaved' ? '#10b981' : stat.id === 'foodDiverted' ? '#3b82f6' : stat.id === 'co2Prevented' ? '#f59e0b' : '#06b6d4'}
                strokeWidth={3}
                dot={{ fill: stat.id === 'mealsSaved' ? '#10b981' : stat.id === 'foodDiverted' ? '#3b82f6' : stat.id === 'co2Prevented' ? '#f59e0b' : '#06b6d4', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
          <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {t('trendAnalysis') || 'This chart shows the weekly trend with detailed data points for each day.'}
          </p>
        </div>
      </div>
    </div>
  );

  // Show detailed report if one is selected
  if (detailedView.type) {
    return (
      <div className={`w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 animate-fadeIn`}>
        {detailedView.type === 'category' && <CategoryDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
        {detailedView.type === 'period' && <PeriodDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
        {detailedView.type === 'insights' && <InsightsDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
        {detailedView.type === 'trend' && <TrendDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
      </div>
    );
  }

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      {/* Header */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/50 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{stat.icon}</span>
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              {stat.label}
            </h2>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statData.breakdown.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setDetailedView({ type: 'category', data: { ...item, statId: stat.id } })}
            className={`rounded-xl p-6 transition-all duration-300 border text-left cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
              darkMode ? 'bg-emerald-900/30 border-emerald-600/25 hover:bg-emerald-900/40' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            }`}
          >
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {item.label}
            </p>
            <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              {item.value}
            </p>
            <div className={`mt-3 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-emerald-900/60' : 'bg-slate-200'}`}>
              <ProgressFill
                percentage={item.percentage}
                className={`h-full transition-all ${
                  stat.id === 'mealsSaved' ? 'bg-emerald-500' :
                  stat.id === 'foodDiverted' ? 'bg-blue-500' :
                  stat.id === 'co2Prevented' ? 'bg-yellow-500' :
                  'bg-cyan-500'
                }`}
              />
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.percentage}% {t('ofTotal')}
            </p>
            <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {t('clickForDetails') || 'Click for details'}
            </p>
          </button>
        ))}
      </div>

      {/* Timeline Chart */}
      <button
        type="button"
        onClick={() => setDetailedView({ type: 'trend', data: { timeline: statData.timeline, statId: stat.id } })}
        className={`rounded-2xl p-6 transition-all duration-300 border text-left w-full cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25 hover:bg-emerald-900/40' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {t('weeklyTrend')}
          </h3>
          <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            {t('clickForDetails') || 'Click for details'}
          </p>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statData.timeline}>
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
                dataKey="value"
                stroke={
                  stat.id === 'mealsSaved' ? '#10b981' :
                  stat.id === 'foodDiverted' ? '#3b82f6' :
                  stat.id === 'co2Prevented' ? '#f59e0b' :
                  '#06b6d4'
                }
                strokeWidth={3}
                dot={{ fill: stat.id === 'mealsSaved' ? '#10b981' : stat.id === 'foodDiverted' ? '#3b82f6' : stat.id === 'co2Prevented' ? '#f59e0b' : '#06b6d4', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </button>

      {/* Insights & Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insights */}
        <button
          type="button"
          onClick={() => setDetailedView({ type: 'insights', data: { insights: statData.insights, statId: stat.id } })}
          className={`rounded-xl p-6 transition-all duration-300 border text-left cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
            darkMode ? 'bg-emerald-900/30 border-emerald-600/25 hover:bg-emerald-900/40' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              <TrendingUp className="w-5 h-5" /> {t('keyInsights')}
            </h3>
            <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {t('clickForDetails') || 'Click for details'}
            </p>
          </div>
          <ul className="space-y-2">
            {statData.insights.map((insight, idx) => (
              <li key={idx} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <span className={`mt-1 ${darkMode ? 'text-yellow-300' : 'text-emerald-600'}`}>•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </button>

        {/* Comparison */}
        <div className={`rounded-xl p-6 transition-all duration-300 border ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {t('periodComparison')}
          </h3>
          <div className="space-y-4">
            {statData.comparison.map((comp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDetailedView({ type: 'period', data: { ...comp, statId: stat.id } })}
                className={`w-full p-3 rounded-lg text-left cursor-pointer hover:scale-[1.02] transition-all ${
                  darkMode ? 'bg-emerald-900/30 hover:bg-emerald-900/40' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {comp.period}
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                    {comp.value}
                  </span>
                </div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  comp.change > 0 ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {comp.change > 0 ? '↑' : '↓'} {Math.abs(comp.change)}% {t('change')}
                </div>
                <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  {t('clickForDetails') || 'Click for details'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
