import { MATCH_STATUS } from '@/constants';

export type MatchTab = 'all' | 'pending' | 'accepted' | 'in_delivery' | 'completed';

export const MATCH_TAB_STATUSES: Record<MatchTab, string[]> = {
  all: [],
  pending: [MATCH_STATUS.MATCHED],
  accepted: [MATCH_STATUS.ACCEPTED],
  in_delivery: [MATCH_STATUS.PICKED_UP, 'IN_TRANSIT'],
  completed: [MATCH_STATUS.DELIVERED],
};

export type MatchItem = {
  id: number;
  foodName: string;
  ngo: string;
  org: string;
  address?: string;
  distance: string;
  status: string;
  meals: number;
  donation: string;
  minTemp?: number;
  maxTemp?: number;
  availabilityHours?: number;
};

export const INITIAL_MATCHES: MatchItem[] = [
  {
    id: 1,
    foodName: 'Fresh Grilled Vegetables',
    ngo: 'Save Children NGO',
    org: 'Registered NGO - License #NGO2024001',
    address: 'Save Children NGO, Downtown, Chennai',
    distance: '1.2 km',
    status: MATCH_STATUS.MATCHED,
    meals: 25,
    donation: '₹5,000 equivalent',
    minTemp: 0,
    maxTemp: 4,
    availabilityHours: 6,
  },
  {
    id: 2,
    foodName: 'Bread & Pastries',
    ngo: 'Hope Foundation',
    org: 'Registered NGO - License #NGO2024002',
    address: 'Hope Foundation, Anna Nagar, Chennai',
    distance: '2.5 km',
    status: MATCH_STATUS.ACCEPTED,
    meals: 40,
    donation: '₹8,000 equivalent',
    minTemp: 18,
    maxTemp: 22,
    availabilityHours: 12,
  },
  {
    id: 3,
    foodName: 'Rice & Curry',
    ngo: 'Feed the Needy',
    org: 'Registered NGO - License #NGO2024003',
    address: 'Feed the Needy, T Nagar, Chennai',
    distance: '0.8 km',
    status: MATCH_STATUS.PICKED_UP,
    meals: 60,
    donation: '₹12,000 equivalent',
    minTemp: 60,
    maxTemp: 65,
    availabilityHours: 4,
  },
];
