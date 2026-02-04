import React from 'react';
import { BarChart3, Users, Utensils, Truck, LogOut, Building2, TrendingUp } from 'lucide-react';

interface OrganisationReportProps {
  darkMode: boolean;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

const OrganisationReport: React.FC<OrganisationReportProps> = ({ darkMode, user, onLogout }) => {
  const report = {
    peopleServed: 12450,
    mealsDelivered: 18620,
    deliveriesCompleted: 892,
    activeVolunteers: 34,
    thisMonth: 2150,
    lastMonth: 1980,
    co2PreventedKg: 4650,
    foodRescuedKg: 9320,
  };

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
          <button
            type="button"
            onClick={onLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              darkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-800/50' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
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
            Summary of your organisation&apos;s impact and activity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-slate-50 border-slate-200'
            }`}>
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
                Total beneficiaries
              </p>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-slate-50 border-slate-200'
            }`}>
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
                All time
              </p>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-slate-50 border-slate-200'
            }`}>
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
                Successful runs
              </p>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-slate-50 border-slate-200'
            }`}>
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
                This month
              </p>
            </div>
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

        {/* Environmental impact */}
        <section className={`rounded-2xl border p-6 ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Environmental impact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-900/40' : 'bg-slate-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>CO₂ prevented</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.co2PreventedKg.toLocaleString()} kg
              </p>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-emerald-900/40' : 'bg-slate-50'}`}>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Food rescued</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {report.foodRescuedKg.toLocaleString()} kg
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrganisationReport;
