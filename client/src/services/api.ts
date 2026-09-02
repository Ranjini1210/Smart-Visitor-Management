import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('svm_token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers.Authorization = `Bearer svm_guest_token`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginOrAuth =
        window.location.pathname.includes('/login') ||
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/pin-login') ||
        error.config?.url?.includes('/auth/me');

      if (!isLoginOrAuth) {
        // Clear invalid token session
        localStorage.removeItem('svm_token');
        localStorage.removeItem('svm_user');
      }
    }
    return Promise.reject(error);
  }
);
