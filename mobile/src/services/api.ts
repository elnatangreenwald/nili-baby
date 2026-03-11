import axios from 'axios';
import { storage } from '../utils/storage';

const API_URL = 'https://nili-baby-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearAll();
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const babyApi = {
  create: (data: { name: string; birthDate: string; feedingIntervalMinutes?: number; targetAmountMl?: number }) =>
    api.post('/baby', data),
  getAll: () => api.get('/baby'),
  getOne: (id: string) => api.get(`/baby/${id}`),
  update: (id: string, data: { name?: string; feedingIntervalMinutes?: number; targetAmountMl?: number }) =>
    api.put(`/baby/${id}`, data),
  share: (id: string, email: string) =>
    api.post(`/baby/${id}/share`, { email }),
};

export const feedingApi = {
  create: (data: { babyId: string; type: 'BREASTFEEDING' | 'FORMULA'; amountMl?: number; notes?: string; time?: string }) =>
    api.post('/feeding', data),
  getAll: (babyId: string, limit?: number, offset?: number) =>
    api.get('/feeding', { params: { babyId, limit, offset } }),
  getLast: (babyId: string) =>
    api.get('/feeding/last', { params: { babyId } }),
  getStats: (babyId: string, days?: number) =>
    api.get('/feeding/stats', { params: { babyId, days } }),
  delete: (id: string) =>
    api.delete(`/feeding/${id}`),
};

export const reminderApi = {
  create: (data: { babyId: string; title: string; dailyTime: string }) =>
    api.post('/reminder', data),
  getAll: (babyId: string) =>
    api.get('/reminder', { params: { babyId } }),
  update: (id: string, data: { title?: string; dailyTime?: string; isActive?: boolean }) =>
    api.put(`/reminder/${id}`, data),
  delete: (id: string) =>
    api.delete(`/reminder/${id}`),
};

export const appointmentApi = {
  create: (data: { babyId: string; title: string; datetime: string; location?: string; notes?: string }) =>
    api.post('/appointment', data),
  getAll: (babyId: string, upcoming?: boolean) =>
    api.get('/appointment', { params: { babyId, upcoming } }),
  getOne: (id: string) =>
    api.get(`/appointment/${id}`),
  update: (id: string, data: { title?: string; datetime?: string; location?: string; notes?: string }) =>
    api.put(`/appointment/${id}`, data),
  delete: (id: string) =>
    api.delete(`/appointment/${id}`),
};

export default api;
