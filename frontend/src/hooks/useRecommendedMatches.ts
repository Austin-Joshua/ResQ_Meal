import { useQuery } from '@tanstack/react-query';
import { matchApi } from '@/services/api';

export function useRecommendedMatches(foodPostId: number | null | undefined, top = 5) {
  return useQuery({
    queryKey: ['recommendedMatches', foodPostId, top],
    enabled: foodPostId != null && foodPostId > 0,
    queryFn: async () => {
      const res = await matchApi.getRecommended(foodPostId!, top);
      const list = (res.data as { data?: unknown })?.data ?? res.data;
      return Array.isArray(list) ? list : [];
    },
  });
}
