import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Truck, TrendingUp, Building2, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Restaurants"
          value={156}
          icon={Building2}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active NGOs"
          value={42}
          icon={Users}
          variant="secondary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Volunteers"
          value={234}
          icon={Heart}
          variant="accent"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Deliveries Today"
          value={89}
          icon={Truck}
          variant="default"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Total Meals Saved</span>
                <span className="font-semibold text-foreground">124,892</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Food Saved (kg)</span>
                <span className="font-semibold text-foreground">87,420</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">CO₂ Reduced (kg)</span>
                <span className="font-semibold text-foreground">218,550</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Active Donations</span>
                <span className="font-semibold text-foreground">45</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New restaurant registered', entity: 'Fresh Bites Cafe', time: '5 min ago' },
                { action: 'Delivery completed', entity: 'Order #1234', time: '12 min ago' },
                { action: 'NGO accepted donation', entity: 'Food For All', time: '25 min ago' },
                { action: 'New volunteer joined', entity: 'Sarah Williams', time: '1 hour ago' },
              ].map((activity, index) => (
                <div key={index} className="flex justify-between items-start p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.entity}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
