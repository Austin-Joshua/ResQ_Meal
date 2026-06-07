import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function useNotificationsQuery(options?: { unreadOnly?: boolean; limit?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: ['notifications', options?.unreadOnly, options?.limit],
    enabled: isAuthenticated,
    queryFn: async () => {
      const { data } = await notificationApi.getList({
        unread_only: options?.unreadOnly,
        limit: options?.limit ?? 50,
      });
      return data;
    },
  });
}
