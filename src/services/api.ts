import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('resqmeal_token');
      localStorage.removeItem('resqmeal_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Food APIs (Restaurant)
export const foodApi = {
  postFood: (data: any) => api.post('/food', data),
  getMyPosts: () => api.get('/food/my-posts'),
  updateFood: (id: string, data: any) => api.put(`/food/${id}`, data),
  deleteFood: (id: string) => api.delete(`/food/${id}`),
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
