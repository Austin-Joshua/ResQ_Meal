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
 * - Dev default: same origin as the page → Vite proxies `/socket.io` to Spring Boot (8080).
 * - Prod default: same origin (Socket.IO served alongside API on 8080).
 * - Override anytime with VITE_SOCKET_URL (full origin, e.g. `https://ws.example.com`).
 */
export function getSocketUrl(): string {
  const explicit = (import.meta.env.VITE_SOCKET_URL as string | undefined)?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:8080';
}
