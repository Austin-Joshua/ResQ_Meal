import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foodApi } from '@/services/api';

export interface CreateFoodPostInput {
  food_name: string;
  food_type?: string;
  quantity_servings?: number;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  freshness_score?: number | null;
  quality_score?: number | null;
  safety_window_minutes?: number;
  min_storage_temp_celsius?: number | null;
  max_storage_temp_celsius?: number | null;
  availability_time_hours?: number | null;
}

export function useCreateFoodPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFoodPostInput) =>
      foodApi.postFood(data as unknown as Record<string, unknown>),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['foodPosts'] });
    },
  });
}
