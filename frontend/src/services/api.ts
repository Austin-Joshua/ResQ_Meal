/**
 * Typed API facade — all HTTP goes through @/api/client (single fetch wrapper).
 * Returns axios-compatible `{ data }` envelopes for backward compatibility.
 */
import { del, get, patch, post, put, upload, ApiError } from '@/api/client';
import { endpoints } from '@/api/endpoints';

type AxiosLikeError = Error & { response?: { status: number; data: unknown } };

function toAxiosError(err: unknown): AxiosLikeError {
  if (err instanceof ApiError) {
    const axErr = new Error(err.message) as AxiosLikeError;
    axErr.response = { status: err.status, data: err.body };
    return axErr;
  }
  return err as AxiosLikeError;
}

export type ApiDataEnvelope<T = unknown> = { data?: T; success?: boolean; message?: string };

async function wrap<T>(promise: Promise<T>): Promise<{ data: T }> {
  try {
    return { data: await promise };
  } catch (err) {
    throw toAxiosError(err);
  }
}

function queryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    wrap(
      post<{ id: number; name: string; email: string; role: string; token: string }>(
        endpoints.auth.login,
        { email, password }
      )
    ),
  loginWithGoogle: (idToken: string, role?: 'restaurant' | 'ngo' | 'volunteer') =>
    wrap(
      post<{ id: number; name: string; email: string; role: string; token: string }>(
        endpoints.auth.google,
        { idToken, role: role ?? 'volunteer' }
      )
    ),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'restaurant' | 'ngo' | 'volunteer';
    phone_number?: string;
    address?: string;
  }) =>
    wrap(
      post<{ id: number; name: string; email: string; role: string; token: string }>(
        endpoints.auth.register,
        data
      )
    ),
  logout: () => wrap(post(endpoints.auth.logout)),
};

// Food APIs
export const foodApi = {
  postFood: (data: Record<string, unknown>) =>
    wrap(post<ApiDataEnvelope<{ id?: number }>>(endpoints.food, data)),
  getMyPosts: () => wrap(get<ApiDataEnvelope<unknown[]>>(`${endpoints.food}/my-posts`)),
  getAvailableFood: (params?: Record<string, string | number>) =>
    wrap(get<ApiDataEnvelope<unknown[]>>(`${endpoints.food}/available/all${queryString(params)}`)),
  updateFood: (id: string, data: Record<string, unknown>) => wrap(put(`${endpoints.food}/${id}`, data)),
  deleteFood: (id: string) => wrap(del(`${endpoints.food}/${id}`)),
  assessFreshness: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return wrap(upload(`${endpoints.food}/assess-freshness`, formData));
  },
  assessFreshnessByEnvironment: (data: {
    temperature: number;
    humidity: number;
    time_stored_hours: number;
    gas?: number;
  }) => wrap(post(`${endpoints.food}/assess-freshness-by-environment`, data)),
  classifyImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return wrap(upload(`${endpoints.food}/classify-image`, formData));
  },
};

// Match APIs
export const matchApi = {
  getNGOMatches: () => wrap(get(`${endpoints.matches}/for-ngo/all`)),
  getRestaurantMatches: () => wrap(get(`${endpoints.matches}/for-restaurant/all`)),
  getRecommended: (foodPostId: number, top?: number) =>
    wrap(get(`${endpoints.matches}/recommended/${foodPostId}${queryString({ top })}`)),
  getMatch: (id: string) => wrap(get(`${endpoints.matches}/${id}`)),
  createMatch: (foodPostId: number) =>
    wrap(post(endpoints.matches, { food_post_id: foodPostId })),
  acceptMatch: (matchId: string) =>
    wrap(put(`${endpoints.matches}/${matchId}/status`, { status: 'ACCEPTED' })),
  rejectMatch: (_matchId: string) => Promise.resolve({ data: {} }),
  updateMatchStatus: (
    matchId: string,
    status: 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED',
    volunteer_id?: number,
    delivery_proof_photo?: string
  ) =>
    wrap(
      put(`${endpoints.matches}/${matchId}/status`, {
        status,
        volunteer_id,
        delivery_proof_photo,
      })
    ),
  assignVolunteer: (matchId: string, volunteerId: number) =>
    wrap(put(`${endpoints.matches}/${matchId}/assign-volunteer`, { volunteer_id: volunteerId })),
  completeMatch: (matchId: string, photo: File, volunteerId?: number) => {
    const formData = new FormData();
    formData.append('photo', photo);
    if (volunteerId != null) formData.append('volunteer_id', String(volunteerId));
    return wrap(upload(`${endpoints.matches}/${matchId}/complete`, formData));
  },
};

