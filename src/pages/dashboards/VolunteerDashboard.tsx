import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatCard } from '@/components/StatCard';
import { StatusBadge, FoodStatus } from '@/components/StatusBadge';
import { Truck, CheckCircle, Clock, Camera, MapPin, Building2, Users, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Mock delivery data
const mockDeliveries = [
  {
    id: '1',
    foodName: 'Mixed Vegetables',
    quantity: '15 kg',
    restaurant: 'Green Kitchen',
    restaurantAddress: '123 Food St',
    ngo: 'Food For All',
    ngoAddress: '456 Charity Ave',
    status: 'ACCEPTED' as FoodStatus,
    pickupBy: new Date(Date.now() + 1 * 60 * 60 * 1000),
  },
  {
    id: '2',
    foodName: 'Fresh Bread',
    quantity: '30 loaves',
    restaurant: 'Sunrise Bakery',
    restaurantAddress: '789 Baker Lane',
    ngo: 'Community Kitchen',
    ngoAddress: '321 Helper St',
    status: 'PICKED_UP' as FoodStatus,
    pickupBy: new Date(Date.now() - 30 * 60 * 1000),
  },
];

const completedDeliveries = [
  {
    id: '3',
    foodName: 'Fruit Baskets',
    quantity: '10 kg',
    restaurant: 'Fresh Mart',
    ngo: 'Shelter Home',
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'DELIVERED' as FoodStatus,
  },
];

function formatTimeRemaining(time: Date): string {
  const now = new Date();
  const diff = time.getTime() - now.getTime();
  
  if (diff <= 0) return 'Overdue';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [completed, setCompleted] = useState(completedDeliveries);
  const [selectedDelivery, setSelectedDelivery] = useState<typeof mockDeliveries[0] | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickup = (deliveryId: string) => {
    setDeliveries(deliveries.map(d => 
      d.id === deliveryId ? { ...d, status: 'PICKED_UP' as FoodStatus } : d
    ));
  };

  const handleCompleteClick = (delivery: typeof mockDeliveries[0]) => {
    setSelectedDelivery(delivery);
    setProofPhoto(null);
    setIsDialogOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = () => {
    if (selectedDelivery && proofPhoto) {
      setDeliveries(deliveries.filter(d => d.id !== selectedDelivery.id));
      setCompleted([
        {
          id: selectedDelivery.id,
          foodName: selectedDelivery.foodName,
          quantity: selectedDelivery.quantity,
          restaurant: selectedDelivery.restaurant,
          ngo: selectedDelivery.ngo,
          completedAt: new Date(),
          status: 'DELIVERED' as FoodStatus,
        },
        ...completed,
      ]);
      setIsDialogOpen(false);
      setSelectedDelivery(null);
      setProofPhoto(null);
    }
  };

  const activeDeliveries = deliveries.filter(d => d.status === 'ACCEPTED');
  const inTransit = deliveries.filter(d => d.status === 'PICKED_UP');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Your delivery assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Pickup"
          value={activeDeliveries.length}
          icon={Clock}
          variant="accent"
        />
        <StatCard
          title="In Transit"
          value={inTransit.length}
          icon={Truck}
          variant="secondary"
        />
        <StatCard
          title="Delivered Today"
          value={completed.length}
          icon={CheckCircle}
          variant="primary"
        />
        <StatCard
          title="Total Deliveries"
          value={42}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Active Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
          <CardDescription>Pick up food and deliver to NGOs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No active deliveries</h3>
                <p className="text-muted-foreground">Check back soon for new delivery assignments.</p>
              </div>
            ) : (
              deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-5 rounded-xl border border-border bg-background hover:shadow-card transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground text-lg">{delivery.foodName}</h3>
                        <StatusBadge status={delivery.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{delivery.quantity}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pickup From</p>
                          <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{delivery.restaurant}</p>
                              <p className="text-xs text-muted-foreground">{delivery.restaurantAddress}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deliver To</p>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{delivery.ngo}</p>
                              <p className="text-xs text-muted-foreground">{delivery.ngoAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {delivery.status === 'ACCEPTED' && (
                        <>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">
                              {formatTimeRemaining(delivery.pickupBy)}
                            </p>
                            <p className="text-xs text-muted-foreground">to pickup</p>
                          </div>
                          <Button onClick={() => handlePickup(delivery.id)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Mark Picked Up
                          </Button>
                        </>
                      )}
                      {delivery.status === 'PICKED_UP' && (
                        <Button onClick={() => handleCompleteClick(delivery)}>
                          <Camera className="mr-2 h-4 w-4" />
                          Complete Delivery
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
          <CardDescription>Your delivery history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {completed.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border bg-muted/20"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-foreground">{item.foodName}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} • {item.restaurant} → {item.ngo}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Proof Photo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Complete Delivery</DialogTitle>
            <DialogDescription>
              Upload a photo as proof of delivery for {selectedDelivery?.foodName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            
            {proofPhoto ? (
              <div className="relative">
                <img
                  src={proofPhoto}
                  alt="Delivery proof"
                  className="w-full h-48 object-cover rounded-lg border border-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Retake
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-lg border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click to upload or take a photo
                </p>
              </button>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDelivery} disabled={!proofPhoto}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Delivery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
