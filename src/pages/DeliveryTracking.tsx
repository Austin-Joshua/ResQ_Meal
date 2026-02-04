import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Clock, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import DeliveryTracking from '../components/DeliveryTracking';

interface DeliveryStats {
  totalDeliveries: number;
  ongoingDeliveries: number;
  completedToday: number;
  averageDeliveryTime: number;
  totalMealsSaved: number;
}

interface LiveDelivery {
  id: string;
  restaurantName: string;
  ngoName: string;
  volunteer: string;
  foodName: string;
  distance: string;
  estimatedTime: number;
  elapsedTime: number;
  status: 'pending' | 'in_transit' | 'delivered';
  progress: number;
}

interface DeliveryTrackingPageProps {
  darkMode: boolean;
  onBack: () => void;
}

const DeliveryTrackingPage: React.FC<DeliveryTrackingPageProps> = ({ darkMode, onBack }) => {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<LiveDelivery[]>([
    {
      id: 'delivery_1',
      restaurantName: 'Green Valley Restaurant',
      ngoName: 'Helping Hands NGO',
      volunteer: 'Rajesh Kumar',
      foodName: 'Biryani & Rice',
      distance: '3.2 km',
      estimatedTime: 15,
      elapsedTime: 8,
      status: 'in_transit',
      progress: 53,
    },
    {
      id: 'delivery_2',
      restaurantName: 'Spice House',
      ngoName: 'Food for All',
      volunteer: 'Priya Singh',
      foodName: 'Vegetables & Daal',
      distance: '2.8 km',
      estimatedTime: 12,
      elapsedTime: 12,
      status: 'delivered',
      progress: 100,
    },
    {
      id: 'delivery_3',
      restaurantName: 'City Bakery',
      ngoName: 'Children Care',
      volunteer: 'Arjun Sharma',
      foodName: 'Bread & Pastries',
      distance: '1.5 km',
      estimatedTime: 8,
      elapsedTime: 2,
      status: 'in_transit',
      progress: 25,
    },
  ]);

  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 45,
    ongoingDeliveries: 2,
    completedToday: 43,
    averageDeliveryTime: 14,
    totalMealsSaved: 2350,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveries(prev =>
        prev.map(delivery => {
          if (delivery.status === 'in_transit') {
            const newElapsedTime = delivery.elapsedTime + 1;
            const newProgress = (newElapsedTime / delivery.estimatedTime) * 100;

            return {
              ...delivery,
              elapsedTime: newElapsedTime,
              progress: Math.min(newProgress, 100),
              status: newProgress >= 100 ? 'delivered' : 'in_transit',
            };
          }
          return delivery;
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
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
              onClick={onBack}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold">Live Delivery Tracking</h1>
          </div>
          <Truck className="w-8 h-8 text-blue-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Deliveries
                </p>
                <p className="text-3xl font-bold text-teal-500 mt-1">{stats.totalDeliveries}</p>
              </div>
              <Truck className="w-8 h-8 text-teal-500 opacity-50" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ongoing
                </p>
                <p className="text-3xl font-bold text-blue-500 mt-1">{stats.ongoingDeliveries}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </p>
                <p className="text-3xl font-bold text-green-500 mt-1">{stats.completedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Delivery
                </p>
                <p className="text-3xl font-bold text-amber-500 mt-1">{stats.averageDeliveryTime}m</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-md`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Meals Saved
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalMealsSaved}</p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Selected Delivery Map View */}
        {selectedDelivery && (
          <div className="mb-8">
            <button
              onClick={() => setSelectedDelivery(null)}
              className={`mb-4 px-4 py-2 rounded-lg font-semibold transition ${
                darkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Close Map View
            </button>
            <div className={`rounded-lg overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              {/* Map placeholder - Google Maps will be integrated here */}
              <div className={`w-full h-96 flex items-center justify-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className={`text-lg font-semibold ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Google Maps Integration
                  </p>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Live tracking map with real-time location updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Deliveries List */}
        <div className="grid grid-cols-1 gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Active Deliveries
          </h2>

          {deliveries.map(delivery => (
            <div
              key={delivery.id}
              className={`p-6 rounded-lg cursor-pointer transition transform hover:scale-102 ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
              } shadow-md`}
              onClick={() => setSelectedDelivery(delivery.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${
                      delivery.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <p className="font-bold text-lg">
                      {delivery.restaurantName} → {delivery.ngoName}
                    </p>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    📦 {delivery.foodName} • 👤 {delivery.volunteer}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  delivery.status === 'delivered'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {delivery.status === 'delivered' ? '✓ DELIVERED' : 'IN TRANSIT'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Distance
                      </p>
                      <p className="font-semibold">{delivery.distance}</p>
                    </div>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Time
                      </p>
                      <p className="font-semibold">{delivery.elapsedTime}m / {delivery.estimatedTime}m</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${
                    delivery.status === 'delivered' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {Math.round(delivery.progress)}%
                  </p>
                </div>

                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  {(() => {
                    const p = delivery.progress;
                    const widthClass =
                      p >= 100
                        ? 'w-full'
                        : p >= 75
                        ? 'w-3/4'
                        : p >= 50
                        ? 'w-1/2'
                        : p >= 25
                        ? 'w-1/3'
                        : 'w-1/6';
                    return (
                      <div
                        className={`h-full ${widthClass} transition-all ${
                          delivery.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      />
                    );
                  })()}
                </div>
              </div>

              {/* Click to View */}
              <p className={`text-xs flex items-center gap-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                📍 Click to view on map
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {deliveries.length === 0 && (
          <div className={`text-center py-12 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">No Active Deliveries</p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              All deliveries for today have been completed!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryTrackingPage;
