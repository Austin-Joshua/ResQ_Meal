import React, { useEffect, useState } from 'react';
import { Package, Utensils, MapPin, Clock, Leaf, ArrowLeft } from 'lucide-react';
import { deliveryApi, organisationApi } from '@/services/api';
import { AppShell } from '@/components/AppShell';
import { AvailableFoodCarousel } from '@/components/AvailableFoodCarousel';
import { useLanguage } from '@/context/LanguageContext';
import { NATIVE_LANGUAGE_LABELS } from '@/lib/utils';
import { SettingsPage } from './SettingsPage';
import logoIcon from '/BG remove.png';

interface VolunteerModeProps {
  darkMode: boolean;
  setDarkMode?: (v: boolean) => void;
  language?: 'en' | 'ta' | 'hi';
  setLanguage?: (v: 'en' | 'ta' | 'hi') => void;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

const VolunteerMode: React.FC<VolunteerModeProps> = ({
  darkMode,
  setDarkMode,
  language = 'en',
  setLanguage,
  user,
  onLogout,
}) => {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [deliveries, setDeliveries] = useState<Array<{ id: string; food_name: string; status: string; address?: string }>>([]);
  const [availableFood, setAvailableFood] = useState<Array<{ id: number; food_name: string; food_type: string; quantity_servings: number; address?: string; organization_name?: string; status: string; freshness_score?: number | null; quality_score?: number | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [availableFoodLoading, setAvailableFoodLoading] = useState(true);

  // Did you know tips
  const DID_YOU_KNOW_TIPS = [
    'Every 1 kg of food rescued saves ~2.5 kg CO₂ and helps feed someone in need.',
    'Roughly one third of food produced for human consumption is lost or wasted globally each year.',
    'Food waste in landfills produces methane, a greenhouse gas many times more potent than CO₂.',
    'Donating surplus food can reduce your organisation's carbon footprint and support local communities.',
    'Rescuing just 10% of avoidable food waste could feed millions of people in need.',
    'Keeping surplus food in the "human consumption" loop saves water, energy, and land used to grow it.',
  ];

  function pickRandomTip() {
    return DID_YOU_KNOW_TIPS[Math.floor(Math.random() * DID_YOU_KNOW_TIPS.length)];
  }

  const [didYouKnowTip] = useState(() => pickRandomTip());

  useEffect(() => {
    deliveryApi.getVolunteerDeliveries()
      .then((res) => setDeliveries(Array.isArray(res.data?.data) ? res.data.data : res.data ? [res.data] : []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    organisationApi.getAvailableFood()
      .then((res) => setAvailableFood(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setAvailableFood([]))
      .finally(() => setAvailableFoodLoading(false));
  }, []);

  // Scroll to top when component mounts to ensure home features are visible
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  if (showSettings) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900' : 'bg-white'
      }`}>
        <button
          onClick={() => setShowSettings(false)}
          className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            darkMode
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDashboard')}
        </button>
        <SettingsPage 
          darkMode={darkMode} 
          setDarkMode={setDarkMode ?? (() => {})} 
          language={language} 
          setLanguage={setLanguage ?? (() => {})} 
        />
      </div>
    );
  }

  return (
    <AppShell
      title="ResQ Meal"
      logo={<img src={logoIcon} alt="ResQ Meal - Turning surplus into sustenance" className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[260px] object-contain object-left" />}
      onLogoClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      darkMode={darkMode}
      setDarkMode={setDarkMode ?? (() => {})}
      language={language}
      setLanguage={setLanguage ?? (() => {})}
      languageLabels={NATIVE_LANGUAGE_LABELS}
      user={user}
      onLogout={onLogout}
      onSettingsClick={() => setShowSettings(true)}
    >
      <div className="space-y-6 pb-6">
        {/* Welcome Section */}
        <div className={`rounded-2xl p-6 transition-all duration-300 border ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {t('welcomeBack')}, {user.name || 'Volunteer'}!
          </h1>
          <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('volunteerModeDescription')}
          </p>
        </div>

        {/* Today's Available Food – carousel */}
        <AvailableFoodCarousel
          darkMode={darkMode}
          title={t('availableFood')}
          searchPlaceholder={t('searchFood')}
        />

        {/* Activity & Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-2xl p-6 transition-all duration-300 border ${
            darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
              <Clock className="w-4 h-4 shrink-0" /> {t('recentActivity')}
            </h3>
            <ul className={`space-y-3 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              <li className="flex items-center gap-2">
                <span className="shrink-0" aria-hidden>✓</span>
                <span>{deliveries.filter(d => d.status === 'DELIVERED').length} {t('deliveryCompleted')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="shrink-0" aria-hidden>○</span>
                <span>{deliveries.filter(d => d.status === 'PENDING' || d.status === 'ACCEPTED').length} {t('activeDeliveries')}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="shrink-0" aria-hidden>📦</span>
                <span>{availableFood.length} {t('availableFood')}</span>
              </li>
            </ul>
          </div>
          <div className={`rounded-2xl p-6 transition-all duration-300 border ${
            darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
              {t('howYouCanHelp')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-amber-600/20' : 'bg-amber-50'}`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>{availableFood.length}</p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>{t('availableFood')}</p>
              </div>
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-600/20' : 'bg-emerald-50'}`}>
                <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{deliveries.filter(d => d.status !== 'DELIVERED').length}</p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>{t('activeDeliveries')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Did you know tip */}
        <div className={`rounded-xl p-4 transition-all duration-300 border ${
          darkMode ? 'bg-emerald-900/25 border-emerald-600/30' : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-sm font-semibold flex items-center gap-2 ${darkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            <Leaf className="w-4 h-4 shrink-0" /> {t('didYouKnow')}
          </p>
          <p className={`text-sm mt-2 pl-6 ${darkMode ? 'text-slate-200' : 'text-amber-900/90'}`}>
            {didYouKnowTip}
          </p>
        </div>

        {/* Needed food areas – map */}
        <div className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider px-4 py-3 flex items-center gap-2 border-b ${
            darkMode ? 'text-amber-400 border-emerald-700/30' : 'text-slate-600 border-slate-100'
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

        {/* Available food from organisations – detailed list (only show if there's data or loading) */}
        {(availableFood.length > 0 || availableFoodLoading) && (
          <div className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
            darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`border-b px-4 py-3 ${darkMode ? 'border-emerald-700/30' : 'border-slate-200'}`}>
              <h2 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Utensils className="w-4 h-4" />
                {t('availableFoodFromDonors')}
              </h2>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {t('availableFoodFromDonorsDesc')}
              </p>
            </div>
            <div className="p-4">
              {availableFoodLoading ? (
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{t('loading')}</p>
              ) : (
                <ul className="space-y-3">
                  {availableFood.map((item) => (
                    <li
                      key={item.id}
                      className={`p-4 rounded-lg border transition ${
                        darkMode 
                          ? 'border-emerald-700/30 bg-emerald-900/20 hover:bg-emerald-900/30' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.food_name}</p>
                      <p className={`text-sm mt-1 flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.organization_name && <span>{item.organization_name} · </span>}
                        {item.quantity_servings} {t('servings')} · {t(`foodType_${item.food_type}`) || (item.food_type || '').replace(/^./, (c) => c.toUpperCase())}
                      </p>
                      {item.address && (
                        <p className={`text-sm flex items-center gap-1 mt-1 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          <MapPin className="w-3 h-3 shrink-0" /> {item.address}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-block text-xs px-2 py-1 rounded ${
                          darkMode ? 'bg-emerald-600/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.status}
                        </span>
                        {(item.freshness_score != null || item.quality_score != null) && (
                          <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            {t('freshness')}: {item.freshness_score != null ? `${item.freshness_score}%` : item.quality_score != null ? `${item.quality_score}%` : '—'}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* My deliveries (only show if there's data or loading) */}
        {(deliveries.length > 0 || loading) && (
          <div className={`rounded-2xl overflow-hidden transition-all duration-300 border ${
            darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`border-b px-4 py-3 ${darkMode ? 'border-emerald-700/30' : 'border-slate-200'}`}>
              <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {t('myDeliveries')}
              </h2>
            </div>
            <div className="p-4">
              {loading ? (
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{t('loading')}</p>
              ) : (
                <ul className="space-y-3">
                  {deliveries.map((d) => (
                    <li
                      key={d.id}
                      className={`p-3 rounded-lg border ${
                        darkMode 
                          ? 'border-emerald-700/30 bg-emerald-900/20' 
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{d.food_name}</p>
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {t('status')}: {d.status} {d.address && ` · ${d.address}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default VolunteerMode;
