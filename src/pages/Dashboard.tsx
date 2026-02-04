import React, { useState } from 'react';
import { Menu, X, Settings as SettingsIcon, ArrowRight, TrendingUp, Users, MapPin, Clock, Shield, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PostSurplusPage from './PostSurplus';

interface DashboardProps {
  onSettingsClick: () => void;
  darkMode: boolean;
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

export const Dashboard: React.FC<DashboardProps> = ({ onSettingsClick, darkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState<'dashboard' | 'post' | 'matches' | 'impact'>('dashboard');

  const features = [
    { id: 'post', icon: '📤', label: 'Post Food', color: 'from-blue-500 to-blue-600' },
    { id: 'matches', icon: '🎯', label: 'Matches', color: 'from-purple-500 to-purple-600' },
    { id: 'impact', icon: '🌍', label: 'Impact', color: 'from-green-500 to-green-600' },
  ];

  const navigationItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', color: '#72891B' },
    { id: 'post', icon: '📤', label: 'Post Surplus', color: '#0D9488' },
    { id: 'matches', icon: '🎯', label: 'My Matches', color: '#9333EA' },
    { id: 'impact', icon: '📊', label: 'Impact', color: '#16A34A' },
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
    }`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-lg transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-900/95 to-gray-800/95 border-b border-gray-700/50' 
          : 'bg-gradient-to-r from-white/95 to-gray-50/95 border-b border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="text-3xl">🌱</div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ResQ Meal</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Food Rescue Platform</p>
              </div>
            </div>
          </div>

          <button
            onClick={onSettingsClick}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] w-64 transition-all duration-300 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        darkMode 
          ? 'bg-gray-800/95 border-r border-gray-700/50' 
          : 'bg-white/95 border-r border-gray-200/50'
      } backdrop-blur-lg z-30`}>
        <nav className="p-6 space-y-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id as any);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activePage === item.id
                  ? darkMode
                    ? 'bg-gradient-to-r from-gray-700 to-gray-600 shadow-lg'
                    : 'bg-gradient-to-r from-gray-100 to-gray-50 shadow-md'
                  : darkMode
                  ? 'hover:bg-gray-700/50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`font-semibold transition-all duration-200 ${
                activePage === item.id
                  ? darkMode ? 'text-white' : 'text-gray-900'
                  : darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
              {activePage === item.id && (
                <ArrowRight className={`w-4 h-4 ml-auto ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`${sidebarOpen ? 'md:ml-64' : ''} transition-all duration-300`}>
        {/* Dashboard Page */}
        {activePage === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
            {/* Welcome Card */}
            <div className={`rounded-2xl p-8 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl'
                : 'bg-gradient-to-br from-white to-gray-50 shadow-lg'
            }`}>
              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome back! 👋
              </h2>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Here's what's happening with your food rescue mission today
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActivePage(feature.id as any)}
                  className={`group rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden ${
                    darkMode ? 'shadow-xl' : 'shadow-lg'
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
                { icon: '🍽️', label: 'Meals Saved', value: '3,450', color: 'from-green-500/20 to-green-600/20' },
                { icon: '⚖️', label: 'Food Diverted', value: '8,625 kg', color: 'from-blue-500/20 to-blue-600/20' },
                { icon: '💨', label: 'CO₂ Prevented', value: '21.5 tons', color: 'from-purple-500/20 to-purple-600/20' },
                { icon: '💧', label: 'Water Saved', value: '8.6M L', color: 'from-cyan-500/20 to-cyan-600/20' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-6 transition-all duration-300 border ${
                    darkMode
                      ? `bg-gradient-to-br ${stat.color} border-gray-700 shadow-lg`
                      : `bg-gradient-to-br ${stat.color} border-gray-200 shadow-md`
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </p>
                    </div>
                    <span className="text-4xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Card */}
            <div className={`rounded-2xl p-8 transition-all duration-300 ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl'
                : 'bg-gradient-to-br from-white to-gray-50 shadow-lg'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <TrendingUp className="w-6 h-6" />
                  Weekly Impact Trend
                </h3>
              </div>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={impactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="date" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        color: darkMode ? '#fff' : '#000',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="meals"
                      stroke="#16a34a"
                      strokeWidth={3}
                      name="Meals Saved"
                      dot={{ fill: '#16a34a', r: 5 }}
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

// Post Surplus Page is now imported at the top of the file
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📤 Post Your Surplus Food
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Share excess food with NGOs and make an impact
        </p>
      </div>

      {/* Form Card */}
      <div className={`rounded-2xl p-8 transition-all duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl'
          : 'bg-gradient-to-br from-white to-gray-50 shadow-lg'
      }`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Food Name *
              </label>
              <input
                type="text"
                value={formData.foodName}
                onChange={(e) => handleChange('foodName', e.target.value)}
                placeholder="e.g., Fresh Grilled Vegetables"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Quantity (servings) *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="e.g., 25"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Food Type *
              </label>
              <select
                value={formData.foodType}
                onChange={(e) => handleChange('foodType', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-green-500'
                    : 'bg-white border-gray-200 text-gray-900 focus:border-green-500'
                }`}
              >
                <option value="meals">🍽️ Meals</option>
                <option value="vegetables">🥬 Vegetables</option>
                <option value="baked">🍞 Baked Goods</option>
                <option value="dairy">🥛 Dairy</option>
                <option value="fruits">🍎 Fruits</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Expiry Time (minutes) *
              </label>
              <input
                type="number"
                value={formData.expiryTime}
                onChange={(e) => handleChange('expiryTime', e.target.value)}
                placeholder="e.g., 45"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Downtown, Chennai"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Additional details, allergens, storage info..."
              className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none h-32 resize-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            📤 Publish Post
          </button>
        </form>
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
      distance: '1.2 km',
      status: 'MATCHED',
      meals: 25,
    },
    {
      id: 2,
      foodName: 'Cooked Pasta Dishes',
      ngo: 'Community Kitchen',
      distance: '2.5 km',
      status: 'ACCEPTED',
      meals: 40,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 ${
          darkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        ← Back to Dashboard
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 Your Matches
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          See which NGOs are interested in your food
        </p>
      </div>

      <div className="space-y-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className={`rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
              darkMode
                ? 'bg-gradient-to-br from-gray-800 to-gray-700 shadow-xl hover:shadow-2xl'
                : 'bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {match.foodName}
                </h3>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Requested by: <span className="font-semibold">{match.ngo}</span>
                </p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    📍 {match.distance}
                  </span>
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    🍽️ {match.meals} servings
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${
                  match.status === 'MATCHED'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {match.status}
                </span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-all duration-200">
                ✅ Accept
              </button>
              <button className={`flex-1 border-2 font-bold py-2 rounded-lg transition-all duration-200 ${
                darkMode
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-8 transition-all duration-200 ${
          darkMode
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        ← Back to Dashboard
      </button>

      <div className={`rounded-2xl p-8 mb-8 transition-all duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-800 to-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50'
      }`}>
        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 Your Impact
        </h2>
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          See how much difference you're making
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: '🍽️', label: 'Total Meals', value: '3,450', color: 'from-green-500/20 to-green-600/20' },
          { icon: '⚖️', label: 'Food Diverted', value: '8,625 kg', color: 'from-blue-500/20 to-blue-600/20' },
          { icon: '💨', label: 'CO₂ Saved', value: '21.5 tons', color: 'from-purple-500/20 to-purple-600/20' },
          { icon: '💧', label: 'Water Saved', value: '8.6M L', color: 'from-cyan-500/20 to-cyan-600/20' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-8 transition-all duration-300 border ${
              darkMode
                ? `bg-gradient-to-br ${stat.color} border-gray-700 shadow-lg`
                : `bg-gradient-to-br ${stat.color} border-gray-200 shadow-md`
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-4xl font-bold mt-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <span className="text-5xl opacity-30">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
