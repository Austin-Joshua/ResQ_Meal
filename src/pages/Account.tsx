import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, Building2, Users, Heart, Shield, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const roleIcons = {
  restaurant: Building2,
  ngo: Users,
  volunteer: Heart,
  admin: Shield,
};

const roleLabels = {
  restaurant: 'Restaurant Partner',
  ngo: 'NGO Partner',
  volunteer: 'Volunteer',
  admin: 'Administrator',
};

export default function Account() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const RoleIcon = roleIcons[user?.role || 'volunteer'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="text-muted-foreground">Your profile information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>Profile</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profilePhoto} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Badge variant="outline" className="flex items-center gap-1.5">
                <RoleIcon className="h-3.5 w-3.5" />
                {roleLabels[user?.role || 'volunteer']}
              </Badge>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">Member since January 2024</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.phone}</span>
                  </div>
                )}
                {user?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{user.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
          <CardDescription>Your contribution to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {user?.role === 'restaurant' && (
              <>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">48</p>
                  <p className="text-xs text-muted-foreground">Food Posts</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">42</p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">320 kg</p>
                  <p className="text-xs text-muted-foreground">Food Saved</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">800 kg</p>
                  <p className="text-xs text-muted-foreground">CO₂ Reduced</p>
                </div>
              </>
            )}
            {user?.role === 'ngo' && (
              <>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">156</p>
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">1,240</p>
                  <p className="text-xs text-muted-foreground">People Fed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">520 kg</p>
                  <p className="text-xs text-muted-foreground">Food Distributed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Partner Restaurants</p>
                </div>
              </>
            )}
            {user?.role === 'volunteer' && (
              <>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">42</p>
                  <p className="text-xs text-muted-foreground">Deliveries</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">156 km</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">280 kg</p>
                  <p className="text-xs text-muted-foreground">Food Delivered</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">98%</p>
                  <p className="text-xs text-muted-foreground">On-Time Rate</p>
                </div>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">156</p>
                  <p className="text-xs text-muted-foreground">Restaurants</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">42</p>
                  <p className="text-xs text-muted-foreground">NGOs</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">234</p>
                  <p className="text-xs text-muted-foreground">Volunteers</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">12.4K</p>
                  <p className="text-xs text-muted-foreground">Total Meals</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
