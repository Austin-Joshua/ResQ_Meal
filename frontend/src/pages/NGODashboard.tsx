import React, { useState } from 'react';
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import { useMode } from '@/context/ModeContext';
import { Users, PackageOpen, TrendingUp, MapPin, Home, FileText, Info, Settings } from 'lucide-react';
interface NGODashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  user: { id: number; name: string; email: string; role: string };
  onLogout: () => void;
}

interface FoodRequest {
  id: number;
  restaurantName: string;
  foodType: string;
  quantity: number;
  unit: string;
  location: string;
  pickupTime: string;
  status: 'available' | 'requested' | 'received';
  estimatedMeals: number;
  beneficiaries: string;
}

const NGODashboard: React.FC<NGODashboardProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const { currentMode } = useMode();
  const [activePage, setActivePage] = useState('dashboard');
  
  const navigationItems: AppShellNavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'browse', icon: PackageOpen, label: 'Browse Food' },
    { id: 'impact', icon: FileText, label: 'Impact Report' },
    { id: 'about', icon: Info, label: 'About Us' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];
  const [availableFood, setAvailableFood] = useState<FoodRequest[]>([
    {
      id: 1,
      restaurantName: 'Taj Restaurant',
      foodType: 'Biryani, Curry',
      quantity: 50,
      unit: 'plates',
      location: 'MG Road, Chennai',
      pickupTime: '14:30 - 16:00',
      status: 'available',
      estimatedMeals: 50,
      beneficiaries: 'Elderly Care Home',
    },
    {
      id: 2,
      restaurantName: 'Saravana Bhavan',
      foodType: 'Sambar, Rice, Pickle',
      quantity: 35,
      unit: 'portions',
      location: 'T. Nagar, Chennai',
      pickupTime: '15:00 - 17:00',
      status: 'available',
      estimatedMeals: 35,
      beneficiaries: 'Street Children Center',
    },
    {
      id: 3,
      restaurantName: 'Local Bakery',
      foodType: 'Bread, Pastries',
      quantity: 40,
      unit: 'pieces',
      location: 'Anna Nagar, Chennai',
      pickupTime: '10:00 - 11:00',
      status: 'available',
      estimatedMeals: 20,
      beneficiaries: 'Community Kitchen',
    },
  ]);

  const [myRequests, setMyRequests] = useState<FoodRequest[]>([
    {
      id: 101,
      restaurantName: 'Dominos',
      foodType: 'Pizza',
      quantity: 30,
      unit: 'slices',
      location: 'Anna Nagar',
      pickupTime: '18:00',
      status: 'requested',
      estimatedMeals: 15,
      beneficiaries: 'Shelter Home',
    },
  ]);

  const [stats, setStats] = useState({
    totalReceived: 245,
    totalBeneficiaries: 1840,
    activeRequests: 3,
    partneredRestaurants: 24,
  });

  const requestFood = (foodId: number) => {
    const food = availableFood.find((f) => f.id === foodId);
    if (food) {
      setAvailableFood(availableFood.filter((f) => f.id !== foodId));
      setMyRequests([...myRequests, { ...food, status: 'requested' }]);
      setStats({ ...stats, activeRequests: stats.activeRequests + 1 });
    }
  };

  const confirmReceived = (requestId: number) => {
    setMyRequests(
      myRequests.map((r) =>
        r.id === requestId ? { ...r, status: 'received' } : r
      )
    );

    const received = myRequests.find((r) => r.id === requestId);
    if (received) {
      setStats({
        ...stats,
        totalReceived: stats.totalReceived + received.quantity,
        totalBeneficiaries: stats.totalBeneficiaries + Math.ceil(received.estimatedMeals * 2),
        activeRequests: stats.activeRequests - 1,
      });
    }
  };

  return (
    <AppShell
      title="ResQ Meal"
      subtitle={activePage === 'dashboard' || activePage === 'browse' ? 'Browse food, request donations & distribute to beneficiaries' : ''}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Dashboard & Browse Page */}
        {(activePage === 'dashboard' || activePage === 'browse') && (
          <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Received', value: stats.totalReceived, icon: '📦', color: 'green' },
              { label: 'Beneficiaries', value: stats.totalBeneficiaries, icon: '👥', color: 'blue' },
              { label: 'Active Requests', value: stats.activeRequests, icon: '📋', color: 'yellow' },
              { label: 'Partner Restaurants', value: stats.partneredRestaurants, icon: '🤝', color: 'orange' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? `bg-${stat.color}-900/20 border-${stat.color}-700`
                    : `bg-${stat.color}-50 border-${stat.color}-200`
                }`}
              >
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Food */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                🍽️ Available Food Nearby
              </h2>

              <div className="space-y-3">
                {availableFood.map((food) => (
                  <div
                    key={food.id}
                    className={`p-4 rounded-lg border-2 transition ${
                      darkMode
                        ? 'bg-green-900/30 border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                        : 'bg-white border-green-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {food.foodType}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          From: {food.restaurantName}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        darkMode
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {food.quantity} {food.unit}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <MapPin className="w-4 h-4" />
                        <span>{food.location}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <PackageOpen className="w-4 h-4" />
                        <span>{food.pickupTime}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span>~{food.estimatedMeals} meals</span>
                      </div>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Users className="w-4 h-4" />
                        <span>{food.beneficiaries}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => requestFood(food.id)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Request This Food
                    </button>
                  </div>
                ))}

                {availableFood.length === 0 && (
                  <div className={`p-8 rounded-lg text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No available food at the moment. Check back soon!
                  </div>
                )}
              </div>
            </div>

            {/* Requested Food */}
            <div className="space-y-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                📋 My Requests
              </h2>

              <div className="space-y-3">
                {myRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 rounded-lg border-2 ${
                      darkMode
                        ? 'bg-blue-900/20 border-blue-700'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className={`font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                          {request.foodType}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-blue-300/70' : 'text-blue-700/70'}`}>
                          From {request.restaurantName}
                        </p>
                      </div>
                    </div>

                    <div className={`text-xs mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      <p>Qty: {request.quantity} {request.unit}</p>
                      <p>For: {request.beneficiaries}</p>
                    </div>

                    <div className={`px-2 py-1 rounded text-xs font-semibold mb-2 text-center ${
                      request.status === 'requested'
                        ? darkMode
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-yellow-100 text-yellow-700'
                        : darkMode
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {request.status === 'requested' ? '⏳ Pending' : '✅ Received'}
                    </div>

                    {request.status === 'requested' && (
                      <button
                        onClick={() => confirmReceived(request.id)}
                        className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition"
                      >
                        Mark Received
                      </button>
                    )}
                  </div>
                ))}

                {myRequests.length === 0 && (
                  <div className={`p-4 rounded-lg text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No active requests. Request food to get started!
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className={`p-4 rounded-lg border-2 ${
                darkMode
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-green-50 border-green-200'
              }`}>
                <h3 className={`font-bold mb-3 ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                  📊 Impact This Month
                </h3>

                <div className="space-y-2 text-sm">
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                    Foods Received: <span className={`font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>12</span>
                  </p>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                    Beneficiaries: <span className={`font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>380</span>
                  </p>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                    Waste Prevented: <span className={`font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>520 kg</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          </>
        )}

          {/* About Us Section */}
          {activePage === 'about' && (
            <div className={`p-6 rounded-lg border-2 ${
              darkMode
                ? 'bg-blue-900/20 border-blue-600'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                About ResQ Meal
              </h2>
              <div className={`space-y-4 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                <p>
                  ResQ Meal is a mission-driven platform connecting food donors with those in need. We bridge the gap between surplus food and hungry communities.
                </p>
                <p>
                  🌟 <strong>Our Mission:</strong> Reduce food waste while fighting hunger through a collaborative ecosystem of restaurants, volunteers, and NGOs.
                </p>
                <p>
                  🎯 <strong>Our Vision:</strong> A world where no edible food goes to waste and everyone has access to nutritious meals.
                </p>
                <p>
                  🤝 <strong>How NGOs Benefit:</strong> Access fresh food donations from partner restaurants to serve your beneficiaries. Focus on impact while we handle logistics.
                </p>
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                  <p className="font-semibold mb-2">✨ NGO Benefits:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Access to vetted restaurant partners</li>
                    <li>Reliable food supply for beneficiaries</li>
                    <li>Impact tracking & reporting</li>
                    <li>Community visibility & recognition</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activePage === 'settings' && (
            <div className={`p-6 rounded-lg border-2 ${
              darkMode
                ? 'bg-purple-900/20 border-purple-600'
                : 'bg-purple-50 border-purple-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Settings
              </h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? 'bg-purple-900/30 border-purple-700'
                    : 'bg-purple-100 border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      📱 Notification Preferences
                    </p>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Edit
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                    Manage alerts for new food donations and requests
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? 'bg-purple-900/30 border-purple-700'
                    : 'bg-purple-100 border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      📍 Service Area
                    </p>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Edit
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                    Configure your organization's service locations
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? 'bg-purple-900/30 border-purple-700'
                    : 'bg-purple-100 border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      🍽️ Food Preferences
                    </p>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Edit
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                    Set preferred food types and dietary requirements
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? 'bg-purple-900/30 border-purple-700'
                    : 'bg-purple-100 border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      ℹ️ Help & Support
                    </p>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Contact
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                    Get help with food requests or report an issue
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  };
  
  export default NGODashboard;
