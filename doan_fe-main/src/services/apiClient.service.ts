// src/services/apiClient.ts
import axios from 'axios';
import { authService } from './auth.service';
import { useAuthStore } from '../store/useAuthStore';
// import { clearUser } from './storage.service';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ||
  'http://localhost:8096/api';



const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/admin/login') ||
      originalRequest.url?.includes('/auth/me');

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await authService.refreshToken(); // dùng cookie

      return apiClient(originalRequest); // gọi lại request cũ
    } catch (err) {
      // refresh fail → logout
      useAuthStore.getState().logout();
      return Promise.reject(err);
    }
  }
);
// Response interceptor: handle 401
// apiClient.interceptors.response.use(
//   (resp) => resp,
//   (error) => {
//     const status = error?.response?.status;
//     const url = error?.config?.url || '';
    
//     // QUAN TRỌNG: Không xử lý 401 cho login endpoint
//     if (status === 401 || status === 403 && !url.includes('/auth/login')) {
//       clearUser();
//       try {
//         window.location.href = '/auth/login';
//       } catch {
//         if (typeof window !== 'undefined') window.location.href = '/auth/login';
//       }
//     }
    
//     // QUAN TRỌNG: Luôn trả về error để component có thể catch
//     return Promise.reject(error);
//   }
// );

export default apiClient;
