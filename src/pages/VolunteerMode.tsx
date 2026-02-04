import React from 'react';
import { Truck, LogOut, Package } from 'lucide-react';
import { deliveryApi } from '@/services/api';

interface VolunteerModeProps {
  darkMode: boolean;
  user: { name: string; email: string; role: string };
  onLogout: () => void;
}

const VolunteerMode: React.FC<VolunteerModeProps> = ({ darkMode, user, onLogout }) => {
  const [deliveries, setDeliveries] = React.useState<Array<{ id: string; food_name: string; status: string; address?: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    deliveryApi.getVolunteerDeliveries()
      .then((res) => setDeliveries(Array.isArray(res.data?.data) ? res.data.data : res.data ? [res.data] : []))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900' : 'bg-white'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${
        darkMode ? 'bg-emerald-950/98 border-emerald-700/40' : 'bg-white/98 border-slate-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className={`w-8 h-8 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              Volunteer Mode
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {user.name}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                darkMode ? 'bg-red-900/40 text-red-300 hover:bg-red-800/50' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className={`mb-6 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          View and complete your assigned deliveries here.
        </p>

        <div className={`rounded-xl border overflow-hidden ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className={`px-4 py-3 border-b ${darkMode ? 'border-emerald-700/50' : 'border-slate-200'}`}>
            <h2 className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              My deliveries
            </h2>
          </div>
          <div className="p-4">
            {loading ? (
              <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Loading…</p>
            ) : deliveries.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-12 text-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Package className="w-12 h-12 mb-3 opacity-60" />
                <p>No deliveries assigned yet.</p>
                <p className="text-sm mt-1">Your organisation will assign deliveries to you.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {deliveries.map((d) => (
                  <li
                    key={d.id}
                    className={`p-3 rounded-lg border ${
                      darkMode ? 'bg-emerald-900/20 border-emerald-600/20' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{d.food_name}</p>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Status: {d.status} {d.address && ` · ${d.address}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VolunteerMode;
