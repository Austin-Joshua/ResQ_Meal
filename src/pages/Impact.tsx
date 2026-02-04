import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UtensilsCrossed, TrendingUp, Leaf, Users, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock impact data
const weeklyData = [
  { day: 'Mon', meals: 120, food: 85 },
  { day: 'Tue', meals: 145, food: 102 },
  { day: 'Wed', meals: 98, food: 68 },
  { day: 'Thu', meals: 167, food: 118 },
  { day: 'Fri', meals: 189, food: 134 },
  { day: 'Sat', meals: 234, food: 165 },
  { day: 'Sun', meals: 156, food: 110 },
];

const categoryData = [
  { name: 'Vegetables', value: 35 },
  { name: 'Prepared Food', value: 28 },
  { name: 'Bakery', value: 20 },
  { name: 'Fruits', value: 12 },
  { name: 'Other', value: 5 },
];

const COLORS = ['hsl(145, 63%, 49%)', 'hsl(217, 82%, 50%)', 'hsl(37, 89%, 51%)', 'hsl(6, 74%, 57%)', 'hsl(210, 12%, 45%)'];

export default function Impact() {
  const { user } = useAuth();

  const stats = {
    mealsSaved: 1109,
    foodSavedKg: 782,
    co2Reduced: 1955,
    peopleHelped: 892,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Your Impact</h1>
        <p className="text-muted-foreground">Track the difference you're making</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Meals Saved"
          value={stats.mealsSaved.toLocaleString()}
          icon={UtensilsCrossed}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Food Saved"
          value={`${stats.foodSavedKg.toLocaleString()} kg`}
          icon={TrendingUp}
          variant="accent"
          trend={{ value: 8, isPositive: true }}
        />
        <div className="relative">
          <StatCard
            title="CO₂ Reduced"
            value={`${stats.co2Reduced.toLocaleString()} kg`}
            icon={Leaf}
            variant="secondary"
            trend={{ value: 15, isPositive: true }}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                CO₂ calculation: ~2.5kg of CO₂ is saved per kg of food rescued from landfill,
                accounting for avoided methane emissions and saved production resources.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <StatCard
          title="People Helped"
          value={stats.peopleHelped.toLocaleString()}
          icon={Users}
          variant="default"
          trend={{ value: 10, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Meals and food saved this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Line
                    type="monotone"
                    dataKey="meals"
                    stroke="hsl(145, 63%, 49%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(145, 63%, 49%)', strokeWidth: 2 }}
                    name="Meals"
                  />
                  <Line
                    type="monotone"
                    dataKey="food"
                    stroke="hsl(217, 82%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(217, 82%, 50%)', strokeWidth: 2 }}
                    name="Food (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Meals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-sm text-muted-foreground">Food (kg)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Food Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Food Categories</CardTitle>
            <CardDescription>Distribution of rescued food types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>Your contribution over the past 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: 'Sep', meals: 890, food: 620 },
                  { month: 'Oct', meals: 1020, food: 710 },
                  { month: 'Nov', meals: 950, food: 665 },
                  { month: 'Dec', meals: 1150, food: 805 },
                  { month: 'Jan', meals: 1080, food: 756 },
                  { month: 'Feb', meals: 1109, food: 782 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Bar dataKey="meals" fill="hsl(145, 63%, 49%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="food" fill="hsl(217, 82%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Meals Saved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-sm text-muted-foreground">Food Saved (kg)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
