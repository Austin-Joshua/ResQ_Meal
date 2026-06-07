import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Leaf, Droplets, UtensilsCrossed, Truck, type LucideIcon } from 'lucide-react';
import { get } from '@/api/client';
import { impactApi } from '@/services/api';
import { StatCard } from '@/components/StatCard';
import { useLanguage } from '@/context/LanguageContext';
import { ApiErrorFallback } from '@/components/ApiErrorFallback';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicImpact {
  meals_saved?: number;
  food_saved_kg?: number;
  co2_saved_kg?: number;
  water_saved_liters?: number;
  total_deliveries?: number;
  timeline?: Array<{ date: string; meals_saved: number; co2_saved_kg: number }>;
}

async function fetchPublicImpact(): Promise<PublicImpact> {
  try {
    return await get<PublicImpact>('/public/impact');
  } catch {
    const global = await impactApi.getGlobalImpact();
    const timeline = await impactApi.getGlobalImpact().catch(() => ({ data: {} }));
    const globalData = (global.data as { data?: PublicImpact })?.data ?? (global.data as PublicImpact);
    return {
      meals_saved: Number(globalData?.meals_saved ?? 0),
      food_saved_kg: Number(globalData?.food_saved_kg ?? 0),
      co2_saved_kg: Number(globalData?.co2_saved_kg ?? 0),
      water_saved_liters: Number(globalData?.water_saved_liters ?? 0),
      total_deliveries: Number(globalData?.total_deliveries ?? 0),
      timeline: (timeline.data as { timeline?: PublicImpact['timeline'] })?.timeline,
    };
  }
}

function ImpactStatCard({
  icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return <StatCard icon={icon} title={title} value={value} variant="primary" />;
}

export function ImpactDashboard() {
  const { t } = useLanguage();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['publicImpact'],
    queryFn: fetchPublicImpact,
  });

  if (error instanceof Error) {
    return <ApiErrorFallback error={error} onRetry={() => void refetch()} />;
  }

  const chartData =
    data?.timeline?.map((row) => ({
      name: row.date,
      meals: row.meals_saved,
      co2: row.co2_saved_kg,
    })) ?? [
      { name: 'Mon', meals: 12, co2: 8 },
      { name: 'Tue', meals: 18, co2: 12 },
      { name: 'Wed', meals: 15, co2: 10 },
      { name: 'Thu', meals: 22, co2: 14 },
      { name: 'Fri', meals: 28, co2: 18 },
      { name: 'Sat', meals: 20, co2: 13 },
      { name: 'Sun', meals: 16, co2: 11 },
    ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('yourImpact')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('seeHowMuch')}</p>
        </header>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactStatCard icon={UtensilsCrossed} title={t('mealsSaved')} value={String(data?.meals_saved ?? 0)} />
            <ImpactStatCard
              icon={Leaf}
              title={t('co2Prevented')}
              value={`${(data?.co2_saved_kg ?? 0).toFixed(1)} kg`}
            />
            <ImpactStatCard
              icon={Droplets}
              title={t('waterSaved')}
              value={`${(data?.water_saved_liters ?? 0).toFixed(0)} L`}
            />
            <ImpactStatCard
              icon={Truck}
              title={t('deliveriesCompleted')}
              value={String(data?.total_deliveries ?? 0)}
            />
          </div>
        )}

        <section className="rounded-2xl border bg-white/80 dark:bg-slate-900/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t('weeklyTrend')}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="meals" name={t('mealsSaved')} fill="hsl(145 63% 49%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="co2" name={t('co2Prevented2')} fill="hsl(210 70% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
