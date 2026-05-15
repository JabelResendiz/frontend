import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './token-manager';
import { authService } from './auth.service';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5137';
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || 5000;

export const api = axios.create({
  baseURL,
  timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let refreshSubscribers: Array<(token: string | null) => void> = [];
let logoutHandler: (() => void) | null = null;

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

export const registerLogoutHandler = (callback: () => void) => {
  logoutHandler = callback;
};

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return [
    '/Authentication/login',
    '/Authentication/refresh',
    '/Authentication/logout',
  ].some((path) => url.includes(path));
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Error desconocido';

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = authService.refreshToken()
          .then((newToken) => {
            setAccessToken(newToken);
            onRefreshed(newToken);
            return newToken;
          })
          .catch((refreshError) => {
            clearAccessToken();
            logoutHandler?.();
            return null;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          if (!newToken) {
            reject(new Error('Sesión expirada.')); 
            return;
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          try {
            const response = await api(originalRequest);
            resolve(response);
          } catch (retryError) {
            reject(retryError);
          }
        });
      });
    }

    if (status === 401 && isAuthEndpoint(originalRequest?.url)) {
      clearAccessToken();
      logoutHandler?.();
    }

    return Promise.reject(Object.assign(new Error(message), {
      status,
      backendData: error.response?.data,
    }));
  }
);

export const authApi = axios.create({
  baseURL,
  timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
