import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatCard } from '@/components/StatCard';
import { StatusBadge, FoodStatus } from '@/components/StatusBadge';
import { UrgencyScore } from '@/components/UrgencyScore';
import { Plus, Package, Clock, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock data
const mockFoodPosts = [
  {
    id: '1',
    name: 'Mixed Vegetables',
    quantity: '15 kg',
    category: 'vegetables',
    expiryTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    status: 'POSTED' as FoodStatus,
    urgencyScore: 75,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '2',
    name: 'Bread & Pastries',
    quantity: '25 pieces',
    category: 'bakery',
    expiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    status: 'MATCHED' as FoodStatus,
    urgencyScore: 45,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'Cooked Rice',
    quantity: '10 kg',
    category: 'prepared',
    expiryTime: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    status: 'ACCEPTED' as FoodStatus,
    urgencyScore: 90,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '4',
    name: 'Fresh Fruits',
    quantity: '8 kg',
    category: 'fruits',
    expiryTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
    status: 'DELIVERED' as FoodStatus,
    urgencyScore: 25,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
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

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [foodPosts, setFoodPosts] = useState(mockFoodPosts);
  const [newFood, setNewFood] = useState({
    name: '',
    quantity: '',
    category: '',
    expiryHours: '',
    notes: '',
  });

  const stats = {
    totalPosted: foodPosts.length,
    pending: foodPosts.filter(f => f.status === 'POSTED' || f.status === 'MATCHED').length,
    delivered: foodPosts.filter(f => f.status === 'DELIVERED').length,
    urgent: foodPosts.filter(f => f.urgencyScore > 70).length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPost = {
      id: Date.now().toString(),
      name: newFood.name,
      quantity: newFood.quantity,
      category: newFood.category,
      expiryTime: new Date(Date.now() + parseInt(newFood.expiryHours) * 60 * 60 * 1000),
      status: 'POSTED' as FoodStatus,
      urgencyScore: Math.min(100, Math.round(100 / parseInt(newFood.expiryHours) * 2)),
      createdAt: new Date(),
    };
    setFoodPosts([newPost, ...foodPosts]);
    setNewFood({ name: '', quantity: '', category: '', expiryHours: '', notes: '' });
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setFoodPosts(foodPosts.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Manage your surplus food donations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post Surplus Food
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Post Surplus Food</DialogTitle>
              <DialogDescription>
                Fill in the details about your surplus food. We'll match it with nearby NGOs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="foodName">Food Item Name</Label>
                <Input
                  id="foodName"
                  placeholder="e.g., Mixed Vegetables"
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 10 kg"
                    value={newFood.quantity}
                    onChange={(e) => setNewFood({ ...newFood, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newFood.category} onValueChange={(v) => setNewFood({ ...newFood, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="prepared">Prepared Food</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Time Until Expiry (hours)</Label>
                <Input
                  id="expiry"
                  type="number"
                  min="1"
                  max="48"
                  placeholder="e.g., 6"
                  value={newFood.expiryHours}
                  onChange={(e) => setNewFood({ ...newFood, expiryHours: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special handling instructions..."
                  value={newFood.notes}
                  onChange={(e) => setNewFood({ ...newFood, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Post Food</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posted"
          value={stats.totalPosted}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Pending Pickup"
          value={stats.pending}
          icon={Clock}
          variant="accent"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={CheckCircle}
          variant="primary"
        />
        <StatCard
          title="Urgent Items"
          value={stats.urgent}
          icon={AlertTriangle}
          variant="default"
        />
      </div>

      {/* Food List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Food Posts</CardTitle>
          <CardDescription>Track the status of your surplus food donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {foodPosts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No food posted yet</h3>
                <p className="text-muted-foreground mb-4">Start by posting your surplus food to help reduce waste.</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Surplus Food
                </Button>
              </div>
            ) : (
              foodPosts.map((food) => (
                <div
                  key={food.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-foreground">{food.name}</h3>
                      <StatusBadge status={food.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {food.quantity} • {food.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatTimeRemaining(food.expiryTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">until expiry</p>
                    </div>
                    <UrgencyScore score={food.urgencyScore} showLabel={false} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(food.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
