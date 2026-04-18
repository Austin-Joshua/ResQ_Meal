/**
 * Socket.io client for real-time updates. Connect with JWT when user is logged in.
 */
import { getSocketUrl } from '@/lib/apiConfig';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getToken(): string | null {
  return localStorage.getItem('resqmeal_token') || sessionStorage.getItem('resqmeal_token') || null;
}

export function connectSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;
  if (socket?.connected) return socket;
  socket = io(getSocketUrl(), {
    auth: { token },
    query: { token },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket ?? null;
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}
