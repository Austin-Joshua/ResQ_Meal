import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/StatCard';
import { StatusBadge, FoodStatus } from '@/components/StatusBadge';
import { UrgencyScore } from '@/components/UrgencyScore';
import { Package, CheckCircle, Clock, Users, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock matched food data
const mockMatches = [
  {
    id: '1',
    foodName: 'Mixed Vegetables',
    quantity: '15 kg',
    restaurant: 'Green Kitchen',
    restaurantAddress: '123 Food St',
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    urgencyScore: 75,
    status: 'MATCHED' as FoodStatus,
  },
  {
    id: '2',
    foodName: 'Fresh Bread',
    quantity: '30 loaves',
    restaurant: 'Sunrise Bakery',
    restaurantAddress: '456 Baker Ave',
    expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
    urgencyScore: 55,
    status: 'MATCHED' as FoodStatus,
  },
  {
    id: '3',
    foodName: 'Cooked Meals',
    quantity: '20 portions',
    restaurant: 'Family Diner',
    restaurantAddress: '789 Main St',
    expiryTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
    urgencyScore: 92,
    status: 'MATCHED' as FoodStatus,
  },
];

const mockAccepted = [
  {
    id: '4',
    foodName: 'Fruit Baskets',
    quantity: '10 kg',
    restaurant: 'Fresh Mart',
    status: 'ACCEPTED' as FoodStatus,
    volunteerName: 'Alex Johnson',
  },
  {
    id: '5',
    foodName: 'Pasta Dishes',
    quantity: '15 portions',
    restaurant: 'Italian Corner',
    status: 'PICKED_UP' as FoodStatus,
    volunteerName: 'Sarah Williams',
  },
];

function formatTimeRemaining(expiryTime: Date): string {
  const now = new Date();
  const diff = expiryTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function NGODashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState(mockMatches);
  const [accepted, setAccepted] = useState(mockAccepted);

  const remainingCapacity = 50; // kg

  const handleAccept = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setMatches(matches.filter(m => m.id !== matchId));
      setAccepted([...accepted, { ...match, status: 'ACCEPTED' as FoodStatus, volunteerName: 'Pending assignment' }]);
    }
  };

  const handleReject = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">View and accept food donations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Matches"
          value={matches.length}
          icon={Package}
          variant="secondary"
        />
        <StatCard
          title="Accepted Today"
          value={accepted.length}
          icon={CheckCircle}
          variant="primary"
        />
        <StatCard
          title="In Transit"
          value={accepted.filter(a => a.status === 'PICKED_UP').length}
          icon={Clock}
          variant="accent"
        />
        <StatCard
          title="Remaining Capacity"
          value={`${remainingCapacity} kg`}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Available Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Available Food Matches</CardTitle>
          <CardDescription>Food donations matched to your location and capacity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No matches available</h3>
                <p className="text-muted-foreground">Check back soon for new food donations in your area.</p>
              </div>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-background hover:shadow-card transition-shadow"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground text-lg">{match.foodName}</h3>
                      <UrgencyScore score={match.urgencyScore} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">{match.quantity}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {match.restaurant}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {match.restaurantAddress}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatTimeRemaining(match.expiryTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">until expiry</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReject(match.id)}>
                        Decline
                      </Button>
                      <Button size="sm" onClick={() => handleAccept(match.id)}>
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accepted Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Accepted Donations</CardTitle>
          <CardDescription>Track the status of your accepted food donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {accepted.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No accepted donations yet.</p>
            ) : (
              accepted.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-muted/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{item.foodName}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} from {item.restaurant}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Volunteer: <span className="text-foreground font-medium">{item.volunteerName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
