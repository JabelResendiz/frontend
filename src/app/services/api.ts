import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 5000;

export const api = axios.create({
  baseURL,
  timeout,
});

// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔍 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Error desconocido';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // mejor que redirect directo
      window.location.href = '/login';
    }

    return Promise.reject(Object.assign(new Error(message), {
      status,
      backendData: error.response?.data,
    }));
  }
);