import axios from 'axios';
import env from '../config/env';

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

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Auto-inject idempotency key for write requests
  const method = config.method?.toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method) && !config.headers['X-Idempotency-Key']) {
    config.headers['X-Idempotency-Key'] = generateUUID();
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
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

    return Promise.reject(error);
  }
);

export default apiClient;