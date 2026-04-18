/**
 * Central place for how the browser reaches the Spring Boot API and Socket.IO server.
 *
 * Dev (Vite): use relative `/api` and same-origin Socket.IO so `vite.config.ts` proxies work.
 * Prod: set VITE_API_URL / VITE_SOCKET_URL when the UI is not served from the same host as the API.
 */

/** Axios baseURL: `/api` or e.g. `https://api.example.com/api` */
export function getApiBasePath(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  return (raw || '/api').replace(/\/$/, '');
}

/** GET URL for Spring `/api/health` (no trailing slash issues). */
export function getHealthCheckUrl(): string {
  return `${getApiBasePath()}/health`;
}

/**
 * Socket.IO engine URL (no path; client still uses `path: '/socket.io'`).
 * - Dev default: same origin as the page → Vite proxies `/socket.io` to port 9090.
 * - Prod default: same hostname, port 9090 (Spring netty-socketio).
 * - Override anytime with VITE_SOCKET_URL (full origin, e.g. `https://ws.example.com`).
 */
export function getSocketUrl(): string {
  const explicit = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:9090`;
  }
  return 'http://localhost:9090';
}
