import React, { useState } from 'react';
/* eslint-disable no-inline-styles */
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import { useMode } from '@/context/ModeContext';
import { Plus, TrendingUp, Users, Clock, Home, FileText, Info, Settings, Zap } from 'lucide-react';
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
  type PageId = 'dashboard' | 'post' | 'freshness' | 'impact' | 'about' | 'settings';
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  
  const navigationItems: AppShellNavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'post', icon: Plus, label: 'Post Food' },
    { id: 'freshness', icon: Zap, label: 'Check Freshness' },
    { id: 'impact', icon: FileText, label: 'Impact Report' },
    { id: 'about', icon: Info, label: 'About Us' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];
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
    freshness: '',
  });

  const [showNewForm, setShowNewForm] = useState(false);
  const [formError, setFormError] = useState('');

  const postDonation = () => {
    setFormError('');
    
    if (!newDonation.foodType || !newDonation.quantity) {
      setFormError('Please fill in all required fields');
      return;
    }

    const freshness = parseInt(newDonation.freshness || '0');
    if (freshness < 80) {
      setFormError(`Food freshness must be at least 80% to post. Current: ${freshness}%`);
      return;
    }

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
    setNewDonation({ foodType: '', quantity: '', preparationTime: '', expiryTime: '', freshness: '' });
    setShowNewForm(false);
  };

  const claimDonation = (id: number) => {
    setDonations(
      donations.map((d) =>
        d.id === id ? { ...d, status: 'claimed', claimedBy: 'Sample NGO' } : d
      )
    );
  };

  return (
    <AppShell
      title="ResQ Meal"
      subtitle={activePage === 'dashboard' || activePage === 'post' ? 'Post surplus food, manage donations & track impact' : ''}
      sidebarItems={navigationItems}
      activeId={activePage}
      onNavigate={(id) => setActivePage(id as PageId)}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      languageLabels={{ en: 'English', ta: 'Tamil', hi: 'Hindi' }}
      user={user}
      onLogout={onLogout}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Dashboard & Post Page */}
        {(activePage === 'dashboard' || activePage === 'post') && (
          <>

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
          
          {/* Food Freshness Check Section */}
          {activePage === ('freshness' as PageId) && (
            <div className={`p-6 rounded-lg border-2 ${
              darkMode
                ? 'bg-gradient-to-br from-purple-900/30 to-orange-900/20 border-purple-600/50'
                : 'bg-gradient-to-br from-purple-50 to-orange-50 border-purple-200'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                ⚡ Food Freshness Checker
              </h2>
              
              <div className={`mb-6 p-4 rounded-lg border-2 ${darkMode ? 'bg-red-900/30 border-red-600/50' : 'bg-red-50 border-red-200'}`}>
                <p className={`font-bold flex items-center gap-2 ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                  🔒 Important: Only post food that is FRESH
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-red-300/80' : 'text-red-700'}`}>
                  Freshness must be 80% or higher to be eligible for posting. This ensures quality and safety for beneficiaries.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Biryani', freshness: 95, status: 'Can Post ✅', canPost: true, emoji: '🍛' },
                  { name: 'Curry & Rice', freshness: 88, status: 'Can Post ✅', canPost: true, emoji: '🍲' },
                  { name: 'Pizza', freshness: 65, status: 'Cannot Post ❌', canPost: false, emoji: '🍕' },
                ].map((food) => (
                  <div key={food.name} className={`p-4 rounded-lg border-2 ${
                    food.canPost
                      ? darkMode ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-200'
                      : darkMode ? 'bg-red-900/20 border-red-600' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {food.emoji} {food.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        food.canPost
                          ? darkMode ? 'bg-green-600/40 text-green-200' : 'bg-green-200 text-green-800'
                          : darkMode ? 'bg-red-600/40 text-red-200' : 'bg-red-200 text-red-800'
                      }`}>
                        {food.status}
                      </span>
                    </div>
                    <div className={`w-full h-3 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} overflow-hidden`}>
                      <div
                        className={`h-full ${
                          food.canPost
                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                            : 'bg-gradient-to-r from-red-400 to-red-600'
                        } ${
                          food.freshness >= 90
                            ? 'w-full'
                            : food.freshness >= 80
                            ? 'w-10/12'
                            : food.freshness >= 70
                            ? 'w-8/12'
                            : 'w-6/12'
                        }`}
                      />
                    </div>
                    <p className={`text-sm mt-2 font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Freshness: {food.freshness}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

                  {formError && (
                    <div className={`mb-4 p-3 rounded-lg border-2 ${darkMode ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-200'}`}>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                        ❌ {formError}
                      </p>
                    </div>
                  )}

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

                    <div>
                      <label className={`block text-sm font-semibold mb-1 ${darkMode ? 'text-orange-200' : 'text-orange-700'}`}>
                        Food Freshness (%) * 🔒 Min: 80%
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newDonation.freshness}
                        onChange={(e) => setNewDonation({ ...newDonation, freshness: e.target.value })}
                        placeholder="e.g., 85 (80% or higher required)"
                        className={`w-full px-3 py-2 rounded-lg border-2 ${
                          darkMode
                            ? 'bg-orange-900/40 border-orange-700 text-white placeholder-slate-400'
                            : 'bg-white border-orange-200 text-slate-900'
                        }`}
                      />
                      <p className={`text-xs mt-1 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
                        📌 Must be 80% or higher to post. Quality matters!
                      </p>
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
                          setNewDonation({ foodType: '', quantity: '', preparationTime: '', expiryTime: '', freshness: '' });
                          setFormError('');
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
          </>
        )}

          {/* About Us Section */}
          {activePage === ('about' as PageId) && (
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
                  🍽️ <strong>How Restaurants Help:</strong> Partner with us to donate surplus food that's still fresh and nutritious. Every donation feeds families and reduces waste.
                </p>
                <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                  <p className="font-semibold mb-2">✨ Restaurant Partner Benefits:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Tax deduction on food donations</li>
                    <li>Community goodwill & brand visibility</li>
                    <li>Track your impact metrics</li>
                    <li>Connect with verified NGO partners</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activePage === ('settings' as PageId) && (
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
                    Manage how you receive pickup requests and updates
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? 'bg-purple-900/30 border-purple-700'
                    : 'bg-purple-100 border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      📦 Donation Preferences
                    </p>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Edit
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                    Set preferred donation times and food categories
                  </p>
                </div>

                <div className={`p-4 rounded-lg border-2 ${
                  darkMode
                    ? 'bg-purple-900/30 border-purple-700'
                    : 'bg-purple-100 border-purple-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                      🤝 Partner Connections
                    </p>
                    <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                      Manage
                    </button>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-purple-300/70' : 'text-purple-700/70'}`}>
                    Manage your NGO partnerships and preferred routes
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
                    Get help with donations or report an issue
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  };
  
  export default RestaurantDashboard;
