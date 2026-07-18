import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') + '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 seconds for slow VMs
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: just pass errors through (no auto-redirect, no CSRF fetch)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default apiClient;
