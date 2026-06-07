import { useMemo, useState } from 'react';
import { MapPin, Search, Filter } from 'lucide-react';
import { useInfiniteFoodPosts } from '@/hooks/useFoodPosts';
import { FoodMapView } from '@/components/FoodMapView';
import { FoodPostSkeleton } from '@/components/skeletons/FoodPostSkeleton';
import { MlFreshnessBadge } from '@/components/MlFreshnessBadge';
import { useLanguage } from '@/context/LanguageContext';
import { useInView } from 'react-intersection-observer';
import type { AvailableFoodItem } from '@/components/AvailableFoodCarousel';

const FOOD_TYPE_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Meals', value: 'meals' },
  { label: 'Vegetables', value: 'vegetables' },
  { label: 'Baked', value: 'baked' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Fruits', value: 'fruits' },
  { label: 'Others', value: 'others' },
];

export function MapView() {
  const { t } = useLanguage();
  const [foodType, setFoodType] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'map' | 'list'>('map');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFoodPosts(
    foodType ? { food_type: foodType } : undefined
  );

  const items = useMemo(() => {
    const pages = data?.pages ?? [];
    const flat = pages.flat();
    if (!search.trim()) return flat;
    const q = search.trim().toLowerCase();
    return flat.filter((i) => i.food_name?.toLowerCase().includes(q));
  }, [data, search]);

  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-600" aria-hidden />
            {t('mapView')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {t('neededFoodMap')}
          </p>
        </header>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchFood')}
              aria-label={t('searchFood')}
              className="w-full pl-9 pr-3 py-2 rounded-lg border bg-white dark:bg-slate-900 dark:border-slate-700"
            />
          </div>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              type="button"
              onClick={() => setView('map')}
              aria-pressed={view === 'map'}
              aria-label={t('mapView')}
              className={`px-3 py-2 text-sm ${view === 'map' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900'}`}
            >
              {t('mapView')}
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              aria-label={t('listView')}
              className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900'}`}
            >
              {t('listView')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-slate-500" aria-hidden />
          {FOOD_TYPE_FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setFoodType(f.value)}
              aria-pressed={foodType === f.value}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                foodType === f.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <FoodPostSkeleton key={i} />
            ))}
          </div>
        ) : view === 'map' ? (
          <FoodMapView items={items} className="min-h-[480px]" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <FoodListCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <p className="col-span-full text-center text-slate-500 py-12">{t('loading')}</p>
            )}
            <div ref={loadMoreRef} className="col-span-full h-4" />
            {isFetchingNextPage && (
              <div className="col-span-full grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FoodPostSkeleton />
                <FoodPostSkeleton />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FoodListCard({ item }: { item: AvailableFoodItem & { source?: string } }) {
  const { t } = useLanguage();
  return (
    <article className="rounded-xl border bg-white dark:bg-slate-900 p-4 space-y-2 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900 dark:text-white">{item.food_name}</h3>
        <MlFreshnessBadge source={item.source} />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {item.quantity_servings} {t('servings')} · {item.food_type}
      </p>
      {item.location?.address && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" aria-hidden />
          {item.location.address}
        </p>
      )}
    </article>
  );
}
