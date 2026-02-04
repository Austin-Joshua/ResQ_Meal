import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, Users, Utensils, Truck, LogOut, Building2, TrendingUp, Sun, Moon, Globe, ChevronDown, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type CardId = 'peopleServed' | 'mealsDelivered' | 'deliveriesCompleted' | 'activeVolunteers' | 'co2Prevented' | 'foodRescued';

interface OrganisationReportProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (v: 'en' | 'ta' | 'hi') => void;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

const languageLabels = { en: 'English', ta: 'Tamil', hi: 'Hindi' };

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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

const overallBarData = [
  { name: 'People served', value: 12450, fill: '#10b981' },
  { name: 'Meals delivered', value: 18620, fill: '#059669' },
  { name: 'Deliveries', value: 892, fill: '#0d9488' },
  { name: 'Volunteers', value: 34, fill: '#14b8a6' },
];

// Extended data for detail views (sample breakdowns)
const extendedData: Record<CardId, { title: string; subtitle: string; rows: { label: string; value: string }[] }> = {
  peopleServed: {
    title: 'People served',
    subtitle: 'Total beneficiaries',
    rows: [
      { label: 'This month', value: '1,240' },
      { label: 'Last month', value: '1,180' },
      { label: 'Quarter to date', value: '3,650' },
      { label: 'Year to date', value: '12,450' },
      { label: 'Top location', value: 'Downtown Community Kitchen' },
    ],
  },
  mealsDelivered: {
    title: 'Meals delivered',
    subtitle: 'All time',
    rows: [
      { label: 'This month', value: '2,150' },
      { label: 'Last month', value: '1,980' },
      { label: 'Average per delivery', value: '21 meals' },
      { label: 'Total all time', value: '18,620' },
      { label: 'Peak day this month', value: '142 meals (Feb 3)' },
    ],
  },
  deliveriesCompleted: {
    title: 'Deliveries completed',
    subtitle: 'Successful runs',
    rows: [
      { label: 'This month', value: '98' },
      { label: 'Last month', value: '92' },
      { label: 'On-time rate', value: '94%' },
      { label: 'Total successful', value: '892' },
      { label: 'Avg. distance per run', value: '4.2 km' },
    ],
  },
  activeVolunteers: {
    title: 'Active volunteers',
    subtitle: 'This month',
    rows: [
      { label: 'New this month', value: '5' },
      { label: 'Completed 5+ deliveries', value: '12' },
      { label: 'Top volunteer (deliveries)', value: 'Arjun R. (28)' },
      { label: 'Total active', value: '34' },
      { label: 'Retention rate', value: '88%' },
    ],
  },
  co2Prevented: {
    title: 'CO₂ prevented',
    subtitle: 'Equivalent emissions avoided',
    rows: [
      { label: 'This month', value: '520 kg' },
      { label: 'Last month', value: '480 kg' },
      { label: 'Year to date', value: '4,650 kg' },
      { label: 'Equivalent car km', value: '~18,600 km' },
      { label: 'Equivalent trees (1 year)', value: '~210 trees' },
    ],
  },
  foodRescued: {
    title: 'Food rescued',
    subtitle: 'Weight diverted from waste',
    rows: [
      { label: 'This month', value: '1,040 kg' },
      { label: 'Last month', value: '990 kg' },
      { label: 'Year to date', value: '9,320 kg' },
      { label: 'Primary category', value: 'Prepared meals (62%)' },
      { label: 'Partners involved', value: '8 restaurants, 3 NGOs' },
    ],
  },
};

