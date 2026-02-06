import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Utensils, Truck, TrendingUp, ArrowLeft, Plus, MapPin, Zap, X, FileText, Settings as SettingsIcon } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { organisationApi } from '@/services/api';
import FreshFoodChecker from '@/components/FreshFoodChecker';
import { useLanguage } from '@/context/LanguageContext';
import { NATIVE_LANGUAGE_LABELS } from '@/lib/utils';
import { SettingsPage } from './SettingsPage';
import { AppLogo } from '@/components/AppLogo';

/** Assessment from Fresh Food Checker (optional step before posting food). */
interface OrgFoodAssessment {
  qualityScore: number;
  freshness: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'approved' | 'rejected';
  analysis?: { recommendedTempRange?: { min: number; max: number }; recommendedAvailabilityHours?: number };
}

type CardId = 'peopleServed' | 'mealsDelivered' | 'deliveriesCompleted' | 'activeVolunteers' | 'co2Prevented' | 'foodRescued';
type ActivePage = 'report' | 'postFood' | 'settings';

interface OrganisationReportProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (v: 'en' | 'ta' | 'hi') => void;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

// Chart data for organisation report
const monthlyTrendData = [
  { month: 'Sep', meals: 1680, people: 980 },
  { month: 'Oct', meals: 1820, people: 1050 },
  { month: 'Nov', meals: 1950, people: 1120 },
  { month: 'Dec', meals: 1980, people: 1180 },
  { month: 'Jan', meals: 2100, people: 1220 },
  { month: 'Feb', meals: 2150, people: 1240 },
];

// Extended data for detail views (sample breakdowns) - function to get translated data
const getExtendedData = (t: (key: string) => string): Record<CardId, { title: string; subtitle: string; rows: { label: string; value: string }[] }> => ({
  peopleServed: {
    title: t('peopleServed'),
    subtitle: t('totalBeneficiaries'),
    rows: [
      { label: t('thisMonth'), value: '1,240' },
      { label: t('lastMonth'), value: '1,180' },
      { label: t('quarterToDate'), value: '3,650' },
      { label: t('yearToDate'), value: '12,450' },
      { label: t('topLocation'), value: 'Downtown Community Kitchen' },
    ],
  },
  mealsDelivered: {
    title: t('mealsDelivered'),
    subtitle: t('allTime'),
    rows: [
      { label: t('thisMonth'), value: '2,150' },
      { label: t('lastMonth'), value: '1,980' },
      { label: t('averagePerDelivery'), value: '21 meals' },
      { label: t('totalAllTime'), value: '18,620' },
      { label: t('peakDayThisMonth'), value: '142 meals (Feb 3)' },
    ],
  },
  deliveriesCompleted: {
    title: t('deliveriesCompleted'),
    subtitle: t('successfulRuns'),
    rows: [
      { label: t('thisMonth'), value: '98' },
      { label: t('lastMonth'), value: '92' },
      { label: t('onTimeRate'), value: '94%' },
      { label: t('totalSuccessful'), value: '892' },
      { label: t('avgDistancePerRun'), value: '4.2 km' },
    ],
  },
  activeVolunteers: {
    title: t('activeVolunteers'),
    subtitle: t('thisMonth'),
    rows: [
      { label: t('newThisMonth'), value: '5' },
      { label: t('completed5PlusDeliveries'), value: '12' },
      { label: t('topVolunteerDeliveries'), value: 'Arjun R. (28)' },
      { label: t('totalActive'), value: '34' },
      { label: t('retentionRate'), value: '88%' },
    ],
  },
  co2Prevented: {
    title: t('co2Prevented'),
    subtitle: t('equivalentEmissionsAvoided'),
    rows: [
      { label: t('thisMonth'), value: '520 kg' },
      { label: t('lastMonth'), value: '480 kg' },
      { label: t('yearToDate'), value: '4,650 kg' },
      { label: t('equivalentCarKm'), value: '~18,600 km' },
      { label: t('equivalentTrees1Year'), value: '~210 trees' },
    ],
  },
  foodRescued: {
    title: t('foodRescued'),
    subtitle: t('weightDivertedFromWaste'),
    rows: [
      { label: t('thisMonth'), value: '1,040 kg' },
      { label: t('lastMonth'), value: '990 kg' },
      { label: t('yearToDate'), value: '9,320 kg' },
      { label: t('primaryCategory'), value: 'Prepared meals (62%)' },
      { label: t('partnersInvolved'), value: '8 restaurants, 3 NGOs' },
    ],
  },
});

