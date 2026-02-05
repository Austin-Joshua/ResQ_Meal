import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Thermometer, Clock, MapPin, UtensilsCrossed } from 'lucide-react';
import { foodApi } from '@/services/api';

export interface AvailableFoodItem {
  id: number;
  food_name: string;
  food_type: string;
  quantity_servings: number;
  description?: string;
  location?: { address?: string };
  photo_url?: string | null;
  safety_window_minutes?: number;
  min_storage_temp_celsius?: number | null;
  max_storage_temp_celsius?: number | null;
  availability_time_hours?: number | null;
  freshness_score?: number | null;
  quality_score?: number | null;
  urgency_score?: number;
  status?: string;
}

const DAY_LABELS = ['All', 'Meals', 'Vegetables', 'Baked', 'Dairy', 'Fruits', 'Others'];
const FOOD_TYPE_FILTERS: Record<string, string> = {
  All: '',
  Meals: 'meals',
  Vegetables: 'vegetables',
  Baked: 'baked',
  Dairy: 'dairy',
  Fruits: 'fruits',
  Others: 'others',
};

/** Stock food images (Unsplash) for placeholders when photo_url is missing. */
const STOCK_FOOD_IMAGES: Record<string, string[]> = {
  meals: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1547592168-6588c2e2e0b3?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400&fit=crop',
  ],
  vegetables: [
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2e7fd?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1597362925123-77861d3f3f0a?w=400&h=400&fit=crop',
  ],
  baked: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1608198396328-eb3d701c7442?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
  ],
  dairy: [
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486297676561-bf107e7e1e6a?w=400&h=400&fit=crop',
  ],
  fruits: [
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1568709946310-0f6b2c2e5b6e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=400&fit=crop',
  ],
  others: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  ],
};

function getStockImageUrl(item: AvailableFoodItem | null | undefined): string {
  if (!item) return STOCK_FOOD_IMAGES.others[0];
  if (item.photo_url) return item.photo_url;
  const list = STOCK_FOOD_IMAGES[item.food_type] ?? STOCK_FOOD_IMAGES.others;
  const index = (item.id ?? 0) % list.length;
  return list[index];
}

interface AvailableFoodCarouselProps {
  darkMode: boolean;
  title?: string;
  searchPlaceholder?: string;
}