function ReportCardDetailView({
  cardId,
  darkMode,
  onBack,
}: {
  cardId: CardId;
  darkMode: boolean;
  onBack: () => void;
}) {
  const data = extendedData[cardId];
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={onBack}
        className={`flex items-center gap-2 mb-6 px-3 py-2 rounded-lg text-sm font-medium transition ${
          darkMode ? 'text-slate-300 hover:bg-emerald-900/40' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to report
      </button>
      <div className={`rounded-2xl border p-6 ${
        darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          {data.title}
        </h2>
        <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {data.subtitle} — extended breakdown
        </p>
        <dl className="space-y-4">
          {data.rows.map((row) => (
            <div key={row.label} className={`flex justify-between items-center py-2 border-b ${
              darkMode ? 'border-emerald-700/30' : 'border-slate-100'
            }`}>
              <dt className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{row.label}</dt>
              <dd className={`font-semibold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{row.value}</dd>
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

const OrganisationReport: React.FC<OrganisationReportProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<CardId | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const report = defaultReport;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) setLanguageMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) setProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedCardId) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900' : 'bg-white'
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
      darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-slate-50 border-slate-200'
    } ${clickable ? 'cursor-pointer hover:ring-2 hover:ring-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500' : ''}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${
        darkMode ? 'bg-emerald-950/98 border-emerald-700/40' : 'bg-white/98 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Organisation Report
              </h1>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {user.name} · {user.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language dropdown */}
            <div className="relative" ref={languageMenuRef}>
              <button
                type="button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  darkMode ? 'bg-emerald-800/30 text-slate-200 hover:bg-emerald-700/40' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Language"
              >
                <Globe className="w-4 h-4" />
                <span>{languageLabels[language]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {languageMenuOpen && (
                <div
                  className={`absolute right-0 top-full mt-1 min-w-[140px] rounded-lg border shadow-lg py-1 z-50 ${
                    darkMode ? 'bg-emerald-950/95 border-emerald-600/30' : 'bg-white border-slate-200'
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
                          ? darkMode ? 'bg-emerald-600/30 text-emerald-200' : 'bg-emerald-50 text-emerald-800'
                          : darkMode ? 'text-slate-200 hover:bg-emerald-900/40' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {languageLabels[lang]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light/Dark mode toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-lg transition ${
                darkMode ? 'hover:bg-emerald-800/40 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            {/* Profile icon & dropdown (works for all org users – seed or user-created credentials) */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className={`p-2.5 rounded-lg transition ${
                  darkMode ? 'hover:bg-emerald-800/40 text-slate-200' : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Profile"
                aria-label="Open profile menu"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  darkMode ? 'bg-emerald-600/30 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {getInitials(user.name)}
                </div>
              </button>
              {profileMenuOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-64 rounded-lg border shadow-lg py-2 z-50 ${
                    darkMode ? 'bg-emerald-950/95 border-emerald-600/30' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-emerald-700/50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                        darkMode ? 'bg-emerald-600/30 text-emerald-200' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {getInitials(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {user.name}
                        </p>
                        <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {user.email}
                        </p>
                        <p className={`text-xs mt-1 capitalize ${darkMode ? 'text-amber-400' : 'text-emerald-600'}`}>
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onLogout();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                      darkMode ? 'text-red-300 hover:bg-red-900/30' : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Overall summary */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <BarChart3 className="w-5 h-5" />
            Overall report
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Summary of your organisation&apos;s impact and activity. Click a card for extended details.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCardId('peopleServed')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  People served
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.peopleServed.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Total beneficiaries · Click for details
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCardId('mealsDelivered')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Utensils className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Meals delivered
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.mealsDelivered.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                All time · Click for details
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCardId('deliveriesCompleted')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Truck className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Deliveries completed
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.deliveriesCompleted.toLocaleString()}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Successful runs · Click for details
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCardId('activeVolunteers')}
              className={`text-left ${cardClass(true)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Active volunteers
                </span>
              </div>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.activeVolunteers}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                This month · Click for details
              </p>
            </button>
          </div>
        </section>

        {/* This month vs last month */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <TrendingUp className="w-5 h-5" />
            Monthly comparison
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>This month (meals)</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {report.thisMonth.toLocaleString()}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Last month (meals)</p>
              <p className={`text-3xl font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {report.lastMonth.toLocaleString()}
              </p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                +{Math.round(((report.thisMonth - report.lastMonth) / report.lastMonth) * 100)}% vs last month
              </p>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <BarChart3 className="w-5 h-5" />
            Impact trends
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Monthly meals delivered and people served over the last 6 months.
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
                <Line type="monotone" dataKey="meals" name="Meals" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                <Line type="monotone" dataKey="people" name="People served" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <TrendingUp className="w-5 h-5" />
            Overview (all time)
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Key metrics comparison.
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
                <Bar dataKey="value" name="Value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Environmental impact */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Environmental impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedCardId('co2Prevented')}
              className={`text-left p-4 rounded-xl transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-emerald-900/40 hover:bg-emerald-900/50' : 'bg-slate-50 hover:bg-slate-100'
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
              className={`text-left p-4 rounded-xl transition-all duration-200 cursor-pointer hover:ring-2 hover:ring-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-emerald-900/40 hover:bg-emerald-900/50' : 'bg-slate-50 hover:bg-slate-100'
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
      </main>
    </div>
  );
};

export default OrganisationReport;
