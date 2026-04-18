/**
 * Socket.io client for real-time updates. Connect with JWT when user is logged in.
 */
import { io, Socket } from 'socket.io-client';

/** Spring Boot Socket.IO server (see server application.properties socketio.port, default 9090). */
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:9090` : 'http://localhost:9090');

let socket: Socket | null = null;

function getToken(): string | null {
  return localStorage.getItem('resqmeal_token') || sessionStorage.getItem('resqmeal_token') || null;
}

export function connectSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    query: { token },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });
  socket.on('connect', () => {
    console.log('[Socket] Connected');
  });
  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected', reason);
  });
  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connect error', err.message);
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
