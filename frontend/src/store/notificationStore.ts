import { create } from 'zustand';
import type { NotificationItem } from '@/services/api';
import { notificationApi } from '@/services/api';

interface NotificationPayload {
  type: string;
  title: string;
  message?: string;
  link?: string;
  ref_id?: number;
  created_at?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  addRealtimeNotification: (payload: NotificationPayload) => void;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const { data } = await notificationApi.getList({ limit: 50 });
      set({ notifications: data.data, unreadCount: data.unreadCount, loading: false });
    } catch {
      set({ notifications: [], unreadCount: 0, loading: false });
    }
  },
  addRealtimeNotification: (payload) => {
    const newItem: NotificationItem = {
      id: Math.floor(Math.random() * 1e9),
      type: payload.type,
      title: payload.title,
      message: payload.message ?? null,
      link: payload.link ?? null,
      ref_id: payload.ref_id ?? null,
      read_at: null,
      created_at: payload.created_at ?? new Date().toISOString(),
    };
    set((state) => ({
      notifications: [newItem, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markRead: async (id) => {
    try {
      await notificationApi.markRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      /* ignore */
    }
  },
  markAllRead: async () => {
    try {
      await notificationApi.markAllRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at ?? new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch {
      /* ignore */
    }
  },
  reset: () => set({ notifications: [], unreadCount: 0, loading: false }),
}));
