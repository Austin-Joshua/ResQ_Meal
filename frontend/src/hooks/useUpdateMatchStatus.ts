import { useMutation, useQueryClient } from '@tanstack/react-query';
import { matchApi } from '@/services/api';

export type MatchStatus = 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED';

export interface UpdateMatchStatusInput {
  matchId: string;
  status: MatchStatus;
  volunteer_id?: number;
  delivery_proof_photo?: string;
}

export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchId, status, volunteer_id, delivery_proof_photo }: UpdateMatchStatusInput) =>
      matchApi.updateMatchStatus(matchId, status, volunteer_id, delivery_proof_photo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({ queryKey: ['foodPosts'] });
    },
  });
}
