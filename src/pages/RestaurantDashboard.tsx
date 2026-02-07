import React, { useState } from 'react';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { useMode } from '@/context/ModeContext';
import { Plus, TrendingUp, Users, Clock, LogOut, Moon, Sun } from 'lucide-react';
interface RestaurantDashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  user: { id: number; name: string; email: string; role: string };
  onLogout: () => void;
}

interface FoodDonation {
  id: number;
  foodType: string;
  quantity: number;
  unit: string;
  preparationTime: string;
  expiryTime: string;
  pickupLocation: string;
  status: 'available' | 'claimed' | 'delivered';
  claimedBy?: string;
  impact: { estimatedMeals: number };
}

const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const { currentMode } = useMode();
  const [donations, setDonations] = useState<FoodDonation[]>([
    {
      id: 1,
      foodType: 'Biryani',
      quantity: 50,
      unit: 'plates',
      preparationTime: '14:30',
      expiryTime: '16:00',
      pickupLocation: 'MG Road Branch',
      status: 'available',
      impact: { estimatedMeals: 50 },
    },
    {
      id: 2,
      foodType: 'Sambar & Rice',
      quantity: 40,
      unit: 'portions',
      preparationTime: '15:00',
      expiryTime: '17:00',
      pickupLocation: 'T. Nagar Branch',
      status: 'claimed',
      claimedBy: 'Velachery NGO',
      impact: { estimatedMeals: 40 },
    },
  ]);

  const [stats, setStats] = useState({
    totalDonations: 128,
    mealsDonated: 3245,
    activeListings: 4,
    participantNGOs: 12,
  });

  const [newDonation, setNewDonation] = useState({
    foodType: '',
    quantity: '',
    preparationTime: '',
    expiryTime: '',
  });

  const [showNewForm, setShowNewForm] = useState(false);

  const postDonation = () => {
    if (newDonation.foodType && newDonation.quantity) {
      const donation: FoodDonation = {
        id: Math.max(...donations.map((d) => d.id), 0) + 1,
        foodType: newDonation.foodType,
        quantity: parseInt(newDonation.quantity),
        unit: 'portions',
        preparationTime: newDonation.preparationTime || '15:00',
        expiryTime: newDonation.expiryTime || '17:00',
        pickupLocation: 'Main Branch',
        status: 'available',
        impact: { estimatedMeals: parseInt(newDonation.quantity) },
      };

      setDonations([...donations, donation]);
      setStats({ ...stats, totalDonations: stats.totalDonations + 1 });
      setNewDonation({ foodType: '', quantity: '', preparationTime: '', expiryTime: '' });
      setShowNewForm(false);
    }
  };

  const claimDonation = (id: number) => {
    setDonations(
      donations.map((d) =>
        d.id === id ? { ...d, status: 'claimed', claimedBy: 'Sample NGO' } : d
      )
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[hsl(var(--background))]' : 'bg-orange-50/40'}`}>
      {/* Top Bar */}
      <div className={`border-b ${darkMode ? 'border-slate-700 bg-slate-900' : 'border-orange-200 bg-white'}`}>
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
                🟧 Restaurant/Donor Dashboard
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Post surplus food, manage donations & track impact
              </p>
            </div>
            <ModeSwitcher darkMode={darkMode} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Donations', value: stats.totalDonations, icon: '📦', color: 'orange' },
              { label: 'Meals Donated', value: stats.mealsDonated, icon: '🍽️', color: 'yellow' },
              { label: 'Active Listings', value: stats.activeListings, icon: '📍', color: 'green' },
              { label: 'Partner NGOs', value: stats.participantNGOs, icon: '🤝', color: 'blue' },
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

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Active Donations */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  📦 Active Food Listings
                </h2>
                <button
                  onClick={() => setShowNewForm(!showNewForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Post Food
                </button>
              </div>

              {/* New Donation Form */}
              {showNewForm && (
                <div
                  className={`p-4 rounded-lg border-2 ${
                    darkMode
                      ? 'bg-orange-900/30 border-orange-700'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Post New Food Donation
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                        Food Type *
                      </label>
                      <input
                        type="text"
                        value={newDonation.foodType}
                        onChange={(e) => setNewDonation({ ...newDonation, foodType: e.target.value })}
                        placeholder="e.g., Biryani, Curry, Rice"
                        className={`w-full px-3 py-2 rounded-lg border-2 ${
                          darkMode
                            ? 'bg-orange-900/40 border-orange-700 text-white placeholder-slate-400'
                            : 'bg-white border-orange-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={newDonation.quantity}
                          onChange={(e) => setNewDonation({ ...newDonation, quantity: e.target.value })}
                          placeholder="Number of portions"
                          className={`w-full px-3 py-2 rounded-lg border-2 ${
                            darkMode
                              ? 'bg-orange-900/40 border-orange-700 text-white placeholder-slate-400'
                              : 'bg-white border-orange-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                          Expires In
                        </label>
                        <input
                          type="time"
                          value={newDonation.expiryTime}
                          onChange={(e) => setNewDonation({ ...newDonation, expiryTime: e.target.value })}
                          placeholder="Expiry time"
                          className={`w-full px-3 py-2 rounded-lg border-2 ${
                            darkMode
                              ? 'bg-orange-900/40 border-orange-700 text-white'
                              : 'bg-white border-orange-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={postDonation}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
                      >
                        Post Donation
                      </button>
                      <button
                        onClick={() => {
                          setShowNewForm(false);
                          setNewDonation({ foodType: '', quantity: '', preparationTime: '', expiryTime: '' });
                        }}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                          darkMode
                            ? 'bg-slate-700 hover:bg-slate-600 text-white'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Donation Listings */}
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className={`p-4 rounded-lg border-2 transition ${
                      darkMode
                        ? 'bg-orange-900/30 border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                        : 'bg-white border-orange-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {donation.foodType}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          {donation.quantity} {donation.unit} • {donation.pickupLocation}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        donation.status === 'available'
                          ? darkMode
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-green-100 text-green-700'
                          : donation.status === 'claimed'
                          ? darkMode
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-blue-100 text-blue-700'
                          : darkMode
                          ? 'bg-slate-500/20 text-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {donation.status === 'available' ? '🟢 Available' : 
                         donation.status === 'claimed' ? '🔵 Claimed' : '✅ Delivered'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        <p className="text-xs opacity-70">Prepared At</p>
                        <p className="font-semibold">{donation.preparationTime}</p>
                      </div>
                      <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        <p className="text-xs opacity-70">Expires At</p>
                        <p className="font-semibold">{donation.expiryTime}</p>
                      </div>
                      <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        <p className="text-xs opacity-70">Impact</p>
                        <p className="font-semibold">{donation.impact.estimatedMeals} meals</p>
                      </div>
                      <div className={darkMode ? 'text-slate-300' : 'text-slate-700'}>
                        <p className="text-xs opacity-70">Claimed By</p>
                        <p className="font-semibold">{donation.claimedBy || '—'}</p>
                      </div>
                    </div>

                    {donation.status === 'available' && (
                      <button
                        onClick={() => claimDonation(donation.id)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Mark as Claimed
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                darkMode
                  ? 'bg-orange-900/20 border-orange-700'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  📊 This Month
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Food Posted
                      </p>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                      35
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4" />
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        NGOs Helped
                      </p>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                      8
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        Avg. Claim Time
                      </p>
                    </div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                      12min
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RestaurantDashboard;
