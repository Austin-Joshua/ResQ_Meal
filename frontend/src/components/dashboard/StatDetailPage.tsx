import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ProgressFill( { percentage, className }: { percentage: number; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.width = `${percentage}%`;
  }, [percentage]);
  return <div ref={ref} className={className} />;
};

export function StatDetailPage( { darkMode, onBack, stat, t }: { darkMode: boolean; onBack: () => void; stat: { id: string; icon: string; label: string; value: string; color: string }; t: any; onNavigateToPath?: (path: string) => void }) {
  const [detailedView, setDetailedView] = useState<{ type: 'category' | 'period' | 'insights' | 'trend' | null; data?: any }>({ type: null });

  // Mock data for each stat type
  const getStatData = () => {
    const data: Record<string, { 
      total: string; 
      breakdown: { label: string; value: string; percentage: number }[];
      timeline: { date: string; value: number }[];
      insights: string[];
      comparison: { period: string; value: string; change: number }[];
    }> = {
      mealsSaved: {
        total: '3,450',
        breakdown: [
          { label: t('thisWeek'), value: '892', percentage: 26 },
          { label: t('thisMonth'), value: '2,340', percentage: 68 },
          { label: t('thisYear'), value: '3,450', percentage: 100 },
        ],
        timeline: [
          { date: 'Mon', value: 120 },
          { date: 'Tue', value: 135 },
          { date: 'Wed', value: 128 },
          { date: 'Thu', value: 165 },
          { date: 'Fri', value: 155 },
          { date: 'Sat', value: 180 },
          { date: 'Sun', value: 195 },
        ],
        insights: [
          'Average 492 meals saved per week',
          'Peak day: Sunday with 195 meals',
          'Consistent growth trend observed',
          'Top contributor: Restaurant partnerships',
        ],
        comparison: [
          { period: t('lastWeek'), value: '875', change: 1.9 },
          { period: t('lastMonth'), value: '2,100', change: 11.4 },
          { period: t('lastYear'), value: '2,800', change: 23.2 },
        ],
      },
      foodDiverted: {
        total: '8,625 kg',
        breakdown: [
          { label: 'Vegetables', value: '3,200 kg', percentage: 37 },
          { label: 'Cooked Meals', value: '2,850 kg', percentage: 33 },
          { label: 'Fruits', value: '1,575 kg', percentage: 18 },
          { label: 'Other', value: '1,000 kg', percentage: 12 },
        ],
        timeline: [
          { date: 'Mon', value: 1200 },
          { date: 'Tue', value: 1350 },
          { date: 'Wed', value: 1280 },
          { date: 'Thu', value: 1650 },
          { date: 'Fri', value: 1550 },
          { date: 'Sat', value: 1800 },
          { date: 'Sun', value: 1950 },
        ],
        insights: [
          'Average 1,232 kg diverted per week',
          'Vegetables account for largest share',
          'Consistent upward trend',
          'Prevents landfill waste effectively',
        ],
        comparison: [
          { period: 'Last Week', value: '1,200 kg', change: 2.7 },
          { period: 'Last Month', value: '7,800 kg', change: 10.6 },
          { period: 'Last Year', value: '6,500 kg', change: 32.7 },
        ],
      },
      co2Prevented: {
        total: '21.5 tons',
        breakdown: [
          { label: 'This Week', value: '5.2 tons', percentage: 24 },
          { label: 'This Month', value: '14.8 tons', percentage: 69 },
          { label: 'This Year', value: '21.5 tons', percentage: 100 },
        ],
        timeline: [
          { date: 'Mon', value: 0.3 },
          { date: 'Tue', value: 0.34 },
          { date: 'Wed', value: 0.32 },
          { date: 'Thu', value: 0.41 },
          { date: 'Fri', value: 0.39 },
          { date: 'Sat', value: 0.45 },
          { date: 'Sun', value: 0.49 },
        ],
        insights: [
          'Equivalent to 45 car trips avoided',
          'Saves 2.5 kg CO₂ per kg food rescued',
          'Significant climate impact',
          'Growing environmental contribution',
        ],
        comparison: [
          { period: 'Last Week', value: '5.0 tons', change: 4.0 },
          { period: 'Last Month', value: '13.2 tons', change: 12.1 },
          { period: 'Last Year', value: '18.5 tons', change: 16.2 },
        ],
      },
      waterSaved: {
        total: '8.6M L',
        breakdown: [
          { label: 'This Week', value: '2.1M L', percentage: 24 },
          { label: 'This Month', value: '5.9M L', percentage: 69 },
          { label: 'This Year', value: '8.6M L', percentage: 100 },
        ],
        timeline: [
          { date: 'Mon', value: 300 },
          { date: 'Tue', value: 338 },
          { date: 'Wed', value: 320 },
          { date: 'Thu', value: 412 },
          { date: 'Fri', value: 387 },
          { date: 'Sat', value: 450 },
          { date: 'Sun', value: 487 },
        ],
        insights: [
          'Average 1.23M L saved per week',
          'Equivalent to 3,440 swimming pools',
          'Critical water conservation impact',
          'Sustainable resource management',
        ],
        comparison: [
          { period: 'Last Week', value: '2.0M L', change: 5.0 },
          { period: 'Last Month', value: '5.5M L', change: 7.3 },
          { period: 'Last Year', value: '7.2M L', change: 19.4 },
        ],
      },
    };
    return data[stat.id] || data.mealsSaved;
  };

  const statData = getStatData();

  // Detailed Report Components
  const CategoryDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => {
    const categoryData: Record<string, any> = {
      'Vegetables': {
        dailyBreakdown: [
          { day: 'Monday', value: '450 kg', items: ['Carrots', 'Tomatoes', 'Potatoes', 'Onions'] },
          { day: 'Tuesday', value: '520 kg', items: ['Broccoli', 'Cauliflower', 'Bell Peppers'] },
          { day: 'Wednesday', value: '480 kg', items: ['Spinach', 'Lettuce', 'Cucumbers'] },
          { day: 'Thursday', value: '600 kg', items: ['Carrots', 'Tomatoes', 'Zucchini'] },
          { day: 'Friday', value: '550 kg', items: ['Potatoes', 'Onions', 'Garlic'] },
          { day: 'Saturday', value: '400 kg', items: ['Mixed Vegetables'] },
          { day: 'Sunday', value: '200 kg', items: ['Fresh Greens'] },
        ],
        topSources: ['Restaurant A (35%)', 'Restaurant B (28%)', 'Restaurant C (22%)', 'Others (15%)'],
        impact: 'Prevented 1,184 kg CO₂ emissions',
      },
      'Cooked Meals': {
        dailyBreakdown: [
          { day: 'Monday', value: '380 kg', items: ['Curry', 'Rice', 'Bread'] },
          { day: 'Tuesday', value: '420 kg', items: ['Pasta', 'Soup', 'Stew'] },
          { day: 'Wednesday', value: '400 kg', items: ['Fried Rice', 'Noodles'] },
          { day: 'Thursday', value: '500 kg', items: ['Biryani', 'Curry', 'Roti'] },
          { day: 'Friday', value: '450 kg', items: ['Pasta', 'Pizza', 'Salad'] },
          { day: 'Saturday', value: '400 kg', items: ['Meals', 'Desserts'] },
          { day: 'Sunday', value: '300 kg', items: ['Special Meals'] },
        ],
        topSources: ['Catering Service A (40%)', 'Restaurant B (30%)', 'Event Hall C (20%)', 'Others (10%)'],
        impact: 'Fed 1,425 people',
      },
      'Fruits': {
        dailyBreakdown: [
          { day: 'Monday', value: '220 kg', items: ['Apples', 'Bananas', 'Oranges'] },
          { day: 'Tuesday', value: '250 kg', items: ['Mangoes', 'Grapes', 'Berries'] },
          { day: 'Wednesday', value: '230 kg', items: ['Pineapples', 'Papayas'] },
          { day: 'Thursday', value: '280 kg', items: ['Watermelons', 'Melons'] },
          { day: 'Friday', value: '260 kg', items: ['Apples', 'Pears', 'Peaches'] },
          { day: 'Saturday', value: '200 kg', items: ['Mixed Fruits'] },
          { day: 'Sunday', value: '135 kg', items: ['Fresh Fruits'] },
        ],
        topSources: ['Fruit Market A (32%)', 'Grocery Store B (28%)', 'Farm C (25%)', 'Others (15%)'],
        impact: 'Prevented 394 kg CO₂ emissions',
      },
      'Other': {
        dailyBreakdown: [
          { day: 'Monday', value: '140 kg', items: ['Baked Goods', 'Dairy'] },
          { day: 'Tuesday', value: '150 kg', items: ['Snacks', 'Beverages'] },
          { day: 'Wednesday', value: '145 kg', items: ['Packaged Foods'] },
          { day: 'Thursday', value: '180 kg', items: ['Baked Goods', 'Desserts'] },
          { day: 'Friday', value: '165 kg', items: ['Dairy', 'Snacks'] },
          { day: 'Saturday', value: '120 kg', items: ['Mixed Items'] },
          { day: 'Sunday', value: '100 kg', items: ['Various'] },
        ],
        topSources: ['Bakery A (35%)', 'Store B (30%)', 'Cafe C (20%)', 'Others (15%)'],
        impact: 'Prevented 250 kg CO₂ emissions',
      },
    };

    const details = categoryData[data.label] || categoryData['Other'];

    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          ← {t('backToReport') || 'Back to Report'}
        </button>

        <div className={`rounded-2xl p-8 border ${
          darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {data.label} - {t('detailedReport') || 'Detailed Report'}
          </h2>
          <p className={`text-xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-slate-700'}`}>
            {data.value} ({data.percentage}% {t('ofTotal')})
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('dailyBreakdown') || 'Daily Breakdown'}
              </h3>
              <div className="space-y-3">
                {details.dailyBreakdown.map((day: any, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{day.day}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{day.value}</span>
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {day.items.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('topSources') || 'Top Sources'}
              </h3>
              <div className="space-y-3">
                {details.topSources.map((source: string, idx: number) => (
                  <div key={idx} className={`p-3 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{source}</span>
                  </div>
                ))}
              </div>
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-emerald-900/40 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className={`font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  💚 {details.impact}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PeriodDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => {
    const periodData: Record<string, any> = {
      [t('lastWeek')]: {
        dailyData: [
          { day: 'Monday', value: data.statId === 'foodDiverted' ? '1,150 kg' : data.statId === 'co2Prevented' ? '4.8 tons' : data.statId === 'waterSaved' ? '1.9M L' : '850 meals' },
          { day: 'Tuesday', value: data.statId === 'foodDiverted' ? '1,200 kg' : data.statId === 'co2Prevented' ? '5.0 tons' : data.statId === 'waterSaved' ? '2.0M L' : '880 meals' },
          { day: 'Wednesday', value: data.statId === 'foodDiverted' ? '1,180 kg' : data.statId === 'co2Prevented' ? '4.9 tons' : data.statId === 'waterSaved' ? '1.95M L' : '870 meals' },
          { day: 'Thursday', value: data.statId === 'foodDiverted' ? '1,250 kg' : data.statId === 'co2Prevented' ? '5.2 tons' : data.statId === 'waterSaved' ? '2.1M L' : '920 meals' },
          { day: 'Friday', value: data.statId === 'foodDiverted' ? '1,220 kg' : data.statId === 'co2Prevented' ? '5.1 tons' : data.statId === 'waterSaved' ? '2.05M L' : '900 meals' },
          { day: 'Saturday', value: data.statId === 'foodDiverted' ? '1,300 kg' : data.statId === 'co2Prevented' ? '5.4 tons' : data.statId === 'waterSaved' ? '2.15M L' : '950 meals' },
          { day: 'Sunday', value: data.statId === 'foodDiverted' ? '1,350 kg' : data.statId === 'co2Prevented' ? '5.6 tons' : data.statId === 'waterSaved' ? '2.2M L' : '980 meals' },
        ],
        summary: t('lastWeekSummary') || 'Last week showed consistent performance with steady growth.',
      },
      [t('lastMonth')]: {
        weeklyData: [
          { week: 'Week 1', value: data.statId === 'foodDiverted' ? '1,800 kg' : data.statId === 'co2Prevented' ? '7.2 tons' : data.statId === 'waterSaved' ? '3.0M L' : '1,400 meals' },
          { week: 'Week 2', value: data.statId === 'foodDiverted' ? '1,950 kg' : data.statId === 'co2Prevented' ? '7.8 tons' : data.statId === 'waterSaved' ? '3.2M L' : '1,500 meals' },
          { week: 'Week 3', value: data.statId === 'foodDiverted' ? '2,000 kg' : data.statId === 'co2Prevented' ? '8.0 tons' : data.statId === 'waterSaved' ? '3.3M L' : '1,550 meals' },
          { week: 'Week 4', value: data.statId === 'foodDiverted' ? '2,050 kg' : data.statId === 'co2Prevented' ? '8.2 tons' : data.statId === 'waterSaved' ? '3.4M L' : '1,600 meals' },
        ],
        summary: t('lastMonthSummary') || 'Last month demonstrated strong growth with increasing impact each week.',
      },
      [t('lastYear')]: {
        monthlyData: [
          { month: 'Jan', value: data.statId === 'foodDiverted' ? '500 kg' : data.statId === 'co2Prevented' ? '2.0 tons' : data.statId === 'waterSaved' ? '0.8M L' : '400 meals' },
          { month: 'Feb', value: data.statId === 'foodDiverted' ? '520 kg' : data.statId === 'co2Prevented' ? '2.1 tons' : data.statId === 'waterSaved' ? '0.85M L' : '420 meals' },
          { month: 'Mar', value: data.statId === 'foodDiverted' ? '550 kg' : data.statId === 'co2Prevented' ? '2.2 tons' : data.statId === 'waterSaved' ? '0.9M L' : '450 meals' },
          { month: 'Apr', value: data.statId === 'foodDiverted' ? '580 kg' : data.statId === 'co2Prevented' ? '2.3 tons' : data.statId === 'waterSaved' ? '0.95M L' : '480 meals' },
          { month: 'May', value: data.statId === 'foodDiverted' ? '600 kg' : data.statId === 'co2Prevented' ? '2.4 tons' : data.statId === 'waterSaved' ? '1.0M L' : '500 meals' },
          { month: 'Jun', value: data.statId === 'foodDiverted' ? '620 kg' : data.statId === 'co2Prevented' ? '2.5 tons' : data.statId === 'waterSaved' ? '1.05M L' : '520 meals' },
        ],
        summary: t('lastYearSummary') || 'Last year showed progressive improvement with consistent monthly growth.',
      },
    };

    const details = periodData[data.period] || periodData[t('lastWeek')];

    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
            darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
          }`}
        >
          ← {t('backToReport') || 'Back to Report'}
        </button>

        <div className={`rounded-2xl p-8 border ${
          darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {data.period} - {t('detailedReport') || 'Detailed Report'}
          </h2>
          <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-yellow-300' : 'text-slate-700'}`}>
            {data.value}
          </p>
          <p className={`text-sm mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {data.change > 0 ? '↑' : '↓'} {Math.abs(data.change)}% {t('change')}
          </p>

          {details.dailyData && (
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('dailyBreakdown') || 'Daily Breakdown'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.dailyData.map((day: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{day.day}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{day.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.weeklyData && (
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('weeklyBreakdown') || 'Weekly Breakdown'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {details.weeklyData.map((week: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{week.week}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{week.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.monthlyData && (
            <div>
              <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                {t('monthlyBreakdown') || 'Monthly Breakdown'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {details.monthlyData.map((month: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{month.month}</span>
                      <span className={`font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>{month.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-emerald-900/40 border border-emerald-600/30' : 'bg-emerald-50 border border-emerald-200'}`}>
            <p className={`${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{details.summary}</p>
          </div>
        </div>
      </div>
    );
  };

  const InsightsDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        ← {t('backToReport') || 'Back to Report'}
      </button>

      <div className={`rounded-2xl p-8 border ${
        darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
          {t('keyInsights')} - {t('detailedReport') || 'Detailed Report'}
        </h2>
        <div className="space-y-4">
          {data.insights.map((insight: string, idx: number) => (
            <div key={idx} className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
              <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TrendDetailReport: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode ? 'hover:bg-yellow-900/40 text-yellow-300' : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        ← {t('backToReport') || 'Back to Report'}
      </button>

      <div className={`rounded-2xl p-8 border ${
        darkMode ? 'bg-emerald-900/40 border-emerald-600/30' : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
          {t('weeklyTrend')} - {t('detailedReport') || 'Detailed Report'}
        </h2>
        <div className="w-full h-96 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#cbd5e1'} />
              <XAxis dataKey="date" stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <YAxis stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  border: darkMode ? '2px solid #fbbf24' : '2px solid #64748b',
                  borderRadius: '8px',
                  color: darkMode ? '#fbbf24' : '#1e293b',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={stat.id === 'mealsSaved' ? '#10b981' : stat.id === 'foodDiverted' ? '#3b82f6' : stat.id === 'co2Prevented' ? '#f59e0b' : '#06b6d4'}
                strokeWidth={3}
                dot={{ fill: stat.id === 'mealsSaved' ? '#10b981' : stat.id === 'foodDiverted' ? '#3b82f6' : stat.id === 'co2Prevented' ? '#f59e0b' : '#06b6d4', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-emerald-900/30' : 'bg-slate-50'}`}>
          <p className={`${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {t('trendAnalysis') || 'This chart shows the weekly trend with detailed data points for each day.'}
          </p>
        </div>
      </div>
    </div>
  );

  // Show detailed report if one is selected
  if (detailedView.type) {
    return (
      <div className={`w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 animate-fadeIn`}>
        {detailedView.type === 'category' && <CategoryDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
        {detailedView.type === 'period' && <PeriodDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
        {detailedView.type === 'insights' && <InsightsDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
        {detailedView.type === 'trend' && <TrendDetailReport data={detailedView.data} onBack={() => setDetailedView({ type: null })} />}
      </div>
    );
  }

  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6`}>
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
          darkMode
            ? 'hover:bg-yellow-900/40 text-yellow-300'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
      >
        {t('backToDashboard')}
      </button>

      {/* Header */}
      <div className={`rounded-2xl p-8 transition-all duration-300 border ${
        darkMode
          ? 'bg-gradient-to-br from-emerald-900/50 to-blue-900/50 border-emerald-600/30 shadow-xl'
          : 'bg-white border-slate-200 shadow-lg'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{stat.icon}</span>
          <div>
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              {stat.label}
            </h2>
            <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statData.breakdown.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setDetailedView({ type: 'category', data: { ...item, statId: stat.id } })}
            className={`rounded-xl p-6 transition-all duration-300 border text-left cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
              darkMode ? 'bg-emerald-900/30 border-emerald-600/25 hover:bg-emerald-900/40' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
            }`}
          >
            <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {item.label}
            </p>
            <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              {item.value}
            </p>
            <div className={`mt-3 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-emerald-900/60' : 'bg-slate-200'}`}>
              <ProgressFill
                percentage={item.percentage}
                className={`h-full transition-all ${
                  stat.id === 'mealsSaved' ? 'bg-emerald-500' :
                  stat.id === 'foodDiverted' ? 'bg-blue-500' :
                  stat.id === 'co2Prevented' ? 'bg-yellow-500' :
                  'bg-cyan-500'
                }`}
              />
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.percentage}% {t('ofTotal')}
            </p>
            <p className={`text-xs mt-2 font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {t('clickForDetails') || 'Click for details'}
            </p>
          </button>
        ))}
      </div>

      {/* Timeline Chart */}
      <button
        type="button"
        onClick={() => setDetailedView({ type: 'trend', data: { timeline: statData.timeline, statId: stat.id } })}
        className={`rounded-2xl p-6 transition-all duration-300 border text-left w-full cursor-pointer hover:scale-[1.01] hover:shadow-lg ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25 hover:bg-emerald-900/40' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {t('weeklyTrend')}
          </h3>
          <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            {t('clickForDetails') || 'Click for details'}
          </p>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={statData.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#475569' : '#cbd5e1'} />
              <XAxis dataKey="date" stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <YAxis stroke={darkMode ? '#cbd5e1' : '#64748b'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  border: darkMode ? '2px solid #fbbf24' : '2px solid #64748b',
                  borderRadius: '8px',
                  color: darkMode ? '#fbbf24' : '#1e293b',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={
                  stat.id === 'mealsSaved' ? '#10b981' :
                  stat.id === 'foodDiverted' ? '#3b82f6' :
                  stat.id === 'co2Prevented' ? '#f59e0b' :
                  '#06b6d4'
                }
                strokeWidth={3}
                dot={{ fill: stat.id === 'mealsSaved' ? '#10b981' : stat.id === 'foodDiverted' ? '#3b82f6' : stat.id === 'co2Prevented' ? '#f59e0b' : '#06b6d4', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </button>

      {/* Insights & Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insights */}
        <button
          type="button"
          onClick={() => setDetailedView({ type: 'insights', data: { insights: statData.insights, statId: stat.id } })}
          className={`rounded-xl p-6 transition-all duration-300 border text-left cursor-pointer hover:scale-[1.02] hover:shadow-lg ${
            darkMode ? 'bg-emerald-900/30 border-emerald-600/25 hover:bg-emerald-900/40' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
              <TrendingUp className="w-5 h-5" /> {t('keyInsights')}
            </h3>
            <p className={`text-xs font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
              {t('clickForDetails') || 'Click for details'}
            </p>
          </div>
          <ul className="space-y-2">
            {statData.insights.map((insight, idx) => (
              <li key={idx} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                <span className={`mt-1 ${darkMode ? 'text-yellow-300' : 'text-emerald-600'}`}>•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </button>

        {/* Comparison */}
        <div className={`rounded-xl p-6 transition-all duration-300 border ${
          darkMode ? 'bg-emerald-900/30 border-emerald-600/25' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
            {t('periodComparison')}
          </h3>
          <div className="space-y-4">
            {statData.comparison.map((comp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDetailedView({ type: 'period', data: { ...comp, statId: stat.id } })}
                className={`w-full p-3 rounded-lg text-left cursor-pointer hover:scale-[1.02] transition-all ${
                  darkMode ? 'bg-emerald-900/30 hover:bg-emerald-900/40' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {comp.period}
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-yellow-300' : 'text-slate-900'}`}>
                    {comp.value}
                  </span>
                </div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${
                  comp.change > 0 ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : (darkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {comp.change > 0 ? '↑' : '↓'} {Math.abs(comp.change)}% {t('change')}
                </div>
                <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  {t('clickForDetails') || 'Click for details'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};