import React, { useState } from 'react';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { useMode } from '@/context/ModeContext';
import { Users, PackageOpen, TrendingUp, MapPin, LogOut, Moon, Sun } from 'lucide-react';
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
    <div className={`min-h-screen ${darkMode ? 'bg-[hsl(var(--background))]' : 'bg-green-50/40'}`}>
      {/* Top Bar */}
      <div className={`border-b ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-green-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>ResQ Meal</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <ModeSwitcher darkMode={darkMode} />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header with Mode Switcher */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                🟩 NGO/Organization Dashboard
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Browse food, request donations & distribute to beneficiaries
              </p>
            </div>
            <ModeSwitcher darkMode={darkMode} />
          </div>

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
        </div>
      </main>
    </div>
  );
};

export default NGODashboard;
