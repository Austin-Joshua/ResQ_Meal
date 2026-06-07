import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import { getSocketUrl } from '@/lib/apiConfig';
import { getAuthToken } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from 'sonner';

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connect: () => Socket | null;
  disconnect: () => void;
}

let listenersAttached = false;

function attachSocketListeners(socket: Socket) {
  if (listenersAttached) return;
  listenersAttached = true;

  const notificationStore = useNotificationStore.getState();

  socket.on('notification', (payload) => {
    notificationStore.addRealtimeNotification(payload);
  });

  socket.on('food_posted', () => {
    void notificationStore.fetchNotifications();
  });

  socket.on('match_created', () => {
    void notificationStore.fetchNotifications();
  });

  socket.on('match_status_updated', () => {
    void notificationStore.fetchNotifications();
  });

  socket.on(
    'security_threat',
    (payload: {
      label?: string;
      confidence?: number;
      path?: string;
      method?: string;
      ip?: string;
    }) => {
      const label = payload.label ?? 'unknown';
      if (label !== 'malicious' && label !== 'suspicious') return;
      const desc = `${payload.method ?? ''} ${payload.path ?? ''} (${payload.ip ?? ''}) · confidence ${
        payload.confidence != null ? (payload.confidence * 100).toFixed(0) : '?'
      }%`;
      if (label === 'malicious') {
        toast.error(`Security: ${label}`, { description: desc });
      } else {
        toast.warning(`Security: ${label}`, { description: desc });
      }
    }
  );

  socket.on('connect', () => {
    useSocketStore.setState({ connected: true });
  });

  socket.on('disconnect', () => {
    useSocketStore.setState({ connected: false });
  });
}

function detachSocketListeners(socket: Socket) {
  socket.off('notification');
  socket.off('food_posted');
  socket.off('match_created');
  socket.off('match_status_updated');
  socket.off('security_threat');
  socket.off('connect');
  socket.off('disconnect');
  listenersAttached = false;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  connect: () => {
    const token = getAuthToken();
    if (!token) return null;

    const existing = get().socket;
    if (existing?.connected) return existing;

    if (existing) {
      detachSocketListeners(existing);
      existing.disconnect();
    }

    const socket = io(getSocketUrl(), {
      auth: { token },
      query: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    attachSocketListeners(socket);
    set({ socket, connected: socket.connected });
    return socket;
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      detachSocketListeners(socket);
      socket.disconnect();
    }
    set({ socket: null, connected: false });
  },
}));

/** Backward-compatible helpers for legacy imports */
export function connectSocket(): Socket | null {
  return useSocketStore.getState().connect();
}

export function disconnectSocket(): void {
  useSocketStore.getState().disconnect();
}

export function getSocket(): Socket | null {
  return useSocketStore.getState().socket;
}

export function isSocketConnected(): boolean {
  return useSocketStore.getState().connected;
}