function ReportCardDetailView({
  cardId,
  darkMode,
  onBack,
}: {
  cardId: CardId;
  darkMode: boolean;
  onBack: () => void;
}) {
  const { t } = useLanguage();
  const data = getExtendedData(t)[cardId];
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className={`flex items-center gap-2 mb-6 px-3 py-2 rounded-lg text-sm font-medium transition ${
          darkMode ? 'text-slate-300 hover:bg-blue-900/40' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        {t('backToReport')}
      </button>
      <div className={`rounded-2xl border p-6 ${
        darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {data.title}
        </h2>
        <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {data.subtitle} — {t('extendedBreakdown')}
        </p>
        <dl className="space-y-4">
          {data.rows.map((row) => (
            <div key={row.label} className={`flex justify-between items-center py-2 border-b ${
              darkMode ? 'border-blue-700/30' : 'border-slate-100'
            }`}>
              <dt className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{row.label}</dt>
              <dd className={`font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

const defaultReport = {
  peopleServed: 12450,
  mealsDelivered: 18620,
  deliveriesCompleted: 892,
  activeVolunteers: 34,
  thisMonth: 2150,
  lastMonth: 1980,
  co2PreventedKg: 4650,
  foodRescuedKg: 9320,
};

const FOOD_TYPES = ['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others'] as const;

const OrganisationReport: React.FC<OrganisationReportProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const { t } = useLanguage();
  const [activePage, setActivePage] = useState<ActivePage>('report');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<CardId | null>(null);
  const [organisationFood, setOrganisationFood] = useState<Array<{ id: number; food_name: string; food_type: string; quantity_servings: number; address?: string; status: string; organization_name?: string; created_at?: string }>>([]);
  const [addFoodLoading, setAddFoodLoading] = useState(false);
  const [addFoodMessage, setAddFoodMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addFoodForm, setAddFoodForm] = useState({ food_name: '', food_type: 'meals' as const, quantity_servings: 10, description: '', address: '' });
  const [addFoodStep, setAddFoodStep] = useState<'form' | 'check'>('check');
  const [addFoodAssessment, setAddFoodAssessment] = useState<OrgFoodAssessment | null>(null);
  const [foodListLoading, setFoodListLoading] = useState(true);
  const report = defaultReport;
  
  // Get translated bar data
  const overallBarData = [
    { name: t('peopleServed'), value: 12450, fill: '#10b981' },
    { name: t('mealsDelivered'), value: 18620, fill: '#059669' },
    { name: t('deliveries'), value: 892, fill: '#0d9488' },
    { name: t('volunteers'), value: 34, fill: '#14b8a6' },
  ];

  const loadOrganisationFood = () => {
    setFoodListLoading(true);
    organisationApi.getMyFood()
      .then((res) => {
        setOrganisationFood(Array.isArray(res.data?.data) ? res.data.data : []);
      })
      .catch(() => setOrganisationFood([]))
      .finally(() => setFoodListLoading(false));
  };

  useEffect(() => { loadOrganisationFood(); }, []);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFoodForm.food_name.trim() || !addFoodForm.address.trim()) {
      setAddFoodMessage({ type: 'error', text: t('foodNameAndAddressRequired') });
      return;
    }
    setAddFoodLoading(true);
    setAddFoodMessage(null);
    organisationApi.postFood({
      food_name: addFoodForm.food_name.trim(),
      food_type: addFoodForm.food_type,
      quantity_servings: Number(addFoodForm.quantity_servings) || 1,
      description: addFoodForm.description.trim() || undefined,
      address: addFoodForm.address.trim(),
      freshness_score: addFoodAssessment?.qualityScore ?? undefined,
      quality_score: addFoodAssessment?.qualityScore ?? undefined,
    })
      .then(() => {
        setAddFoodMessage({ type: 'success', text: t('foodAddedSuccess') });
        setAddFoodForm({ food_name: '', food_type: 'meals', quantity_servings: 10, description: '', address: '' });
        setAddFoodAssessment(null);
        setAddFoodStep('check'); // Reset to freshness check step
        loadOrganisationFood();
      })
      .catch((err: any) => {
        setAddFoodMessage({ type: 'error', text: err.response?.data?.message || t('failedToAddFood') });
      })
      .finally(() => setAddFoodLoading(false));
  };

  const handleFreshnessPass = (assessment: OrgFoodAssessment) => {
    setAddFoodAssessment(assessment);
    setAddFoodStep('form');
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'report' as ActivePage, icon: FileText, label: t('adminOrgReport') },
    { id: 'postFood' as ActivePage, icon: Plus, label: t('postFood') },
    { id: 'settings' as ActivePage, icon: SettingsIcon, label: t('settings') },
  ];

  const handleNavigate = (id: ActivePage) => {
    if (id === 'settings') {
      setShowSettings(true);
    } else {
      setActivePage(id);
      setSelectedCardId(null);
    }
  };

  if (showSettings) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gradient-to-br from-blue-950 via-blue-950 to-slate-900' : 'bg-white'
      }`}>
        <button
          onClick={() => setShowSettings(false)}
          className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
            darkMode
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-slate-900'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToDashboard')}
        </button>
        <SettingsPage 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
          language={language} 
          setLanguage={setLanguage} 
        />
      </div>
    );
  }

  if (selectedCardId) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gradient-to-br from-blue-950 via-blue-950 to-slate-900' : 'bg-white'
      }`}>
        <ReportCardDetailView
          cardId={selectedCardId}
          darkMode={darkMode}
          onBack={() => setSelectedCardId(null)}
        />
      </div>
    );
  }

  const cardClass = (clickable?: boolean) =>
    `rounded-xl p-4 border transition-all duration-200 ${
      darkMode ? 'bg-blue-900/40 border-blue-600/30' : 'bg-slate-50 border-slate-200'
    } ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}`;

  return (
    <AppShell
      title={t('adminOrgReport')}
      subtitle={`${user.name} · ${user.role}`}
      logo={<AppLogo size="header" className="h-10 sm:h-12 w-auto max-w-[200px] sm:max-w-[260px]" />}
      sidebarItems={sidebarItems}
      activeId={activePage}
      onNavigate={handleNavigate}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      languageLabels={NATIVE_LANGUAGE_LABELS}
      user={user}
      onLogout={onLogout}
      onSettingsClick={() => setShowSettings(true)}
    >
      {activePage === 'postFood' ? (
        <div className="max-w-2xl mx-auto">
          <div className={`rounded-2xl border p-6 ${
            darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <Plus className="w-6 h-6" />
              {t('postFood')}
            </h2>
            <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {t('addFoodDonorsDesc')} Freshness check is required before posting.
            </p>
            {addFoodStep === 'check' ? (
              <div className="max-w-xl">
                <div className="mb-4">
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {t('freshCheck')} <span className="text-red-500">*</span> (Required)
                  </span>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Please complete the freshness check before posting food.
                  </p>
                </div>
                <FreshFoodChecker
                  darkMode={darkMode}
                  onPass={handleFreshnessPass as (a: unknown) => void}
                  onFail={() => {
                    // Don't allow skipping - user must pass freshness check
                    setAddFoodMessage({ type: 'error', text: t('freshnessCheckRequired') || 'Freshness check is required. Please ensure your food passes the quality check.' });
                  }}
                />
              </div>
            ) : (
              <form onSubmit={handleAddFood} className="space-y-4 max-w-xl">
                {addFoodAssessment && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                    darkMode ? 'bg-blue-900/40 border-blue-600/40' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <Zap className={`w-5 h-5 shrink-0 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`text-sm font-medium truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {t('freshness')}: {addFoodAssessment.freshness} – {addFoodAssessment.qualityScore}%
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddFoodAssessment(null)}
                      className={`p-1.5 rounded-lg shrink-0 transition ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'}`}
                      aria-label={t('clearFreshnessResult')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('foodName')} *</label>
                  <input
                    type="text"
                    value={addFoodForm.food_name}
                    onChange={(e) => setAddFoodForm((f) => ({ ...f, food_name: e.target.value }))}
                    placeholder={t('foodNamePlaceholder')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('type')}</label>
                    <select
                      aria-label={t('foodType')}
                      value={addFoodForm.food_type}
                      onChange={(e) => setAddFoodForm((f) => ({ ...f, food_type: e.target.value as typeof addFoodForm.food_type }))}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      {FOOD_TYPES.map((ft) => (
                        <option key={ft} value={ft}>
                          {t(`foodType_${ft}`) || ft.replace(/^./, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('quantity')} *</label>
                    <input
                      type="number"
                      min="1"
                      value={addFoodForm.quantity_servings}
                      onChange={(e) => setAddFoodForm((f) => ({ ...f, quantity_servings: Number(e.target.value) || 1 }))}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('address')} *</label>
                  <input
                    type="text"
                    value={addFoodForm.address}
                    onChange={(e) => setAddFoodForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder={t('addressPlaceholder')}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t('description')}</label>
                  <textarea
                    value={addFoodForm.description}
                    onChange={(e) => setAddFoodForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={t('descriptionPlaceholder')}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border text-sm ${
                      darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                {addFoodMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    addFoodMessage.type === 'success'
                      ? darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'
                      : darkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-700'
                  }`}>
                    {addFoodMessage.text}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={addFoodLoading}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addFoodLoading ? t('adding') : t('addFood')}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overall summary */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <BarChart3 className="w-5 h-5" />
            {t('overallReport')}
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('overallReportDesc')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCardId('peopleServed')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('peopleServed')}
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.peopleServed.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('totalBeneficiaries')} · {t('clickForDetails')}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCardId('mealsDelivered')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Utensils className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('mealsDelivered')}
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.mealsDelivered.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('allTime')} · {t('clickForDetails')}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCardId('deliveriesCompleted')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Truck className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('deliveriesCompleted')}
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.deliveriesCompleted.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('successfulRuns')} · {t('clickForDetails')}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCardId('activeVolunteers')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('activeVolunteers')}
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.activeVolunteers}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {t('thisMonth')} · {t('clickForDetails')}
              </p>
            </button>
          </div>
        </section>

        {/* Post Food section removed - now accessible via hamburger menu */}

        {/* This month vs last month */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <TrendingUp className="w-5 h-5" />
            {t('monthlyComparison')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('thisMonthMeals')}</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {report.thisMonth.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t('lastMonthMeals')}</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {report.lastMonth.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                +{Math.round(((report.thisMonth - report.lastMonth) / report.lastMonth) * 100)}% {t('vsLastMonth')}
              </p>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <BarChart3 className="w-5 h-5" />
            {t('impactTrends')}
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('impactTrendsDesc')}
          </p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#064e3b' : '#fff',
                    border: darkMode ? '1px solid #047857' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: darkMode ? '#d1fae5' : '#0f172a' }}
                  formatter={(value: number) => [value.toLocaleString(), '']}
                />
                <Line type="monotone" dataKey="meals" name={t('meals')} stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                <Line type="monotone" dataKey="people" name={t('peopleServed')} stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <TrendingUp className="w-5 h-5" />
            {t('overviewAllTime')}
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {t('keyMetricsComparison')}
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallBarData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis type="number" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                <YAxis type="category" dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={12} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#064e3b' : '#fff',
                    border: darkMode ? '1px solid #047857' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), '']}
                />
                <Bar dataKey="value" name={t('value')} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Environmental impact */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-blue-900/30 border-blue-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Environmental impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCardId('co2Prevented')}
              className={`text-left p-4 rounded-xl transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-blue-900/40 hover:bg-blue-900/50' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>CO₂ prevented</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.co2PreventedKg.toLocaleString()} kg
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Click for details</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCardId('foodRescued')}
              className={`text-left p-4 rounded-xl transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-blue-900/40 hover:bg-blue-900/50' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Food rescued</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.foodRescuedKg.toLocaleString()} kg
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>Click for details</p>
            </button>
          </div>
        </section>
      </div>
      )}
    </AppShell>
  );
};

export default OrganisationReport;
