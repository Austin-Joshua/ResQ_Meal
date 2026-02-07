import React, { useState, useRef } from 'react';
import { AppShell, AppShellNavItem } from '@/components/AppShell';
import {
  Home,
  Truck,
  Zap,
  Star,
  FileText,
  Info,
  Settings,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Award,
  Leaf,
  Navigation,
  X,
  Thermometer,
  Users,
  DollarSign,
  Map,
  Bike,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUp,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VolunteerDashboardProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  language: 'en' | 'ta' | 'hi';
  setLanguage: (lang: 'en' | 'ta' | 'hi') => void;
  user: { id: number; name: string; email: string; role: string };
  onLogout: () => void;
}

interface AvailableFood {
  id: number;
  type: string;
  category: 'all' | 'meals' | 'vegetables' | 'baked' | 'dairy' | 'fruits' | 'others';
  organization: string;
  license: string;
  quantity: number;
  pickup: string;
  dropoff: string;
  distance: string;
  distanceKm: number;
  meals: number;
  donationValue: string;
  storageTemp: string;
  availableFor: string;
  safetyWindow: string;
  coordinate: { lat: number; lng: number };
  impact: { meals: number; people: number; co2Saved: number };
}

interface PendingDelivery {
  id: number;
  foodType: string;
  organization: string;
  license: string;
  distance: string;
  meals: number;
  donationValue: string;
  storageTemp: string;
  availableFor: string;
  safetyWindow: string;
  status: 'pending' | 'accepted' | 'in-delivery';
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoord: { lat: number; lng: number };
  dropoffCoord: { lat: number; lng: number };
}

interface MyDelivery {
  id: number;
  foodType: string;
  organization: string;
  pickupLocation: string;
  dropoffLocation: string;
  deliveredDate: string;
  distance: string;
  pickupCoord: { lat: number; lng: number };
  dropoffCoord: { lat: number; lng: number };
  impactMeals: number;
  impactPeople: number;
  co2Reduced: number;
  status: 'completed' | 'in-progress';
}

interface NGOMatch {
  id: number;
  name: string;
  licenseNo: string;
  interestLevel: 'Very Interested' | 'Interested' | 'Considering';
  distance: string;
}

interface FoodFreshnessResult {
  freshness: number;
  status: 'Fresh' | 'Acceptable' | 'Not Fresh';
  details: string;
}

