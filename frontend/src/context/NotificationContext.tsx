import React, { createContext, useContext, useCallback, useEffect } from 'react';
import type { NotificationItem } from '@/services/api';
import { useNotificationStore } from '@/store/notificationStore';
import { useSocketStore } from '@/store/socketStore';
import { useAuthStore } from '@/store/authStore';

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode; hasAuth?: boolean }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const loading = useNotificationStore((s) => s.loading);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const reset = useNotificationStore((s) => s.reset);
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      reset();
      return;
    }
    await fetchNotifications();
  }, [isAuthenticated, fetchNotifications, reset]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
      void refresh();
    } else {
      disconnect();
      reset();
    }
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect, refresh, reset]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
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
