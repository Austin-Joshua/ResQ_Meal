import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { notificationApi, type NotificationItem } from '@/services/api';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

interface NotificationPayload {
  type: string;
  title: string;
  message?: string;
  link?: string;
  ref_id?: number;
  created_at?: string;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = 'resqmeal_notifications_unread';

export function NotificationProvider({ children, hasAuth }: { children: React.ReactNode; hasAuth: boolean }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!hasAuth) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await notificationApi.getList({ limit: 50 });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [hasAuth]);

  const markRead = useCallback(async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
      setUnreadCount(0);
    } catch {}
  }, []);

  useEffect(() => {
    if (hasAuth) {
      connectSocket();
      refresh();
    } else {
      disconnectSocket();
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
    return () => {
      if (!hasAuth) disconnectSocket();
    };
  }, [hasAuth, refresh]);

  useEffect(() => {
    if (!hasAuth) return;
    const socket = getSocket();
    if (!socket) return;
    const onNotification = (payload: NotificationPayload) => {
      const newItem: NotificationItem = {
        id: Math.random() * 1e9,
        type: payload.type,
        title: payload.title,
        message: payload.message ?? null,
        link: payload.link ?? null,
        ref_id: payload.ref_id ?? null,
        read_at: null,
        created_at: payload.created_at ?? new Date().toISOString(),
      };
      setNotifications((prev) => [newItem, ...prev]);
      setUnreadCount((c) => c + 1);
    };
    socket.on('notification', onNotification);
    socket.on('food_posted', () => {
      refresh();
    });
    socket.on('match_created', () => {
      refresh();
    });
    socket.on('match_status_updated', () => {
      refresh();
    });
    return () => {
      socket.off('notification', onNotification);
      socket.off('food_posted');
      socket.off('match_created');
      socket.off('match_status_updated');
    };
  }, [hasAuth, refresh]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      markRead: async () => {},
      markAllRead: async () => {},
      refresh: async () => {},
    };
  }
  return ctx;
}
