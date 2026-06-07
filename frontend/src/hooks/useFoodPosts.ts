import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { foodApi } from '@/services/api';
import type { AvailableFoodItem } from '@/components/AvailableFoodCarousel';

const PAGE_SIZE = 20;

export interface FoodPostsParams {
  food_type?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  min_urgency?: number;
  max_urgency?: number;
}

function normalizeFoodList(data: unknown): AvailableFoodItem[] {
  const list = (data as { data?: unknown })?.data ?? data;
  return Array.isArray(list) ? (list as AvailableFoodItem[]) : [];
}

export function useFoodPosts(params?: FoodPostsParams) {
  return useQuery({
    queryKey: ['foodPosts', params],
    queryFn: async () => {
      const res = await foodApi.getAvailableFood({
        limit: PAGE_SIZE,
        ...(params?.food_type ? { food_type: params.food_type } : {}),
        ...(params?.latitude != null ? { latitude: params.latitude } : {}),
        ...(params?.longitude != null ? { longitude: params.longitude } : {}),
        ...(params?.radius_km != null ? { radius_km: params.radius_km } : {}),
        ...(params?.min_urgency != null ? { min_urgency: params.min_urgency } : {}),
        ...(params?.max_urgency != null ? { max_urgency: params.max_urgency } : {}),
      });
      return normalizeFoodList(res.data);
    },
  });
}

export function useInfiniteFoodPosts(params?: Omit<FoodPostsParams, 'limit'>) {
  return useInfiniteQuery({
    queryKey: ['foodPosts', 'infinite', params],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const limit = PAGE_SIZE * (page + 1);
      const res = await foodApi.getAvailableFood({
        limit,
        ...(params?.food_type ? { food_type: params.food_type } : {}),
        ...(params?.latitude != null ? { latitude: params.latitude } : {}),
        ...(params?.longitude != null ? { longitude: params.longitude } : {}),
        ...(params?.radius_km != null ? { radius_km: params.radius_km } : {}),
      });
      const all = normalizeFoodList(res.data);
      const start = page * PAGE_SIZE;
      return all.slice(start, start + PAGE_SIZE);
    },
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length < PAGE_SIZE ? undefined : (lastPageParam as number) + 1,
  });
}