type PageId = 'dashboard' | 'deliveries' | 'elite' | 'freshness' | 'impact' | 'about' | 'settings';

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  user,
  onLogout,
}) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedImpactCard, setSelectedImpactCard] = useState<MyDelivery | null>(null);
  const [freshnessResult, setFreshnessResult] = useState<FoodFreshnessResult | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'meals' | 'vegetables' | 'baked' | 'dairy' | 'fruits' | 'others'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'urgency' | 'newest' | 'servings' | 'time'>('urgency');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'pending' | 'accepted' | 'in-delivery' | 'completed'>('all');
  const [selectedForConfirmation, setSelectedForConfirmation] = useState<PendingDelivery | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [postError, setPostError] = useState(true);
  const [notifications, setNotifications] = useState({
    newDeliveries: true,
    deliveryReminders: true,
    communityUpdates: false,
    weeklyImpact: true,
  });

  const [availableFoods, setAvailableFoods] = useState<AvailableFood[]>([
    {
      id: 1,
      type: 'Curd Rice & Sambar',
      category: 'meals',
      organization: 'Save Children NGO',
      license: 'NGO2024001',
      quantity: 25,
      pickup: 'MG Road, Chennai',
      dropoff: 'Velachery NGO Center',
      distance: '1.2 km',
      distanceKm: 1.2,
      meals: 25,
      donationValue: '₹5,000 equivalent',
      storageTemp: '4°C - 60°C',
      availableFor: '2h',
      safetyWindow: '45m',
      coordinate: { lat: 13.0827, lng: 80.2707 },
      impact: { meals: 25, people: 12, co2Saved: 3.5 },
    },
    {
      id: 2,
      type: 'Fresh Grilled Vegetables',
      category: 'vegetables',
      organization: 'Community Kitchen',
      license: 'NGO2024002',
      quantity: 15,
      pickup: 'T. Nagar, Chennai',
      dropoff: 'Egmore Shelter',
      distance: '3.8 km',
      distanceKm: 3.8,
      meals: 15,
      donationValue: '₹2,500 equivalent',
      storageTemp: '4°C - 15°C',
      availableFor: '24 hours',
      safetyWindow: '30m',
      coordinate: { lat: 13.0449, lng: 80.2294 },
      impact: { meals: 15, people: 7, co2Saved: 2.1 },
    },
    {
      id: 3,
      type: 'Fresh Pasta & Bread',
      category: 'baked',
      organization: 'Hope Foundation',
      license: 'NGO2024003',
      quantity: 20,
      pickup: 'Anna Nagar, Chennai',
      dropoff: 'Mylapore Community',
      distance: '6.1 km',
      distanceKm: 6.1,
      meals: 20,
      donationValue: '₹3,500 equivalent',
      storageTemp: '2°C - 8°C',
      availableFor: '36 hours',
      safetyWindow: '60m',
      coordinate: { lat: 13.1939, lng: 80.2230 },
      impact: { meals: 20, people: 10, co2Saved: 2.8 },
    },
    {
      id: 4,
      type: 'Fresh Milk & Yogurt',
      category: 'dairy',
      organization: 'Dairy Co-op',
      license: 'NGO2024004',
      quantity: 30,
      pickup: 'Dairy Farm, Outskirts',
      dropoff: 'Chepauk Relief Center',
      distance: '8.5 km',
      distanceKm: 8.5,
      meals: 30,
      donationValue: '₹4,000 equivalent',
      storageTemp: '2°C - 6°C',
      availableFor: '12 hours',
      safetyWindow: '90m',
      coordinate: { lat: 13.1869, lng: 80.2520 },
      impact: { meals: 30, people: 15, co2Saved: 4.2 },
    },
    {
      id: 5,
      type: 'Fresh Mangoes & Oranges',
      category: 'fruits',
      organization: 'Fruit Market',
      license: 'NGO2024005',
      quantity: 40,
      pickup: 'Koyambedu Market',
      dropoff: 'Children Home, Nungambakkam',
      distance: '5.0 km',
      distanceKm: 5.0,
      meals: 40,
      donationValue: '₹6,000 equivalent',
      storageTemp: '15°C - 25°C',
      availableFor: '72 hours',
      safetyWindow: '20m',
      coordinate: { lat: 13.0865, lng: 80.2127 },
      impact: { meals: 40, people: 20, co2Saved: 5.6 },
    },
    {
      id: 6,
      type: 'Mixed Vegetables Box',
      category: 'vegetables',
      organization: 'Farm to Table',
      license: 'NGO2024006',
      quantity: 18,
      pickup: 'Organic Farm, Suburbs',
      dropoff: 'Old Age Home',
      distance: '4.2 km',
      distanceKm: 4.2,
      meals: 18,
      donationValue: '₹2,800 equivalent',
      storageTemp: '5°C - 12°C',
      availableFor: '24 hours',
      safetyWindow: '40m',
      coordinate: { lat: 13.0752, lng: 80.2391 },
      impact: { meals: 18, people: 9, co2Saved: 2.5 },
    },
    {
      id: 7,
      type: 'Whole Wheat Bread',
      category: 'baked',
      organization: 'Local Bakery',
      license: 'NGO2024007',
      quantity: 35,
      pickup: 'Main Street Bakery',
      dropoff: 'School Lunch Program',
      distance: '2.1 km',
      distanceKm: 2.1,
      meals: 35,
      donationValue: '₹3,200 equivalent',
      storageTemp: '20°C - 25°C',
      availableFor: '8 hours',
      safetyWindow: '15m',
      coordinate: { lat: 13.0697, lng: 80.2444 },
      impact: { meals: 35, people: 17, co2Saved: 4.9 },
    },
    {
      id: 8,
      type: 'Biryani Combo',
      category: 'meals',
      organization: 'Restaurant Chain',
      license: 'NGO2024008',
      quantity: 22,
      pickup: 'T. Nagar Branch',
      dropoff: 'Adyar Charitable Trust',
      distance: '3.5 km',
      distanceKm: 3.5,
      meals: 22,
      donationValue: '₹4,500 equivalent',
      storageTemp: '60°C - 80°C',
      availableFor: '3 hours',
      safetyWindow: '120m',
      coordinate: { lat: 13.0449, lng: 80.2294 },
      impact: { meals: 22, people: 11, co2Saved: 3.1 },
    },
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigationItems: AppShellNavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'deliveries', icon: Truck, label: 'My Deliveries' },
    { id: 'elite', icon: Star, label: 'Elite Mode' },
    { id: 'freshness', icon: Zap, label: 'Food Freshness' },
    { id: 'impact', icon: FileText, label: 'Impact Report' },
    { id: 'about', icon: Info, label: 'About Us' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  // Summary stats
  const stats = {
    totalDeliveries: 24,
    totalMeals: 145,
    totalPeople: 72,
    co2Reduced: 28.8,
    rewardPoints: 1250,
    foodDiverted: 185, // kg
    weeklyTrend: [15, 18, 22, 19, 25, 28, 12], // weekly meals
  };

  // Sample delivered orders
  const [myDeliveries] = useState<MyDelivery[]>([
    {
      id: 101,
      foodType: 'Parotta & Curry',
      organization: 'Local Eatery',
      pickupLocation: 'Thousand Lights, Chennai - 600006',
      dropoffLocation: 'West Mambalam Community Center - 600033',
      deliveredDate: 'Feb 5, 2026 at 2:30 PM',
      distance: '5.2 km',
      pickupCoord: { lat: 13.0486, lng: 80.2500 },
      dropoffCoord: { lat: 13.0001, lng: 80.2149 },
      impactMeals: 9,
      impactPeople: 5,
      co2Reduced: 1.8,
      status: 'completed',
    },
    {
      id: 102,
      foodType: 'Rice & Dal',
      organization: 'Sri Sai Kitchen',
      pickupLocation: 'Nungambakkam, Chennai - 600034',
      dropoffLocation: 'Anna Nagar Shelter - 600040',
      deliveredDate: 'Feb 4, 2026 at 11:00 AM',
      distance: '3.8 km',
      pickupCoord: { lat: 13.0510, lng: 80.2210 },
      dropoffCoord: { lat: 13.1939, lng: 80.2230 },
      impactMeals: 7,
      impactPeople: 4,
      co2Reduced: 1.4,
      status: 'completed',
    },
  ]);

  // Pending deliveries awaiting volunteer action
  const [pendingDeliveries, setPendingDeliveries] = useState<PendingDelivery[]>([
    {
      id: 201,
      foodType: 'Fresh Grilled Vegetables',
      organization: 'Save Children NGO',
      license: 'Registered NGO - License #NGO2024001',
      distance: '1.2 km',
      meals: 25,
      donationValue: '₹5,000 equivalent',
      storageTemp: '4°C - 15°C',
      availableFor: '24 hours',
      safetyWindow: '30m',
      status: 'pending',
      pickupLocation: 'T. Nagar, Chennai - 600017',
      dropoffLocation: 'Velachery NGO Center - 600042',
      pickupCoord: { lat: 13.0449, lng: 80.2294 },
      dropoffCoord: { lat: 13.0001, lng: 80.2149 },
    },
    {
      id: 202,
      foodType: 'Fresh Pasta & Bread',
      organization: 'Community Kitchen',
      license: 'Community Food Bank - Est. 2015',
      distance: '2.5 km',
      meals: 40,
      donationValue: '₹8,000 equivalent',
      storageTemp: '4°C - 8°C',
      availableFor: '36 hours',
      safetyWindow: '60m',
      status: 'pending',
      pickupLocation: 'Anna Nagar, Chennai - 600040',
      dropoffLocation: 'Mylapore Community Center - 600004',
      pickupCoord: { lat: 13.1939, lng: 80.2230 },
      dropoffCoord: { lat: 13.0331, lng: 80.2703 },
    },
    {
      id: 203,
      foodType: 'Curd Rice & Sambar',
      organization: 'Hope Foundation',
      license: 'Registered NGO - License #NGO2024003',
      distance: '3.2 km',
      meals: 35,
      donationValue: '₹7,000 equivalent',
      storageTemp: '4°C - 60°C',
      availableFor: '2 hours',
      safetyWindow: '45m',
      status: 'pending',
      pickupLocation: 'MG Road, Chennai - 600002',
      dropoffLocation: 'Adyar Charitable Trust - 600020',
      pickupCoord: { lat: 13.0827, lng: 80.2707 },
      dropoffCoord: { lat: 13.0031, lng: 80.1930 },
    },
    {
      id: 204,
      foodType: 'Fresh Milk & Yogurt',
      organization: 'Dairy Co-op',
      license: 'Registered NGO - License #NGO2024004',
      distance: '4.5 km',
      meals: 30,
      donationValue: '₹6,000 equivalent',
      storageTemp: '2°C - 6°C',
      availableFor: '12 hours',
      safetyWindow: '90m',
      status: 'accepted',
      pickupLocation: 'Dairy Farm, Outskirts - 600087',
      dropoffLocation: 'Chepauk Relief Center - 600005',
      pickupCoord: { lat: 13.1869, lng: 80.2520 },
      dropoffCoord: { lat: 13.0594, lng: 80.2472 },
    },
    {
      id: 205,
      foodType: 'Fresh Mangoes & Oranges',
      organization: 'Fruit Market',
      license: 'Registered NGO - License #NGO2024005',
      distance: '5.0 km',
      meals: 40,
      donationValue: '₹6,000 equivalent',
      storageTemp: '15°C - 25°C',
      availableFor: '72 hours',
      safetyWindow: '20m',
      status: 'pending',
      pickupLocation: 'Koyambedu Market - 600073',
      dropoffLocation: 'Children Home, Nungambakkam - 600034',
      pickupCoord: { lat: 13.0506, lng: 80.2206 },
      dropoffCoord: { lat: 13.0510, lng: 80.2210 },
    },
    {
      id: 206,
      foodType: 'Mixed Vegetables Box',
      organization: 'Local NGO',
      license: 'Registered NGO - License #NGO2024006',
      distance: '2.8 km',
      meals: 35,
      donationValue: '₹5,500 equivalent',
      storageTemp: '4°C - 15°C',
      availableFor: '24 hours',
      safetyWindow: '40m',
      status: 'in-delivery',
      pickupLocation: 'Perambur, Chennai - 600011',
      dropoffLocation: 'West Mambalam Shelter - 600033',
      pickupCoord: { lat: 13.1524, lng: 80.1880 },
      dropoffCoord: { lat: 13.0001, lng: 80.2149 },
    },
    {
      id: 207,
      foodType: 'Whole Wheat Bread',
      organization: 'Bakery Guild',
      license: 'Registered NGO - License #NGO2024007',
      distance: '1.8 km',
      meals: 20,
      donationValue: '₹3,500 equivalent',
      storageTemp: '15°C - 22°C',
      availableFor: '8 hours',
      safetyWindow: '15m',
      status: 'pending',
      pickupLocation: 'Besant Nagar, Chennai - 600090',
      dropoffLocation: 'Luz Church Community - 600004',
      pickupCoord: { lat: 13.0016, lng: 80.2698 },
      dropoffCoord: { lat: 13.1369, lng: 80.2766 },
    },
    {
      id: 208,
      foodType: 'Biryani Combo',
      organization: 'Sri Sai Kitchen',
      license: 'Food Business License #FBL2024008',
      distance: '3.5 km',
      meals: 22,
      donationValue: '₹4,500 equivalent',
      storageTemp: '60°C - 80°C',
      availableFor: '3 hours',
      safetyWindow: '120m',
      status: 'pending',
      pickupLocation: 'T. Nagar Branch - 600017',
      dropoffLocation: 'Adyar Charitable Trust - 600020',
      pickupCoord: { lat: 13.0449, lng: 80.2294 },
      dropoffCoord: { lat: 13.0031, lng: 80.1930 },
    },
  ]);

  // NGO Matches
  const ngoMatches: NGOMatch[] = [
    { id: 1, name: 'Save Children NGO', licenseNo: 'NGO2024001', interestLevel: 'Very Interested', distance: '1.2 km' },
    { id: 2, name: 'Community Kitchen', licenseNo: 'NGO2024002', interestLevel: 'Interested', distance: '3.8 km' },
    { id: 3, name: 'Hope Foundation', licenseNo: 'NGO2024003', interestLevel: 'Very Interested', distance: '6.1 km' },
  ];

  const openGoogleMaps = (pickupCoord: { lat: number; lng: number }, dropoffCoord: { lat: number; lng: number }) => {
    const mapsUrl = `https://www.google.com/maps/dir/${pickupCoord.lat},${pickupCoord.lng}/${dropoffCoord.lat},${dropoffCoord.lng}`;
    window.open(mapsUrl, '_blank');
  };

  const handleDeleteAvailableFood = (id: number) => {
    setAvailableFoods(availableFoods.filter(food => food.id !== id));
  };

  // Handle food freshness check
  const handleFreshnessCheck = (file: File) => {
    // Simulate ML model check
    const freshnesses = [95, 87, 72, 65];
    const randomFresh = freshnesses[Math.floor(Math.random() * freshnesses.length)];

    let status: 'Fresh' | 'Acceptable' | 'Not Fresh' = 'Fresh';
    let details = 'This food is fresh and safe for consumption.';

    if (randomFresh < 70) {
      status = 'Not Fresh';
      details = 'This food shows signs of spoilage. Do not deliver.';
    } else if (randomFresh < 80) {
      status = 'Acceptable';
      details = 'Food is acceptable but should be delivered soon.';
    }

    setFreshnessResult({
      freshness: randomFresh,
      status,
      details,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFreshnessCheck(file);
    }
  };

  // Filter foods based on active filter and search query
  const filteredFoods = availableFoods.filter(food => {
    const matchesFilter = activeFilter === 'all' || food.category === activeFilter;
    const matchesSearch = food.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          food.organization.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AppShell
      title="ResQ Meal"
      subtitle={activePage === 'dashboard' ? 'Deliver food, track impact & earn rewards' : ''}
      logo={<img src="/logo.png" alt="ResQ Meal Logo" className="h-10 w-10 object-contain" />}
      onLogoClick={() => setActivePage('dashboard')}
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
        {/* ==================== HOME / DASHBOARD PAGE ==================== */}
        {activePage === 'dashboard' && (
          <>
            {/* Welcome Banner */}
            <div className={`p-6 rounded-lg border-2 ${
              darkMode ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-600/50' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
            }`}>
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Welcome back, {user.name}
              </h2>
              <p className={`text-lg mt-2 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                You're making a difference. Keep delivering impact!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Deliveries', value: stats.totalDeliveries, icon: '🚚', color: 'blue' },
                { label: 'Meals Delivered', value: stats.totalMeals, icon: '🍽️', color: 'orange' },
                { label: 'People Served', value: stats.totalPeople, icon: '👥', color: 'green' },
                { label: 'CO₂ Reduced (kg)', value: stats.co2Reduced, icon: '🌍', color: 'emerald' },
                { label: 'Reward Points', value: stats.rewardPoints, icon: '⭐', color: 'yellow' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-lg border-2 ${
                    darkMode ? `bg-${stat.color}-900/20 border-${stat.color}-600` : `bg-${stat.color}-50 border-${stat.color}-200`
                  }`}
                >
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Weekly Impact Trend */}
            <div className={`p-6 rounded-lg border-2 ${
              darkMode ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-600/50' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className={`w-6 h-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Weekly Impact Trend</h3>
              </div>
              <div className="flex items-end justify-between h-24 gap-2">
                {stats.weeklyTrend.map((meals, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t-lg ${darkMode ? 'bg-green-600' : 'bg-green-500'}`} 
                         style={{ height: `${(meals / 30) * 100}px` }} />
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Available Foods - Carousel View */}
            <div className={`p-8 rounded-lg border-2 ${
              darkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white border-slate-200'
            }`}>
              <h2 className={`text-3xl font-bold uppercase mb-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                Today's AVAILABLE FOOD
              </h2>

              {/* Filter and Search Section */}
              <div className="space-y-4 mb-6">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  {['All', 'Meals', 'Vegetables', 'Baked', 'Dairy', 'Fruits', 'Others'].map((label) => {
                    const filterValue = label.toLowerCase() as typeof activeFilter;
                    const isActive = activeFilter === filterValue;
                    return (
                      <button
                        key={label}
                        onClick={() => {
                          setActiveFilter(filterValue);
                          setCurrentCarouselIndex(0);
                        }}
                        className={`px-4 py-2 rounded-full font-semibold transition ${
                          isActive
                            ? darkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-600 text-white'
                            : darkMode
                            ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Search and Sort Row */}
                <div className="flex gap-4 items-center flex-wrap">
                  {/* Search Bar */}
                  <div className="flex-1 min-w-64">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
                      darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <Search className="w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search for surplus food..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`flex-1 bg-transparent border-0 outline-none ${
                          darkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div className="flex gap-2 flex-wrap">
                    <span className={`font-semibold self-center ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Sort by:
                    </span>
                    {['Urgency', 'Newest', 'Servings', 'Time left'].map((label) => {
                      const sortValue = label.toLowerCase().replace(' ', '') as typeof sortBy;
                      const isActive = sortBy === sortValue || (label === 'Urgency' && sortBy === 'urgency');
                      return (
                        <button
                          key={label}
                          onClick={() => setSortBy(sortValue === 'urgency' ? 'urgency' : sortValue as any)}
                          className={`px-4 py-2 rounded-full font-semibold transition ${
                            isActive || (label === 'Urgency' && sortBy === 'urgency')
                              ? 'bg-orange-600 text-white'
                              : darkMode
                              ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Carousel Container */}
              <div className={`p-8 rounded-lg border-2 ${
                darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'
              }`}>
                {filteredFoods.length > 0 && (
                  <>
                    {/* Main Image and Info */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                      {/* Left Arrow */}
                      <button
                        onClick={() => setCurrentCarouselIndex(currentCarouselIndex === 0 ? filteredFoods.length - 1 : currentCarouselIndex - 1)}
                        className={`p-2 rounded-full transition ${
                          darkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>

                      {/* Center - Large Food Image Circle */}
                      <div className="flex flex-col items-center gap-6">
                        <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center ${
                          darkMode ? 'bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-orange-600/50' : 'bg-gradient-to-br from-orange-100 to-yellow-100 border-orange-400'
                        }`}>
                          <div className={`text-6xl`}>🍛</div>
                        </div>

                        {/* Small Thumbnail Images */}
                        <div className="flex gap-4 justify-center">
                          {filteredFoods.slice(0, 3).map((_, idx) => (
                            <div
                              key={idx}
                              onClick={() => setCurrentCarouselIndex(idx)}
                              className={`w-16 h-16 rounded-full border-2 flex items-center justify-center cursor-pointer transition ${
                                idx === currentCarouselIndex % filteredFoods.length
                                  ? darkMode ? 'border-orange-500 bg-orange-900/20' : 'border-orange-500 bg-orange-100'
                                  : darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-slate-200'
                              }`}
                            >
                              <span className="text-2xl">🍛</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Arrow */}
                      <button
                        onClick={() => setCurrentCarouselIndex((currentCarouselIndex + 1) % filteredFoods.length)}
                        className={`p-2 rounded-full transition ${
                          darkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Food Info Card */}
                    {filteredFoods.length > 0 && (
                      <div className={`p-6 rounded-lg border-2 ${
                        darkMode ? 'bg-slate-900/40 border-blue-600/50' : 'bg-white border-blue-300'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`inline-block w-3 h-3 rounded-full ${darkMode ? 'bg-yellow-500' : 'bg-yellow-400'}`} />
                          <span className={`text-sm font-bold uppercase ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                            {filteredFoods[currentCarouselIndex % filteredFoods.length].category}
                          </span>
                        </div>
                        <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {filteredFoods[currentCarouselIndex % filteredFoods.length].type}
                        </h3>

                        {/* Info Grid - 5 columns */}
                        <div className="grid grid-cols-5 gap-3 mb-6">
                          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {filteredFoods[currentCarouselIndex % filteredFoods.length].meals}
                            </p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              servings
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {filteredFoods[currentCarouselIndex % filteredFoods.length].safetyWindow}
                            </p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              safety
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                            <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {filteredFoods[currentCarouselIndex % filteredFoods.length].storageTemp}
                            </p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              temp
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {filteredFoods[currentCarouselIndex % filteredFoods.length].availableFor}
                            </p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              available
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                            <p className={`text-sm font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {filteredFoods[currentCarouselIndex % filteredFoods.length].pickup.split(',')[0]}...
                            </p>
                            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              location
                            </p>
                          </div>
                        </div>

                        {/* Pagination */}
                        <div className="text-center">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {currentCarouselIndex + 1} of {filteredFoods.length}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {filteredFoods.length === 0 && (
                  <div className="text-center py-12">
                    <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      No food items found matching your filters
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ============ IMPACT REPORT SECTION ============ */}
            
            {/* Weekly Impact Trend Chart */}
            <div className={`p-8 rounded-lg border-2 ${
              darkMode ? 'bg-gradient-to-br from-teal-900/30 to-cyan-900/20 border-teal-600/50' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                📈 Weekly Impact Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[
                  { day: 'Mon', meals: 1200, people: 600, co2: 4.5 },
                  { day: 'Tue', meals: 1300, people: 650, co2: 5.2 },
                  { day: 'Wed', meals: 1250, people: 625, co2: 5.0 },
                  { day: 'Thu', meals: 1600, people: 800, co2: 6.4 },
                  { day: 'Fri', meals: 1500, people: 750, co2: 6.0 },
                  { day: 'Sat', meals: 1800, people: 900, co2: 7.2 },
                  { day: 'Sun', meals: 2000, people: 1000, co2: 8.0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#e2e8f0'} />
                  <XAxis dataKey="day" stroke={darkMode ? '#94a3b8' : '#64748b'} />
                  <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}` }}
                    labelStyle={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="meals" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key Insights & Period Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Insights */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode ? 'bg-gradient-to-br from-teal-900/30 to-green-900/20 border-teal-600/50' : 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  📊 Key Insights
                </h3>
                <ul className={`space-y-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Average 1,232 kg diverted per week</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Vegetables account for largest share</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Consistent upward trend</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>Prevents landfill waste effectively</strong></span>
                  </li>
                </ul>
              </div>

              {/* Period Comparison */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode ? 'bg-gradient-to-br from-teal-900/30 to-green-900/20 border-teal-600/50' : 'bg-gradient-to-br from-teal-50 to-green-50 border-teal-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  📅 Period Comparison
                </h3>
                <div className={`space-y-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-300/30">
                    <span>Last Week</span>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>1,200 kg</p>
                      <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>↑ 2.7% change</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-300/30">
                    <span>Last Month</span>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>7,800 kg</p>
                      <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>↑ 10.6% change</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Year</span>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>6,500 kg</p>
                      <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-600'}`}>↑ 32.7% change</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Diverted Section */}
            <div className={`p-8 rounded-lg border-2 ${
              darkMode ? 'bg-gradient-to-br from-teal-900/30 to-cyan-900/20 border-teal-600/50' : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
            }`}>
              <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                ⚖️ Food Diverted
              </h2>
              <p className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                8,625 kg
              </p>

              {/* Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Vegetables', amount: '3,200 kg', percent: 37, icon: '🥬' },
                  { name: 'Cooked Meals', amount: '2,850 kg', percent: 33, icon: '🍲' },
                  { name: 'Fruits', amount: '1,575 kg', percent: 18, icon: '🍎' },
                  { name: 'Other', amount: '1,000 kg', percent: 12, icon: '📦' },
                ].map((category, idx) => (
                  <div key={idx} className={`p-5 rounded-lg border-2 ${
                    darkMode ? 'bg-teal-900/30 border-teal-600/50' : 'bg-teal-50 border-teal-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{category.icon}</span>
                      <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{category.name}</p>
                    </div>
                    <p className={`text-2xl font-bold mb-2 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      {category.amount}
                    </p>
                    <div className="w-full bg-slate-300/30 rounded-full h-2 mb-1">
                      <div
                        className={`h-2 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`}
                        style={{ width: `${category.percent}%` }}
                      />
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {category.percent}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps Location View */}
            <div className={`p-8 rounded-lg border-2 ${
              darkMode ? 'bg-slate-900/40 border-slate-700/50' : 'bg-white border-slate-200'
            }`}>
              <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                📍 Delivery Locations Map
              </h3>
              <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-slate-200/50">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0061315149223!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5267a98d8d8d8d%3A0x8d8d8d8d8d8d8d8d!2sChennai%2C%20India!5e0!3m2!1sen!2sin!4v1234567890"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className={`text-sm mt-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Shows primary delivery zone: Chennai metropolitan area. Click on the map to expand and view specific locations.
              </p>
            </div>

            {/* Your Impact Section */}
            <div>
              <div className={`p-6 rounded-lg border-2 mb-6 ${
                darkMode ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-600/50' : 'bg-gradient-to-r from-cyan-100 to-blue-100 border-cyan-300'
              }`}>
                <h2 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  📊 Your Impact
                </h2>
                <p className={`${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  See how much difference you're making
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meals Saved Card */}
                <button
                  onClick={() => setActivePage('impact')}
                  className={`p-8 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                    darkMode
                      ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-600/50 hover:border-green-500'
                      : 'bg-gradient-to-br from-green-200 to-green-100 border-green-300 hover:border-green-400'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    meals saved
                  </p>
                  <p className={`text-4xl font-bold mb-4 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                    3,450
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Click to view detailed report →
                  </p>
                </button>

                {/* Food Diverted Card */}
                <button
                  onClick={() => setActivePage('impact')}
                  className={`p-8 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                    darkMode
                      ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-600/50 hover:border-blue-500'
                      : 'bg-gradient-to-br from-blue-200 to-indigo-100 border-blue-300 hover:border-blue-400'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    food diverted
                  </p>
                  <p className={`text-4xl font-bold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    8,625 kg
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Click to view detailed report →
                  </p>
                </button>

                {/* CO2 Prevented Card */}
                <button
                  onClick={() => setActivePage('impact')}
                  className={`p-8 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                    darkMode
                      ? 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border-yellow-600/50 hover:border-yellow-500'
                      : 'bg-gradient-to-br from-yellow-200 to-amber-100 border-yellow-300 hover:border-yellow-400'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    CO₂ Prevented (kg)
                  </p>
                  <p className={`text-4xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    21.5 tons
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Click to view detailed report →
                  </p>
                </button>

                {/* Water Saved Card */}
                <button
                  onClick={() => setActivePage('impact')}
                  className={`p-8 rounded-lg border-2 cursor-pointer transition hover:shadow-lg ${
                    darkMode
                      ? 'bg-gradient-to-br from-cyan-900/30 to-teal-900/30 border-cyan-600/50 hover:border-cyan-500'
                      : 'bg-gradient-to-br from-cyan-200 to-teal-100 border-cyan-300 hover:border-cyan-400'
                  }`}
                >
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    Water Saved (L)
                  </p>
                  <p className={`text-4xl font-bold mb-4 ${darkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    8.6M L
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                    Click to view detailed report →
                  </p>
                </button>
              </div>
            </div>

            {/* Your Matches Section */}
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                🎯 Your Matches
              </h2>
              <div className={`p-6 rounded-lg border-2 ${
                darkMode ? 'bg-purple-900/20 border-purple-600/50' : 'bg-purple-50 border-purple-200'
              }`}>
                <p className={`text-lg font-semibold mb-4 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                  See which NGOs are interested in your food
                </p>
                <div className="space-y-3">
                  {ngoMatches.map((ngo) => (
                    <div key={ngo.id} className={`p-4 rounded-lg flex items-center justify-between ${
                      darkMode ? 'bg-slate-800/40' : 'bg-white/60'
                    }`}>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{ngo.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>License: {ngo.licenseNo}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          ngo.interestLevel === 'Very Interested'
                            ? darkMode ? 'bg-green-900/40 text-green-300' : 'bg-green-100 text-green-700'
                            : darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {ngo.interestLevel}
                        </span>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{ngo.distance} away</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== MY DELIVERIES PAGE ==================== */}
        {activePage === 'deliveries' && (
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              🚚 My Deliveries
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'pending', 'accepted', 'in-delivery', 'completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDeliveryFilter(filter as any)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    deliveryFilter === filter
                      ? darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-400 text-gray-900'
                      : darkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
              {/* Pending & Active Deliveries */}
              {(deliveryFilter === 'all' || deliveryFilter === 'pending' || deliveryFilter === 'accepted' || deliveryFilter === 'in-delivery') && 
                pendingDeliveries
                  .filter(d => deliveryFilter === 'all' || d.status === deliveryFilter)
                  .map((delivery) => (
                <div
                  key={delivery.id}
                  className={`p-6 rounded-lg border-2 ${
                    darkMode ? 'bg-slate-800/50 border-slate-600/50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                        {delivery.foodType}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Organization: {delivery.organization}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        📋 {delivery.license}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                      delivery.status === 'pending'
                        ? darkMode ? 'bg-yellow-600/40 text-yellow-300' : 'bg-yellow-200 text-yellow-800'
                        : delivery.status === 'accepted'
                        ? darkMode ? 'bg-green-600/40 text-green-300' : 'bg-green-200 text-green-800'
                        : darkMode ? 'bg-blue-600/40 text-blue-300' : 'bg-blue-200 text-blue-800'
                    }`}>
                      {delivery.status === 'pending' ? '⏳ Pending' : delivery.status === 'accepted' ? '✓ Accepted' : '🚚 In delivery'}
                    </span>
                  </div>

                  {/* Info Grid - 3 columns */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>📍 Distance</p>
                      <p className={`text-base font-bold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>{delivery.distance}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>👥 Meals</p>
                      <p className={`text-base font-bold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>{delivery.meals}</p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>💰 Donation Value</p>
                      <p className={`text-base font-bold ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>{delivery.donationValue}</p>
                    </div>
                  </div>

                  {/* Storage & Availability Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-slate-200/50">
                    <div>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>❄️ Storage Temperature</p>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{delivery.storageTemp}</p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>⏱️ Available For</p>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{delivery.availableFor}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(delivery.status === 'pending' || delivery.status === 'accepted') && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => {
                          setSelectedForConfirmation(delivery);
                          setShowConfirmationModal(true);
                        }}
                        className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                          darkMode
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        ✓ Accept
                      </button>
                      <button 
                        onClick={() => setPendingDeliveries(pendingDeliveries.filter(d => d.id !== delivery.id))}
                        className={`px-4 py-3 rounded-lg font-semibold border-2 transition ${
                          darkMode
                            ? 'border-red-600 text-red-400 hover:bg-red-600/20'
                            : 'border-red-600 text-red-600 hover:bg-red-50'
                        }`}
                      >
                        ✕ Decline
                      </button>
                    </div>
                  )}
                  {delivery.status === 'in-delivery' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => openGoogleMaps(delivery.pickupCoord, delivery.dropoffCoord)}
                        className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                          darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <Map className="w-4 h-4" /> View in Maps
                      </button>
                      <button 
                        onClick={() => openGoogleMaps(delivery.pickupCoord, delivery.dropoffCoord)}
                        className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                          darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <Navigation className="w-4 h-4" /> Navigate
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Completed Deliveries */}
              {(deliveryFilter === 'all' || deliveryFilter === 'completed') && 
                myDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className={`p-6 rounded-lg border-2 ${
                    darkMode ? 'bg-green-900/30 border-green-700/50' : 'bg-green-50 border-green-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                        {delivery.foodType}
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-green-300/70' : 'text-green-700/70'}`}>From {delivery.organization}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                      darkMode ? 'bg-green-600/40 text-green-200' : 'bg-green-200 text-green-800'
                    }`}>
                      ✓ Completed
                    </span>
                  </div>

                  {/* Locations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>📍 Pickup Location</p>
                      <p className={`text-sm font-semibold mt-2 ${darkMode ? 'text-green-200' : 'text-green-900'}`}>{delivery.pickupLocation}</p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>📍 Dropoff Location</p>
                      <p className={`text-sm font-semibold mt-2 ${darkMode ? 'text-green-200' : 'text-green-900'}`}>{delivery.dropoffLocation}</p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>🕐 Delivered</p>
                      <p className={`text-sm font-semibold mt-2 ${darkMode ? 'text-green-200' : 'text-green-900'}`}>{delivery.deliveredDate}</p>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-6 pt-4 border-t border-green-200/50">
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-green-200' : 'text-green-900'}`}>{delivery.impactMeals}</p>
                      <p className={`text-xs ${darkMode ? 'text-green-300/70' : 'text-green-700/70'}`}>Meals Delivered</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-green-200' : 'text-green-900'}`}>{delivery.impactPeople}</p>
                      <p className={`text-xs ${darkMode ? 'text-green-300/70' : 'text-green-700/70'}`}>People Served</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-2xl font-bold ${darkMode ? 'text-green-200' : 'text-green-900'}`}>{delivery.co2Reduced}</p>
                      <p className={`text-xs ${darkMode ? 'text-green-300/70' : 'text-green-700/70'}`}>kg CO₂ Saved</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => openGoogleMaps(delivery.pickupCoord, delivery.dropoffCoord)}
                      className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                        darkMode
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Map className="w-4 h-4" /> View Distance in Maps
                    </button>
                    <button 
                      onClick={() => openGoogleMaps(delivery.pickupCoord, delivery.dropoffCoord)}
                      className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                        darkMode
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <Navigation className="w-4 h-4" /> Start Travel
                    </button>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {pendingDeliveries.filter(d => deliveryFilter === 'all' || d.status === deliveryFilter).length === 0 && 
                (deliveryFilter !== 'completed' || myDeliveries.length === 0) && (
                <div className="text-center py-12">
                  <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No {deliveryFilter !== 'all' ? deliveryFilter : ''} deliveries found
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== CONFIRMATION MODAL ==================== */}
        {showConfirmationModal && selectedForConfirmation && (
          <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4`}>
            <div className={`${darkMode ? 'bg-slate-900' : 'bg-white'} rounded-lg max-w-md w-full p-6 border-2 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {/* Error Message */}
              {postError && (
                <div className={`mb-6 p-4 rounded-lg flex gap-3 ${darkMode ? 'bg-red-900/30 border border-red-700/50' : 'bg-red-50 border border-red-200'}`}>
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  <p className={`${darkMode ? 'text-red-300' : 'text-red-700'} font-medium`}>Failed to post food</p>
                </div>
              )}

              {/* Delivery Details */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {selectedForConfirmation.foodType}
                </h3>
                <div className={`space-y-3 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <div className="flex justify-between">
                    <span>📍 Pickup:</span>
                    <span className="font-semibold">{selectedForConfirmation.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📍 Dropoff:</span>
                    <span className="font-semibold">{selectedForConfirmation.dropoffLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📏 Distance:</span>
                    <span className="font-semibold">{selectedForConfirmation.distance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>👥 Meals:</span>
                    <span className="font-semibold">{selectedForConfirmation.meals}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowConfirmationModal(false)}
                  className={`px-4 py-3 rounded-lg font-semibold border-2 transition ${
                    darkMode
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-400 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ← Edit Details
                </button>
                <button 
                  onClick={() => {
                    // Update delivery status to 'in-delivery'
                    const updatedDeliveries = pendingDeliveries.map(d =>
                      d.id === selectedForConfirmation.id ? { ...d, status: 'in-delivery' as const } : d
                    );
                    setPendingDeliveries(updatedDeliveries);
                    setPostError(false);
                    setTimeout(() => {
                      setShowConfirmationModal(false);
                      setSelectedForConfirmation(null);
                    }, 1500);
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                    darkMode
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  ✓ {postError ? 'Confirm & Post' : 'Posted!'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ELITE MODE PAGE ==================== */}
        {activePage === 'elite' && (
          <div className={`p-8 rounded-lg border-2 ${
            darkMode ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-600/50' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <Star className={`w-8 h-8 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                Elite Mode - Premium Experience
              </h2>
            </div>

            <div className={`p-6 rounded-lg mb-6 ${darkMode ? 'bg-purple-900/40 border border-purple-600/50' : 'bg-purple-100 border border-purple-300'}`}>
              <p className={`text-lg font-semibold mb-3 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                🎯 What is Elite Mode?
              </p>
              <p className={`${darkMode ? 'text-purple-200/90' : 'text-purple-900/90'}`}>
                Elite Mode unlocks advanced features for power users who want to maximize their impact. Get access to premium food quality verification, 
                enhanced analytics, priority deliveries, and exclusive rewards. Join our elite community of impact-driven volunteers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className={`p-5 rounded-lg border-2 ${darkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-200'}`}>
                <p className="text-2xl mb-2">✨ Premium Features</p>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                  <li>✓ Advanced food freshness AI detection</li>
                  <li>✓ Real-time impact analytics dashboard</li>
                  <li>✓ Priority access to high-reward deliveries</li>
                  <li>✓ Exclusive monthly challenges & bonuses</li>
                  <li>✓ Faster payment processing</li>
                  <li>✓ Direct support team access</li>
                </ul>
              </div>

              <div className={`p-5 rounded-lg border-2 ${darkMode ? 'bg-amber-900/20 border-amber-600' : 'bg-amber-50 border-amber-200'}`}>
                <p className="text-2xl mb-2">🏆 Benefits</p>
                <ul className={`space-y-2 text-sm ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                  <li>💰 20% bonus on all reward points</li>
                  <li>🎁 Exclusive elite member badges</li>
                  <li>📈 Detailed performance analytics</li>
                  <li>🌟 Recognition in leaderboard</li>
                  <li>👑 VIP status in all programs</li>
                  <li>🎯 Custom delivery notifications</li>
                </ul>
              </div>
            </div>

            <button className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              darkMode
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}>
              Upgrade to Elite Mode Now
            </button>
          </div>
        )}

        {/* ==================== FOOD FRESHNESS PAGE ==================== */}
        {activePage === 'freshness' && (
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              🔍 Food Freshness Checker
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode ? 'bg-blue-900/30 border-blue-600' : 'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload Food Image
                </h3>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-8 rounded-lg border-2 border-dashed cursor-pointer transition ${
                    darkMode ? 'bg-blue-900/50 border-blue-600/50 hover:border-blue-400' : 'bg-blue-100/50 border-blue-300 hover:border-blue-400'
                  }`}
                >
                  <div className="text-center">
                    <Camera className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`font-semibold ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>Click to upload image</p>
                    <p className={`text-sm ${darkMode ? 'text-blue-300/70' : 'text-blue-700/70'}`}>or drag and drop</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    <Upload className="w-4 h-4" /> From Gallery
                  </button>
                  <button className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    <Camera className="w-4 h-4" /> Use Camera
                  </button>
                </div>
              </div>

              {/* Results Section */}
              <div className={`p-6 rounded-lg border-2 ${
                darkMode ? 'bg-green-900/30 border-green-600' : 'bg-green-50 border-green-200'
              }`}>
                <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  Analysis Results
                </h3>

                {freshnessResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-5xl font-bold mb-2 ${
                        freshnessResult.status === 'Fresh'
                          ? 'text-green-500'
                          : freshnessResult.status === 'Acceptable'
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}>
                        {freshnessResult.freshness}%
                      </div>
                      <span className={`px-4 py-2 rounded-full font-semibold text-sm ${
                        freshnessResult.status === 'Fresh'
                          ? darkMode ? 'bg-green-600/40 text-green-200' : 'bg-green-200 text-green-800'
                          : freshnessResult.status === 'Acceptable'
                          ? darkMode ? 'bg-yellow-600/40 text-yellow-200' : 'bg-yellow-200 text-yellow-800'
                          : darkMode ? 'bg-red-600/40 text-red-200' : 'bg-red-200 text-red-800'
                      }`}>
                        {freshnessResult.status}
                      </span>
                    </div>

                    <p className={`text-center mt-4 ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                      {freshnessResult.details}
                    </p>

                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/40' : 'bg-green-100'}`}>
                      <p className={`text-sm font-semibold ${darkMode ? 'text-green-300' : 'text-green-800'}`}>
                        ✓ Safe to deliver: {freshnessResult.freshness >= 70 ? 'YES' : 'NO'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-center py-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Upload an image to check food freshness
                  </p>
                )}
              </div>
            </div>

            <div className={`mt-6 p-5 rounded-lg ${darkMode ? 'bg-blue-900/40 border border-blue-600/50' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>💡 How it works:</strong> Our AI model analyzes food images to detect freshness indicators including color, texture, and visible decay. 
                Results above 80% indicate safe food for delivery. Always trust the system results for quality assurance.
              </p>
            </div>
          </div>
        )}

        {/* ==================== IMPACT REPORT PAGE ==================== */}
        {activePage === 'impact' && (
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              📊 Your Impacts
            </h2>

            {selectedImpactCard ? (
              // Detailed Impact View
              <div>
                <button
                  onClick={() => setSelectedImpactCard(null)}
                  className={`mb-4 px-4 py-2 rounded-lg ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  ← Back to Summary
                </button>

                <div className={`p-8 rounded-lg border-2 ${
                  darkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedImpactCard.foodType}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className={`p-6 rounded-lg ${darkMode ? 'bg-orange-900/30 border border-orange-600/50' : 'bg-orange-50 border border-orange-200'}`}>
                      <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>Meals Provided</p>
                      <p className={`text-4xl font-bold ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                        {selectedImpactCard.impactMeals}
                      </p>
                    </div>
                    <div className={`p-6 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-600/50' : 'bg-green-50 border border-green-200'}`}>
                      <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>People Served</p>
                      <p className={`text-4xl font-bold ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                        {selectedImpactCard.impactPeople}
                      </p>
                    </div>
                    <div className={`p-6 rounded-lg ${darkMode ? 'bg-emerald-900/30 border border-emerald-600/50' : 'bg-emerald-50 border border-emerald-200'}`}>
                      <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>CO₂ Reduced (kg)</p>
                      <p className={`text-4xl font-bold ${darkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>
                        {selectedImpactCard.co2Reduced}
                      </p>
                    </div>
                  </div>

                  <div className={`p-6 rounded-lg ${darkMode ? 'bg-slate-900/40 border border-slate-600/50' : 'bg-slate-100 border border-slate-300'}`}>
                    <h4 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Delivery Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>From:</strong> {selectedImpactCard.organization}</p>
                      <p><strong>Pickup:</strong> {selectedImpactCard.pickupLocation}</p>
                      <p><strong>Delivered to:</strong> {selectedImpactCard.dropoffLocation}</p>
                      <p><strong>Date:</strong> {selectedImpactCard.deliveredDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Summary View
              <div className="space-y-6">
                {/* Food Diverted Card */}
                <div className={`p-6 rounded-lg border-2 ${
                  darkMode ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-600/50' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {stats.foodDiverted} kg
                      </h3>
                      <p className={`text-lg font-semibold mt-2 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                        Food Diverted from Waste
                      </p>
                    </div>
                    <Leaf className={`w-16 h-16 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  </div>
                </div>

                {/* Individual Deliveries */}
                <div>
                  <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Delivery Impacts
                  </h3>
                  <div className="space-y-4">
                    {myDeliveries.map((delivery) => (
                      <div
                        key={delivery.id}
                        onClick={() => setSelectedImpactCard(delivery)}
                        className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                          darkMode
                            ? 'bg-blue-900/30 border-blue-600/50 hover:border-[#D4AF37]'
                            : 'bg-white border-blue-200 hover:border-[#D4AF37]'
                        }`}
                      >
                        <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {delivery.foodType}
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800/40' : 'bg-slate-100'}`}>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>{delivery.impactMeals}</p>
                            <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Meals</p>
                          </div>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800/40' : 'bg-slate-100'}`}>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>{delivery.impactPeople}</p>
                            <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>People</p>
                          </div>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-800/40' : 'bg-slate-100'}`}>
                            <p className={`text-2xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>{delivery.co2Reduced}</p>
                            <p className={`text-xs font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>kg CO₂</p>
                          </div>
                        </div>
                        <p className={`text-xs mt-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Click to view detailed report</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== ABOUT US PAGE ==================== */}
        {activePage === 'about' && (
          <div className={`p-8 rounded-lg border-2 ${
            darkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              About ResQ Meal
            </h2>

            <div className={`space-y-6 ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
              <p className="text-lg">
                ResQ Meal is a mission-driven platform connecting food donors with those in need. We bridge the gap between surplus food and hungry communities 
                through a collaborative ecosystem of restaurants, volunteers, and NGOs.
              </p>

              <div>
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>🌟 Our Mission</h3>
                <p>
                  Reduce food waste while fighting hunger through a collaborative ecosystem. We believe no edible food should go to waste when people are going hungry.
                </p>
              </div>

              <div>
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>🎯 Our Vision</h3>
                <p>
                  A world where no edible food goes to waste and everyone has access to nutritious meals. We envision communities supporting each other through sustainable food sharing.
                </p>
              </div>

              <div>
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>💪 Your Impact as a Volunteer</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Deliver fresh food donations from restaurants to NGOs and individuals</li>
                  <li>Make a direct impact in your community</li>
                  <li>Track your environmental impact (CO₂ saved, food waste prevented)</li>
                  <li>Earn reward points and exclusive recognition</li>
                  <li>Join a passionate community of change-makers</li>
                </ul>
              </div>

              <div className={`p-5 rounded-lg ${darkMode ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                <p className="font-semibold mb-2">✨ Volunteer Benefits</p>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  <li>Earn impact points & rewards for every delivery</li>
                  <li>Build meaningful community connections</li>
                  <li>Track your environmental impact</li>
                  <li>Access exclusive Elite Mode features</li>
                  <li>Recognition in community leaderboards</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SETTINGS PAGE ==================== */}
        {activePage === 'settings' && (
          <div className="space-y-6">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>

            {/* User Profile */}
            <div className={`p-6 rounded-lg border-2 ${
              darkMode ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                👤 User Profile
              </h3>
              <div className="space-y-3">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Name</p>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.name}</p>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Email</p>
                  <p className={`text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.email}</p>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Role</p>
                  <p className={`text-lg capitalize ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user.role}</p>
                </div>
              </div>
              <button className={`mt-4 px-4 py-2 rounded-lg font-semibold ${
                darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Edit Profile
              </button>
            </div>

            {/* Preferences */}
            <div className={`p-6 rounded-lg border-2 ${
              darkMode ? 'bg-purple-900/20 border-purple-600' : 'bg-purple-50 border-purple-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                🎨 Preferences
              </h3>

              <div className="space-y-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <label className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Dark Mode
                  </label>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {darkMode ? 'Enabled' : 'Disabled'}
                  </button>
                </div>

                {/* Language Selection */}
                <div className="flex items-center justify-between">
                  <label className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'ta' | 'hi')}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      darkMode
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-900'
                    }`}
                  >
                    <option value="en">English</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className={`p-6 rounded-lg border-2 ${
              darkMode ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                🔔 Notifications
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'New Deliveries Available', key: 'newDeliveries' },
                  { label: 'Delivery Reminders', key: 'deliveryReminders' },
                  { label: 'Community Updates', key: 'communityUpdates' },
                  { label: 'Weekly Impact Summary', key: 'weeklyImpact' },
                ].map((notif) => {
                  const isEnabled = notifications[notif.key as keyof typeof notifications];
                  return (
                    <div key={notif.key} className="flex items-center justify-between">
                      <label className={darkMode ? 'text-green-200' : 'text-green-900'}>{notif.label}</label>
                      <button
                        onClick={() => setNotifications({ ...notifications, [notif.key]: !isEnabled })}
                        className={`w-12 h-6 rounded-full transition ${
                          isEnabled ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition ${isEnabled ? 'ml-6' : 'ml-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Support */}
            <div className={`p-6 rounded-lg border-2 ${
              darkMode ? 'bg-amber-900/20 border-amber-600' : 'bg-amber-50 border-amber-200'
            }`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                ❓ Help & Support
              </h3>
              <p className={`mb-4 ${darkMode ? 'text-amber-200' : 'text-amber-900'}`}>
                Need help? Contact our support team or check our FAQs.
              </p>
              <button className={`px-4 py-2 rounded-lg font-semibold ${
                darkMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}>
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default VolunteerDashboard;