// Organisation food
export const organisationApi = {
  postFood: (data: {
    food_name: string;
    food_type?: string;
    quantity_servings?: number;
    description?: string;
    address: string;
    latitude?: number;
    longitude?: number;
    freshness_score?: number | null;
    quality_score?: number | null;
  }) => wrap(post('/organisation/food', data)),
  getMyFood: () => wrap(get<ApiDataEnvelope<unknown[]>>('/organisation/food')),
  getAvailableFood: () => wrap(get<ApiDataEnvelope<unknown[]>>('/organisation/food/available')),
};

// Delivery APIs
export const deliveryApi = {
  getVolunteerDeliveries: () => wrap(get<ApiDataEnvelope<unknown[]>>('/delivery/volunteer')),
  completeDelivery: (deliveryId: string, proofPhoto: string) =>
    wrap(post('/delivery/complete', { deliveryId, proofPhoto })),
  updateDeliveryStatus: (deliveryId: string, status: string) =>
    wrap(put(`/delivery/${deliveryId}/status`, { status })),
};

// Impact APIs
export const impactApi = {
  getImpact: () =>
    wrap(get('/impact/ngo').catch(() => get('/impact/restaurant'))),
  getNGOImpact: () => wrap(get('/impact/ngo')),
  getRestaurantImpact: () => wrap(get('/impact/restaurant')),
  getGlobalImpact: () => wrap(get('/impact/global')),
  getPublicStats: () => wrap(get('/impact/global')),
};

// Notification APIs
export const notificationApi = {
  getList: (params?: { unread_only?: boolean; limit?: number }) =>
    wrap(
      get<{ data: NotificationItem[]; unreadCount: number }>(
        `${endpoints.notifications}${queryString(params)}`
      )
    ),
  markRead: (id: number) => wrap(patch(`${endpoints.notifications}/${id}/read`)),
  markAllRead: () => wrap(post(`${endpoints.notifications}/read-all`)),
};

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  ref_id: number | null;
  read_at: string | null;
  created_at: string;
}

// User APIs
export const userApi = {
  getMe: () => wrap(get('/users/me')),
  updateMe: (data: Record<string, unknown>) =>
    wrap(
      put<ApiDataEnvelope<{ id: number; name: string; email: string; role: string; token?: string }>>(
        '/users/me',
        data
      )
    ),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return wrap(upload(endpoints.upload + '/profile-photo', formData));
  },
};

export const adminSecurityApi = {
  getLogs: (limit = 100) =>
    wrap(get<{ success: boolean; data: SecurityLogRow[] }>(`/admin/logs${queryString({ limit })}`)),
  getCriticalLogs: (limit = 100) =>
    wrap(
      get<{ success: boolean; data: SecurityLogRow[] }>(`/admin/critical-logs${queryString({ limit })}`)
    ),
  getBlocked: () => wrap(get<{ success: boolean; data: BlockedEntityRow[] }>('/admin/blocked-users')),
  getThreatMlEvents: (limit = 100) =>
    wrap(
      get<{ success: boolean; data: ThreatMlEventRow[] }>(
        `/admin/threat-ml-events${queryString({ limit })}`
      )
    ),
  blockIp: (ip: string, reason?: string) =>
    wrap(
      post<{ success: boolean; message?: string; error?: string }>('/admin/block-ip', {
        ip,
        ...(reason ? { reason } : {}),
      })
    ),
  blockUser: (userId: number, reason?: string) =>
    wrap(
      post<{ success: boolean; message?: string; error?: string }>('/admin/block-user', {
        userId,
        ...(reason ? { reason } : {}),
      })
    ),
};

export const adminAttackSimApi = {
  getState: () =>
    wrap(get<{ success: boolean; security_mode_on: boolean }>('/admin/attack-sim/state')),
  getLogs: (limit = 100) =>
    wrap(
      get<{ success: boolean; data: AttackSimulationLogRow[] }>(
        `/admin/attack-sim/logs${queryString({ limit })}`
      )
    ),
};

export interface SecurityLogRow {
  id: number;
  user_id: string | null;
  ip_address: string;
  action: string;
  status: string;
  is_critical: boolean;
  details: string | null;
  created_at: string;
}

export interface BlockedEntityRow {
  id: number;
  user_id: string | null;
  ip_address: string | null;
  reason: string | null;
  blocked_at: string;
}

export interface ThreatMlEventRow {
  id: number;
  user_id: string | null;
  ip_address: string;
  http_method: string;
  path: string;
  label: string;
  confidence: number;
  attack_families: string | null;
  details: string | null;
  created_at: string;
}

export interface AttackSimulationLogRow {
  id: number;
  event_type: string;
  action: string;
  actor: string | null;
  details: string | null;
  blocked: boolean;
  created_at: string;
}

/** @deprecated Use named API groups (authApi, foodApi, etc.) */
export const api = { get: wrap, post: wrap, put: wrap, del: wrap };
