import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resqmeal_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: on 401/403 (missing or invalid/expired token), clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
    if (!isAuthRequest && (status === 401 || status === 403)) {
      localStorage.removeItem('resqmeal_token');
      localStorage.removeItem('resqmeal_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs (passwords hashed on backend with bcrypt; JWT returned)
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { id: number; name: string; email: string; role: string; token: string } }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: 'restaurant' | 'ngo' | 'volunteer'; phone_number?: string; address?: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

// Food APIs (Restaurant)
export const foodApi = {
  postFood: (data: any) => api.post('/food', data),
  getMyPosts: () => api.get('/food/my-posts'),
  /** Get available food for NGOs (POSTED/MATCHED/ACCEPTED/PICKED_UP, not expired). Query: latitude?, longitude?, radius_km?, food_type?, min_urgency?, max_urgency?, limit? */
  getAvailableFood: (params?: Record<string, string | number>) =>
    api.get('/food/available/all', { params }),
  updateFood: (id: string, data: any) => api.put(`/food/${id}`, data),
  deleteFood: (id: string) => api.delete(`/food/${id}`),
  /** Upload image for freshness check (uses fruit-veg-freshness-ai when backend is configured). */
  assessFreshness: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/food/assess-freshness', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  /** Check freshness by storage conditions (temperature, humidity, time) - Food-Freshness-Analyzer. */
  assessFreshnessByEnvironment: (data: {
    temperature: number;
    humidity: number;
    time_stored_hours: number;
    gas?: number;
  }) => api.post('/food/assess-freshness-by-environment', data),
  /** Classify food from image and get nutrition (Food-Image-Recognition, Food-101). */
  classifyImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/food/classify-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Match APIs (NGO)
export const matchApi = {
  getNGOMatches: () => api.get('/match/ngo'),
  acceptMatch: (matchId: string) => api.post(`/match/accept`, { matchId }),
  rejectMatch: (matchId: string) => api.post(`/match/reject`, { matchId }),
};

// Delivery APIs (Volunteer)
export const deliveryApi = {
  getVolunteerDeliveries: () => api.get('/delivery/volunteer'),
  completeDelivery: (deliveryId: string, proofPhoto: string) =>
    api.post('/delivery/complete', { deliveryId, proofPhoto }),
  updateDeliveryStatus: (deliveryId: string, status: string) =>
    api.put(`/delivery/${deliveryId}/status`, { status }),
};

// Impact APIs
export const impactApi = {
  getImpact: () => api.get('/impact'),
  getPublicStats: () => api.get('/impact/public'),
};

// User APIs
export const userApi = {
  getMe: () => api.get('/user/me'),
  updateMe: (data: any) => api.put('/user/me', data),
  uploadProfilePhoto: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/upload/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
