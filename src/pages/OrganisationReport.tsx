import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Utensils, Truck, TrendingUp, ArrowLeft, Plus, MapPin } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { organisationApi } from '@/services/api';

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

const FOOD_TYPES = ['meals', 'vegetables', 'baked', 'dairy', 'fruits', 'others'] as const;

const OrganisationReport: React.FC<OrganisationReportProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<CardId | null>(null);
  const [organisationFood, setOrganisationFood] = useState<Array<{ id: number; food_name: string; food_type: string; quantity_servings: number; address?: string; status: string; organization_name?: string; created_at?: string }>>([]);
  const [addFoodLoading, setAddFoodLoading] = useState(false);
  const [addFoodMessage, setAddFoodMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addFoodForm, setAddFoodForm] = useState({ food_name: '', food_type: 'meals' as const, quantity_servings: 10, description: '', address: '' });
  const report = defaultReport;

  const loadOrganisationFood = () => {
    organisationApi.getMyFood()
      .then((res) => setOrganisationFood(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setOrganisationFood([]));
  };

  useEffect(() => { loadOrganisationFood(); }, []);

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFoodForm.food_name.trim() || !addFoodForm.address.trim()) {
      setAddFoodMessage({ type: 'error', text: 'Food name and address are required.' });
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
    })
      .then(() => {
        setAddFoodMessage({ type: 'success', text: 'Food added. It will appear on the volunteer page.' });
        setAddFoodForm({ food_name: '', food_type: 'meals', quantity_servings: 10, description: '', address: '' });
        loadOrganisationFood();
      })
      .catch((err: any) => {
        setAddFoodMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add food.' });
      })
      .finally(() => setAddFoodLoading(false));
  };

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
    <AppShell
      title="Organisation Report"
      subtitle={`${user.name} · ${user.role}`}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      languageLabels={languageLabels}
      user={user}
      onLogout={onLogout}
    >
      <div className="space-y-8">
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

        {/* Add food – reflected on volunteer page */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            <Plus className="w-5 h-5" />
            Add food
          </h2>
          <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Add food that needs pickup or delivery. It will appear on the volunteer page for volunteers to see and respond.
          </p>
          <form onSubmit={handleAddFood} className="space-y-4 max-w-xl">
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Food name *</label>
              <input
                type="text"
                value={addFoodForm.food_name}
                onChange={(e) => setAddFoodForm((f) => ({ ...f, food_name: e.target.value }))}
                placeholder="e.g. Rice and curry, Bread rolls"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Type</label>
                <select
                  aria-label="Food type"
                  value={addFoodForm.food_type}
                  onChange={(e) => setAddFoodForm((f) => ({ ...f, food_type: e.target.value as typeof addFoodForm.food_type }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  {FOOD_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Servings</label>
                <input
                  type="number"
                  min={1}
                  aria-label="Number of servings"
                  placeholder="e.g. 10"
                  value={addFoodForm.quantity_servings}
                  onChange={(e) => setAddFoodForm((f) => ({ ...f, quantity_servings: Number(e.target.value) || 1 }))}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Address / pickup location *</label>
              <input
                type="text"
                value={addFoodForm.address}
                onChange={(e) => setAddFoodForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="e.g. 123 Main St, Chennai"
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Description (optional)</label>
              <textarea
                value={addFoodForm.description}
                onChange={(e) => setAddFoodForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Any notes for volunteers"
                rows={2}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${
                  darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>
            {addFoodMessage && (
              <p className={`text-sm ${addFoodMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {addFoodMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={addFoodLoading}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                darkMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50'
              }`}
            >
              {addFoodLoading ? 'Adding…' : 'Add food'}
            </button>
          </form>
          {organisationFood.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Food you added (visible to volunteers)</h3>
              <ul className="space-y-2">
                {organisationFood.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                    }`}
                  >
                    <Utensils className={`w-4 h-4 shrink-0 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.food_name}</p>
                      <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3" /> {item.address}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      {item.quantity_servings} servings · {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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
      </div>
    </AppShell>
  );
};

export default OrganisationReport;
