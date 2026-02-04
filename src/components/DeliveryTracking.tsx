import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock, Navigation, AlertCircle, CheckCircle, Truck, Phone, User } from 'lucide-react';

interface DeliveryRoute {
  id: string;
  restaurantLocation: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
  ngoLocation: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
  distance: number; // in km
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes (elapsed)
  status: 'pending' | 'in_transit' | 'delivered';
  currentLocation: {
    lat: number;
    lng: number;
  };
  volunteer: {
    name: string;
    phone: string;
    rating: number;
  };
  food: {
    name: string;
    quantity: number;
    freshness: string;
  };
}

interface DeliveryTrackingProps {
  darkMode: boolean;
  deliveryRoute: DeliveryRoute;
  onStatusUpdate?: (status: DeliveryRoute['status']) => void;
}

// Google Maps API Key (to be set in .env)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  darkMode,
  deliveryRoute,
  onStatusUpdate,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(deliveryRoute.currentLocation);
  const [directions, setDirections] = useState<any>(null);
  const [trafficLevel, setTrafficLevel] = useState<'light' | 'moderate' | 'heavy'>('light');

  // Mock location update (simulate volunteer movement)
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setCurrentLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=maps,places,routes`;
    script.async = true;
    script.onload = () => {
      initializeMap();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    if (!window.google || !mapContainer.current) return;

    // Center map between restaurant and NGO
    const centerLat = (deliveryRoute.restaurantLocation.lat + deliveryRoute.ngoLocation.lat) / 2;
    const centerLng = (deliveryRoute.restaurantLocation.lng + deliveryRoute.ngoLocation.lng) / 2;

    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: 14,
      center: { lat: centerLat, lng: centerLng },
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: false,
    });

    // Add markers
    addMarkers();
    displayRoute();
  };

  const addMarkers = () => {
    if (!map.current || !window.google) return;

    // Restaurant marker (source)
    new window.google.maps.Marker({
      position: deliveryRoute.restaurantLocation,
      map: map.current,
      title: `Restaurant: ${deliveryRoute.restaurantLocation.name}`,
      icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    });

    // NGO marker (destination)
    new window.google.maps.Marker({
      position: deliveryRoute.ngoLocation,
      map: map.current,
      title: `NGO: ${deliveryRoute.ngoLocation.name}`,
      icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    });

    // Volunteer/Vehicle marker (current location)
    new window.google.maps.Marker({
      position: currentLocation,
      map: map.current,
      title: `Delivery in progress`,
      icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });
  };

  const displayRoute = async () => {
    if (!map.current || !window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: map.current,
      suppressMarkers: false,
    });

    try {
      const result = await directionsService.route({
        origin: deliveryRoute.restaurantLocation,
        destination: deliveryRoute.ngoLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      directionsRenderer.setDirections(result);
      setDirections(result);
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const timeRemaining = Math.max(0, deliveryRoute.estimatedTime * 60 - elapsedTime);
  const progressPercent = (elapsedTime / (deliveryRoute.estimatedTime * 60)) * 100;
  const isDelivered = timeRemaining === 0;

  return (
    <div className={`rounded-lg overflow-hidden ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-lg`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className={`w-6 h-6 ${
              deliveryRoute.status === 'delivered' ? 'text-green-500' : 'text-blue-500'
            }`} />
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Live Delivery Tracking
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            deliveryRoute.status === 'delivered'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-blue-500/20 text-blue-500'
          }`}>
            {deliveryRoute.status.toUpperCase()}
          </span>
        </div>

        {/* Elapsed vs Estimated Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Elapsed Time
            </p>
            <p className={`text-lg font-bold flex items-center gap-1 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(elapsedTime)}
            </p>
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Remaining
            </p>
            <p className={`text-lg font-bold flex items-center gap-1 ${
              isDelivered
                ? 'text-green-500'
                : darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Clock className="w-4 h-4" />
              {isDelivered ? '✓ Delivered' : formatTime(timeRemaining)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className={`w-full h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-gray-600' : 'bg-gray-300'
          }`}>
            <div
              className={`h-full transition-all duration-300 ${
                isDelivered ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              0 min
            </p>
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {Math.round(progressPercent)}%
            </p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {deliveryRoute.estimatedTime} min
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-96"
        style={{
          minHeight: '400px',
          backgroundColor: darkMode ? '#1F2937' : '#f5f5f5',
        }}
      />

      {/* Details Section */}
      <div className={`p-6 border-t ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Route Information */}
          <div>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <Navigation className="w-5 h-5 text-teal-500" />
              Route Details
            </h3>

            <div className="space-y-3">
              {/* From */}
              <div>
                <p className={`text-xs font-semibold ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  FROM
                </p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {deliveryRoute.restaurantLocation.name}
                    </p>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {deliveryRoute.restaurantLocation.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Distance */}
              <div className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  📍 Distance: <span className="text-teal-500">{deliveryRoute.distance} km</span>
                </p>
              </div>

              {/* To */}
              <div>
                <p className={`text-xs font-semibold ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  TO
                </p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {deliveryRoute.ngoLocation.name}
                    </p>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {deliveryRoute.ngoLocation.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Volunteer & Food Information */}
          <div>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <User className="w-5 h-5 text-blue-500" />
              Delivery Information
            </h3>

            <div className="space-y-4">
              {/* Volunteer Info */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  VOLUNTEER
                </p>
                <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {deliveryRoute.volunteer.name}
                </p>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ⭐ {deliveryRoute.volunteer.rating}/5.0
                </p>
                <button className={`w-full py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold transition ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}>
                  <Phone className="w-4 h-4" />
                  Call {deliveryRoute.volunteer.phone}
                </button>
              </div>

              {/* Food Info */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <p className={`text-xs font-semibold mb-2 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  FOOD DETAILS
                </p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {deliveryRoute.food.name}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  📦 {deliveryRoute.food.quantity} servings
                </p>
                <p className={`text-sm flex items-center gap-1 mt-2 ${
                  deliveryRoute.food.freshness === 'excellent'
                    ? 'text-green-500'
                    : 'text-yellow-500'
                }`}>
                  ✨ {deliveryRoute.food.freshness.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {isDelivered && (
          <div className={`mt-6 p-4 rounded-lg border-2 flex items-start gap-3 ${
            darkMode
              ? 'bg-green-900/20 border-green-700'
              : 'bg-green-50 border-green-200'
          }`}>
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <div>
              <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                ✓ Delivery Completed!
              </p>
              <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                Food successfully delivered to {deliveryRoute.ngoLocation.name}
              </p>
            </div>
          </div>
        )}

        {trafficLevel === 'heavy' && !isDelivered && (
          <div className={`mt-6 p-4 rounded-lg border-2 flex items-start gap-3 ${
            darkMode
              ? 'bg-yellow-900/20 border-yellow-700'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <p className={`font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                ⚠️ Heavy Traffic Alert
              </p>
              <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                Delivery may be delayed. Estimated delivery time updated.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryTracking;