export const AvailableFoodCarousel: React.FC<AvailableFoodCarouselProps> = ({
  darkMode,
  title = "Today's Available Food",
  searchPlaceholder = 'Search for surplus food...',
}) => {
  const [items, setItems] = useState<AvailableFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [sortBy, setSortBy] = useState<'urgency' | 'newest' | 'servings' | 'timeLeft'>('urgency');
  const [centerIndex, setCenterIndex] = useState(0);
  const [search, setSearch] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayFilter = DAY_LABELS[activeDayIndex];
  const foodTypeFilter = FOOD_TYPE_FILTERS[dayFilter] ?? '';

  const SORT_OPTIONS: { id: typeof sortBy; label: string }[] = [
    { id: 'urgency', label: 'Urgency' },
    { id: 'newest', label: 'Newest' },
    { id: 'servings', label: 'Servings' },
    { id: 'timeLeft', label: 'Time left' },
  ];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string | number> = { limit: 50 };
    if (foodTypeFilter) params.food_type = foodTypeFilter;
    foodApi
      .getAvailableFood(params)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data ?? [];
        setItems(Array.isArray(data) ? data : []);
        setCenterIndex(0);
      })
      .catch(() => {
        if (cancelled) return;
        // Sample data when API fails or no auth
        setItems([
          {
            id: 1,
            food_name: 'Boiled eggs + apple shake',
            food_type: 'meals',
            quantity_servings: 4,
            safety_window_minutes: 30,
            min_storage_temp_celsius: 4,
            max_storage_temp_celsius: 60,
            availability_time_hours: 2,
            location: { address: 'Tiruvallur' },
            urgency_score: 75,
          },
          {
            id: 2,
            food_name: 'Fresh grilled vegetables',
            food_type: 'vegetables',
            quantity_servings: 20,
            safety_window_minutes: 60,
            min_storage_temp_celsius: 0,
            max_storage_temp_celsius: 10,
            availability_time_hours: 4,
            location: { address: 'Chennai Central' },
            urgency_score: 60,
          },
          {
            id: 3,
            food_name: 'Cooked pasta dishes',
            food_type: 'meals',
            quantity_servings: 15,
            safety_window_minutes: 45,
            min_storage_temp_celsius: 4,
            max_storage_temp_celsius: 60,
            availability_time_hours: 3,
            location: { address: 'Anna Nagar' },
            urgency_score: 70,
          },
          {
            id: 4,
            food_name: 'Whole wheat bread & rolls',
            food_type: 'baked',
            quantity_servings: 30,
            safety_window_minutes: 90,
            min_storage_temp_celsius: 15,
            max_storage_temp_celsius: 25,
            availability_time_hours: 8,
            location: { address: 'T Nagar' },
            urgency_score: 50,
          },
          {
            id: 5,
            food_name: 'Mixed fruit platter',
            food_type: 'fruits',
            quantity_servings: 12,
            safety_window_minutes: 120,
            min_storage_temp_celsius: 2,
            max_storage_temp_celsius: 8,
            availability_time_hours: 6,
            location: { address: 'Adyar' },
            urgency_score: 55,
          },
          {
            id: 6,
            food_name: 'Curd rice & sambar',
            food_type: 'meals',
            quantity_servings: 25,
            safety_window_minutes: 45,
            min_storage_temp_celsius: 4,
            max_storage_temp_celsius: 60,
            availability_time_hours: 2,
            location: { address: 'Mylapore' },
            urgency_score: 78,
          },
          {
            id: 7,
            food_name: 'Croissants & Danish pastries',
            food_type: 'baked',
            quantity_servings: 18,
            safety_window_minutes: 60,
            min_storage_temp_celsius: 15,
            max_storage_temp_celsius: 25,
            availability_time_hours: 4,
            location: { address: 'Nungambakkam' },
            urgency_score: 65,
          },
          {
            id: 8,
            food_name: 'Fresh paneer & milk sweets',
            food_type: 'dairy',
            quantity_servings: 10,
            safety_window_minutes: 180,
            min_storage_temp_celsius: 2,
            max_storage_temp_celsius: 6,
            availability_time_hours: 12,
            location: { address: 'Velachery' },
            urgency_score: 40,
          },
          {
            id: 9,
            food_name: 'Stir-fried greens & beans',
            food_type: 'vegetables',
            quantity_servings: 15,
            safety_window_minutes: 40,
            min_storage_temp_celsius: 4,
            max_storage_temp_celsius: 50,
            availability_time_hours: 2,
            location: { address: 'Egmore' },
            urgency_score: 72,
          },
          {
            id: 10,
            food_name: 'Biryani & raita',
            food_type: 'meals',
            quantity_servings: 20,
            safety_window_minutes: 50,
            min_storage_temp_celsius: 4,
            max_storage_temp_celsius: 55,
            availability_time_hours: 3,
            location: { address: 'Guindy' },
            urgency_score: 68,
          },
          {
            id: 11,
            food_name: 'Bananas & seasonal fruits',
            food_type: 'fruits',
            quantity_servings: 35,
            safety_window_minutes: 1440,
            min_storage_temp_celsius: 10,
            max_storage_temp_celsius: 25,
            availability_time_hours: 24,
            location: { address: 'Porur' },
            urgency_score: 42,
          },
          {
            id: 12,
            food_name: 'Sandwiches & wraps',
            food_type: 'others',
            quantity_servings: 14,
            safety_window_minutes: 90,
            min_storage_temp_celsius: 4,
            max_storage_temp_celsius: 25,
            availability_time_hours: 4,
            location: { address: 'OMR' },
            urgency_score: 58,
          },
        ]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [foodTypeFilter]);

  const searchFiltered = search.trim()
    ? items.filter((i) => i.food_name.toLowerCase().includes(search.trim().toLowerCase()))
    : items;
  const filteredItems = [...searchFiltered].sort((a, b) => {
    switch (sortBy) {
      case 'urgency':
        return (b.urgency_score ?? 0) - (a.urgency_score ?? 0);
      case 'newest':
        return (b.id ?? 0) - (a.id ?? 0);
      case 'servings':
        return (b.quantity_servings ?? 0) - (a.quantity_servings ?? 0);
      case 'timeLeft':
        return (a.safety_window_minutes ?? 999) - (b.safety_window_minutes ?? 999);
      default:
        return 0;
    }
  });
  const current = filteredItems[centerIndex] ?? null;

  const goPrev = () => setCenterIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCenterIndex((i) => Math.min(filteredItems.length - 1, i + 1));

  return (
    <div className={`rounded-2xl overflow-hidden transition-all duration-300 border text-left ${
      darkMode ? 'bg-white/5 border-slate-600/40' : 'bg-white border-slate-200 shadow-lg'
    }`}>
      {/* Day-style navigation bar */}
      <div className={`px-4 py-3 border-b ${
        darkMode ? 'border-slate-600/50 bg-slate-800/30' : 'border-slate-100 bg-slate-50'
      }`}>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${
          darkMode ? 'text-amber-400' : 'text-slate-600'
        }`}>
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className={`flex rounded-full border overflow-x-auto no-scrollbar ${
            darkMode ? 'border-slate-600 bg-slate-800/50' : 'border-slate-200 bg-slate-100'
          }`}>
            {DAY_LABELS.map((label, idx) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveDayIndex(idx)}
                className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition ${
                  idx === activeDayIndex
                    ? darkMode ? 'text-white' : 'text-slate-900'
                    : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
                {idx === activeDayIndex && (
                  <span
                    className="absolute bottom-0 left-1 right-1 h-0.5 bg-red-500 rounded-full"
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-500'
              }`}
            />
          </div>
        </div>
        {/* Sort menu */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={`text-xs font-medium shrink-0 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sort by:
          </span>
          <div className={`flex flex-wrap gap-1.5 rounded-lg p-1 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  sortBy === opt.id
                    ? darkMode ? 'bg-amber-600/50 text-amber-200' : 'bg-amber-200 text-amber-900'
                    : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel content */}
      <div className="p-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-500">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
            <UtensilsCrossed className="w-12 h-12 mb-3 opacity-50" />
            <p>No available food for this filter.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 sm:gap-4" ref={scrollRef}>
              <button
                type="button"
                onClick={goPrev}
                disabled={centerIndex === 0}
                className={`p-2 rounded-full transition ${
                  centerIndex === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                }`}
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Left (previous) – smaller, faded */}
              {centerIndex > 0 && (
                <div
                  className="hidden sm:flex flex-col items-center w-24 opacity-50 scale-90 cursor-pointer"
                  onClick={goPrev}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && goPrev()}
                  aria-label="View previous"
                >
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                    darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-200'
                  }`}>
                    <img
                      src={getStockImageUrl(filteredItems[centerIndex - 1])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Center – large plate + info card */}
              <div className="flex flex-col items-center max-w-sm w-full mx-2">
                <div
                  className={`w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 flex-shrink-0 ${
                    darkMode ? 'border-slate-500 bg-slate-700 shadow-xl' : 'border-slate-300 bg-slate-100 shadow-lg'
                  }`}
                >
                  <img
                    src={getStockImageUrl(current)}
                    alt={current?.food_name ?? 'Food'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Info card (speech-bubble style below plate) */}
                <div
                  className={`mt-4 w-full rounded-2xl border-2 shadow-lg ${
                    darkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="p-4">
                    <p className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-1 ${
                      darkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden />
                      {(current?.food_type ?? 'food').replace(/^./, (c) => c.toUpperCase())}
                    </p>
                    <h4 className={`text-lg font-bold mb-4 ${
                      darkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {current?.food_name ?? '—'}
                    </h4>
                    {/* Nutrition-style stats row */}
                    <div className="grid grid-cols-5 gap-2 text-center border-t pt-3">
                      <div>
                        <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {current?.quantity_servings ?? 0}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>servings</p>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-600">
                        <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {current?.safety_window_minutes ?? '—'}m
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>safety</p>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center">
                        <Thermometer className={`w-3 h-3 mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {current?.min_storage_temp_celsius != null && current?.max_storage_temp_celsius != null
                            ? `${current.min_storage_temp_celsius}°–${current.max_storage_temp_celsius}°`
                            : '—'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>temp</p>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center">
                        <Clock className={`w-3 h-3 mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {current?.availability_time_hours ?? '—'}h
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>available</p>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center">
                        <MapPin className={`w-3 h-3 mb-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                        <p className={`text-sm font-bold truncate w-full px-0.5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} title={current?.location?.address ?? ''}>
                          {current?.location?.address ? current.location.address.split(',')[0] : '—'}
                        </p>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>location</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right (next) – smaller, faded */}
              {centerIndex < filteredItems.length - 1 && (
                <div
                  className="hidden sm:flex flex-col items-center w-24 opacity-50 scale-90 cursor-pointer"
                  onClick={goNext}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && goNext()}
                  aria-label="View next"
                >
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
                    darkMode ? 'border-slate-600 bg-slate-700' : 'border-slate-300 bg-slate-200'
                  }`}>
                    <img
                      src={getStockImageUrl(filteredItems[centerIndex + 1])}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={goNext}
                disabled={centerIndex >= filteredItems.length - 1}
                className={`p-2 rounded-full transition ${
                  centerIndex >= filteredItems.length - 1
                    ? 'opacity-40 cursor-not-allowed'
                    : darkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                }`}
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <p className={`text-center text-xs mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              {centerIndex + 1} of {filteredItems.length}
            </p>
          </>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
