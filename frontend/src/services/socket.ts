/**
 * Socket.io client — delegates to socketStore for consolidated connect/disconnect lifecycle.
 */
export {
  connectSocket,
  disconnectSocket,
  getSocket,
  isSocketConnected,
  useSocketStore,
} from '@/store/socketStore';
