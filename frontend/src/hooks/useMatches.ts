import { useQuery } from '@tanstack/react-query';
import { matchApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export interface MatchRecord {
  id: number;
  food_post_id?: number;
  ngo_id?: number;
  status?: string;
  [key: string]: unknown;
}

function normalizeMatches(data: unknown): MatchRecord[] {
  const list = (data as { data?: unknown })?.data ?? data;
  return Array.isArray(list) ? (list as MatchRecord[]) : [];
}

export function useMatches() {
  const role = useAuthStore((s) => s.user?.role?.toLowerCase());

  return useQuery({
    queryKey: ['matches', role],
    enabled: Boolean(role),
    queryFn: async () => {
      if (role === 'restaurant') {
        const res = await matchApi.getRestaurantMatches();
        return normalizeMatches(res.data);
      }
      const res = await matchApi.getNGOMatches();
      return normalizeMatches(res.data);
    },
  });
}
