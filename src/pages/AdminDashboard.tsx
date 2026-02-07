import React, { useState, useRef, useEffect } from 'react';
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import { useMode, MODE_METADATA } from '@/context/ModeContext';
import { BarChart3, Users, TrendingUp, AlertTriangle, CheckCircle, Home, Settings } from 'lucide-react';
interface AdminDashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  user: { id: number; name: string; email: string; role: string };
  onLogout: () => void;
}

interface PlatformStats {
  totalUsers: number;
  activeVolunteers: number;
  registeredNGOs: number;
  registeredRestaurants: number;
  totalDeliveries: number;
  mealsDelivered: number;
  wasteReduced: number;
  systemHealth: number;
}

interface UserActivity {
  id: number;
  user: string;
  mode: 'volunteer' | 'restaurant' | 'ngo' | 'admin';
  action: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const { currentMode, modeHistory } = useMode();
  const [activePage, setActivePage] = useState('dashboard');
  
  const navigationItems: AppShellNavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 3245,
    activeVolunteers: 487,
    registeredNGOs: 52,
    registeredRestaurants: 128,
    totalDeliveries: 15320,
    mealsDelivered: 184560,
    wasteReduced: 2340,
    systemHealth: 98,
  });

  const [userActivities] = useState<UserActivity[]>([
    {
      id: 1,
      user: 'Raj Kumar',
      mode: 'volunteer',
      action: 'Completed delivery',
      timestamp: '2 mins ago',
      status: 'success',
    },
    {
      id: 2,
      user: 'Taj Restaurant',
      mode: 'restaurant',
      action: 'Posted 50 meals',
      timestamp: '5 mins ago',
      status: 'success',
    },
    {
      id: 3,
      user: 'Velachery NGO',
      mode: 'ngo',
      action: 'Requested food',
      timestamp: '8 mins ago',
      status: 'success',
    },
    {
      id: 4,
      user: 'API Service',
      mode: 'admin',
      action: 'Database backup completed',
      timestamp: '15 mins ago',
      status: 'success',
    },
  ]);

  const modeStats = [
    { name: 'Volunteer', count: stats.activeVolunteers, color: 'blue', icon: '🟦' },
    { name: 'Restaurant', count: stats.registeredRestaurants, color: 'orange', icon: '🟧' },
    { name: 'NGO', count: stats.registeredNGOs, color: 'green', icon: '🟩' },
  ];

  return (
    <AppShell
      title="Admin Dashboard"
      subtitle="System analytics, monitoring & management"
      sidebarItems={navigationItems}
      activeId={activePage}
      onNavigate={(id) => setActivePage(id)}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      languageLabels={{ en: 'English', ta: 'Tamil', hi: 'Hindi' }}
      user={user}
      onLogout={onLogout}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Health Alert */}
          <div className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-3 ${
            stats.systemHealth >= 95
              ? darkMode
                ? 'bg-green-900/30 border-green-700'
                : 'bg-green-50 border-green-200'
              : darkMode
              ? 'bg-yellow-900/30 border-yellow-700'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className={`flex-shrink-0 ${
              stats.systemHealth >= 95
                ? 'text-green-500'
                : 'text-yellow-600'
            }`}>
              {stats.systemHealth >= 95 ? 
                <CheckCircle className="w-6 h-6" /> : 
                <AlertTriangle className="w-6 h-6" />
              }
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${
                stats.systemHealth >= 95
                  ? darkMode
                    ? 'text-green-200'
                    : 'text-green-900'
                  : darkMode
                  ? 'text-yellow-200'
                  : 'text-yellow-900'
              }`}>
                System Health: {stats.systemHealth}%
              </p>
              <p className={`text-sm ${
                stats.systemHealth >= 95
                  ? darkMode
                    ? 'text-green-300/70'
                    : 'text-green-700/70'
                  : darkMode
                  ? 'text-yellow-300/70'
                  : 'text-yellow-700/70'
              }`}>
                All systems operational. Database sync completed successfully.
              </p>
            </div>
          </div>

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
              { label: 'Active Volunteers', value: stats.activeVolunteers, icon: '🚗', color: 'cyan' },
              { label: 'Total Deliveries', value: stats.totalDeliveries, icon: '📦', color: 'purple' },
              { label: 'Meals Delivered', value: stats.mealsDelivered, icon: '🍽️', color: 'orange' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? `bg-${stat.color}-900/20 border-${stat.color}-700`
                    : `bg-${stat.color}-50 border-${stat.color}-200`
                }`}
              >
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Platform Analytics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mode Usage Stats */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode
                  ? 'bg-purple-900/30 border-purple-700'
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <BarChart3 className="w-5 h-5" />
                  Mode Distribution
                </h2>

                <div className="space-y-4">
                  {modeStats.map((mode) => {
                    // Calculate width to determine which predefined width class to use
                    const widthPercentage = (mode.count / stats.totalUsers) * 100;
                    const colorMap: { [key: string]: string } = {
                      'blue': 'bg-blue-600',
                      'cyan': 'bg-cyan-600',
                      'orange': 'bg-orange-600',
                      'green': 'bg-green-600',
                    };
                    const barRef = useRef<HTMLDivElement>(null);
                    useEffect(() => {
                      if (barRef.current) {
                        barRef.current.style.width = `${widthPercentage}%`;
                      }
                    }, [widthPercentage]);
                    return (
                      <div key={mode.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {mode.icon} {mode.name}
                          </span>
                          <span className={`font-bold ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                            {mode.count}
                          </span>
                        </div>
                        <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                          <div
                            ref={barRef}
                            className={`h-full transition-all ${colorMap[mode.color] || 'bg-slate-600'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Impact Metrics */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-green-50 border-green-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  <TrendingUp className="w-5 h-5" />
                  Platform Impact
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Meals Delivered
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      {stats.mealsDelivered.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Waste Reduced (kg)
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      {stats.wasteReduced.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Avg Meals/Delivery
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      {(stats.mealsDelivered / stats.totalDeliveries).toFixed(1)}
                    </p>
                  </div>

                  <div>
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Efficiency Rate
                    </p>
                    <p className={`text-3xl font-bold mt-1 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                      {((stats.mealsDelivered / (stats.wasteReduced / 10)) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  📊 Recent Activity
                </h2>

                <div className="space-y-2">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className={`p-3 rounded-lg flex items-center gap-3 ${
                      darkMode
                        ? 'bg-slate-700/30'
                        : 'bg-slate-50'
                    }`}>
                      <span className="text-lg">
                        {MODE_METADATA[activity.mode].icon}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {activity.user}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {activity.action} • {activity.timestamp}
                        </p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success'
                          ? 'bg-green-500'
                          : activity.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Configuration */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  ⚙️ Configuration
                </h3>

                <div className="space-y-3">
                  <button className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    darkMode
                      ? 'bg-purple-600/30 text-purple-200 hover:bg-purple-600/50'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}>
                    User Management
                  </button>
                  <button className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    darkMode
                      ? 'bg-blue-600/30 text-blue-200 hover:bg-blue-600/50'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}>
                    System Settings
                  </button>
                  <button className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    darkMode
                      ? 'bg-green-600/30 text-green-200 hover:bg-green-600/50'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}>
                    Generate Reports
                  </button>
                  <button className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    darkMode
                      ? 'bg-orange-600/30 text-orange-200 hover:bg-orange-600/50'
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}>
                    Database Backup
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  📈 Registrations
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      This Month
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      +234
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      This Week
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      +48
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                      Today
                    </span>
                    <span className={`font-bold ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                      +12
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Status */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  🔧 Services
                </h3>

                <div className="space-y-2 text-sm">
                  {[
                    { name: 'API Server', status: 'online' },
                    { name: 'Database', status: 'online' },
                    { name: 'Cache', status: 'online' },
                    { name: 'Message Queue', status: 'online' },
                  ].map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        {service.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className={darkMode ? 'text-green-300' : 'text-green-600'}>
                          {service.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  };
  
  export default AdminDashboard;
