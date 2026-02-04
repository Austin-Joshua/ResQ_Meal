import { useAuth } from '@/context/AuthContext';
import RestaurantDashboard from './dashboards/RestaurantDashboard';
import NGODashboard from './dashboards/NGODashboard';
import VolunteerDashboard from './dashboards/VolunteerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'restaurant':
      return <RestaurantDashboard />;
    case 'ngo':
      return <NGODashboard />;
    case 'volunteer':
      return <VolunteerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <RestaurantDashboard />;
  }
}
