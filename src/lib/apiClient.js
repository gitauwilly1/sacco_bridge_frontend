import axios from 'axios';
import env from '../config/env';
import { logger } from './logger';

const apiClient = axios.create({
  baseURL: env.API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const WRITE_METHODS = ['post', 'put', 'patch', 'delete'];

apiClient.interceptors.request.use(async (config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const method = config.method?.toLowerCase();

  // Auto-inject idempotency key for write requests
  if (WRITE_METHODS.includes(method) && !config.headers['X-Idempotency-Key']) {
    config.headers['X-Idempotency-Key'] = generateUUID();
  }

  // Queue write requests when offline
  if (WRITE_METHODS.includes(method) && typeof navigator !== 'undefined' && !navigator.onLine) {
    const { offlineQueue } = await import('./offlineQueue');
    await offlineQueue.add({
      method: method.toUpperCase(),
      url: config.url,
      data: config.data,
    });
    return Promise.reject({ __offline_queued: true, message: 'Queued for when you are back online.' });
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Offline-queued request — resolve silently so calling code doesn't error
    if (error.__offline_queued) {
      return Promise.resolve({
        data: { offline: true, queued: true, message: error.message },
        status: 202,
        statusText: 'Accepted (queued offline)',
        headers: {},
        config: error.config,
      });
    }

    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest.url?.includes('/auth/login/') ||
                           originalRequest.url?.includes('/auth/token/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${env.API_URL}/auth/token/refresh/`,
          { refresh: '' },
          { withCredentials: true }
        );

        const newToken = data.data?.access_token;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearAccessToken();
        window.location.href = '/login';
      }
    }

    logger.captureException(error, {
      handler: 'apiClient',
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);

export default apiClient;