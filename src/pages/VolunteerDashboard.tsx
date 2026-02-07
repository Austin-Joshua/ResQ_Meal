import React, { useState } from 'react';
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import { useMode } from '@/context/ModeContext';
import { MapPin, Truck, TrendingUp, Clock, CheckCircle, AlertCircle, Home, Users, FileText } from 'lucide-react';
interface VolunteerDashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  user: { id: number; name: string; email: string; role: string };
  onLogout: () => void;
}

interface DeliveryTask {
  id: number;
  foodType: string;
  restaurant: string;
  pickupLocation: string;
  dropoffLocation: string;
  distance: string;
  reward: number;
  status: 'available' | 'accepted' | 'completed';
  time: string;
  impact: { mealsServed: number; estimatedPeople: number };
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
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
    { id: 'deliveries', icon: Truck, label: 'My Deliveries' },
    { id: 'impact', icon: FileText, label: 'Impact Report' },
  ];
  const [deliveries, setDeliveries] = useState<DeliveryTask[]>([
    {
      id: 1,
      foodType: 'Biryani, Curries',
      restaurant: 'Taj Restaurant',
      pickupLocation: 'MG Road, Chennai',
      dropoffLocation: 'Velachery NGO Center',
      distance: '5.2 km',
      reward: 50,
      status: 'available',
      time: '15 mins',
      impact: { mealsServed: 12, estimatedPeople: 6 },
    },
    {
      id: 2,
      foodType: 'Dosa, Sambar',
      restaurant: 'Saravana Bhavan',
      pickupLocation: 'T. Nagar, Chennai',
      dropoffLocation: 'Egmore Shelter Home',
      distance: '3.8 km',
      reward: 35,
      status: 'available',
      time: '20 mins',
      impact: { mealsServed: 8, estimatedPeople: 4 },
    },
    {
      id: 3,
      foodType: 'Pizza, Pasta',
      restaurant: 'Dominos',
      pickupLocation: 'Anna Nagar, Chennai',
      dropoffLocation: 'Mylapore Community Center',
      distance: '6.1 km',
      reward: 45,
      status: 'available',
      time: '18 mins',
      impact: { mealsServed: 10, estimatedPeople: 5 },
    },
  ]);

  const [myDeliveries, setMyDeliveries] = useState<DeliveryTask[]>([
    {
      id: 101,
      foodType: 'Parotta, Curry',
      restaurant: 'Local Eatery',
      pickupLocation: 'Thousand Lights',
      dropoffLocation: 'West Mambalam Center',
      distance: '4.5 km',
      reward: 40,
      status: 'completed',
      time: 'Today, 2:30 PM',
      impact: { mealsServed: 9, estimatedPeople: 5 },
    },
  ]);

  const [stats, setStats] = useState({
    totalDeliveries: 24,
    totalPoints: 1250,
    impactMeals: 145,
    impactPeople: 72,
  });

  const acceptDelivery = (delId: number) => {
    const delivery = deliveries.find((d) => d.id === delId);
    if (delivery) {
      setDeliveries(deliveries.filter((d) => d.id !== delId));
      setMyDeliveries([...myDeliveries, { ...delivery, status: 'accepted' }]);
    }
  };

  const completeDelivery = (delId: number) => {
    setMyDeliveries(
      myDeliveries.map((d) =>
        d.id === delId ? { ...d, status: 'completed' } : d
      )
    );
    setStats({
      ...stats,
      totalDeliveries: stats.totalDeliveries + 1,
      totalPoints: stats.totalPoints + 40,
      impactMeals: stats.impactMeals + 10,
      impactPeople: stats.impactPeople + 5,
    });
  };

  return (
    <AppShell
      title="Volunteer Dashboard"
      subtitle="Deliver food, track impact & earn rewards"
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Deliveries', value: stats.totalDeliveries, icon: '🚗', color: 'blue' },
              { label: 'Reward Points', value: stats.totalPoints, icon: '⭐', color: 'yellow' },
              { label: 'Meals Delivered', value: stats.impactMeals, icon: '🍽️', color: 'orange' },
              { label: 'People Served', value: stats.impactPeople, icon: '👥', color: 'green' },
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
            {/* Available Deliveries */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                📍 Available Deliveries
              </h2>

              <div className="space-y-3">
                {deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className={`p-4 rounded-lg border-2 transition ${
                      darkMode
                        ? 'bg-blue-900/30 border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                        : 'bg-white border-blue-200 hover:border-[#D4AF37]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {delivery.foodType}
                        </h3>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          From: {delivery.restaurant}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        darkMode
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        +{delivery.reward} pts
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <MapPin className="w-4 h-4" />
                        <span>{delivery.distance}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Clock className="w-4 h-4" />
                        <span>{delivery.time}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <Truck className="w-4 h-4" />
                        <span>📍 {delivery.pickupLocation}</span>
                      </div>
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        <TrendingUp className="w-4 h-4" />
                        <span>Impact: {delivery.impact.mealsServed} meals</span>
                      </div>
                    </div>

                    <button
                      onClick={() => acceptDelivery(delivery.id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* My Deliveries */}
            <div className="space-y-4">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                🚚 My Deliveries
              </h2>

              <div className="space-y-3">
                {myDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className={`p-4 rounded-lg border-2 ${
                      darkMode
                        ? 'bg-green-900/20 border-green-700'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {delivery.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                          {delivery.foodType}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-green-300/70' : 'text-green-700/70'}`}>
                          From {delivery.restaurant}
                        </p>
                      </div>
                    </div>

                    {delivery.status === 'accepted' && (
                      <button
                        onClick={() => completeDelivery(delivery.id)}
                        className="w-full mt-3 px-3 py-1.5 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition"
                      >
                        Mark Complete
                      </button>
                    )}

                    {delivery.status === 'completed' && (
                      <p className={`text-xs mt-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        ✓ Completed {delivery.time}
                      </p>
                    )}
                  </div>
                ))}

                {myDeliveries.length === 0 && (
                  <div className={`p-4 rounded-lg text-center ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No active deliveries. Accept one to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  };
  
  export default VolunteerDashboard;
