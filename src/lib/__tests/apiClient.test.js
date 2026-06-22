import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import apiClient, { setAccessToken, getAccessToken, clearAccessToken } from '../apiClient';

// Mock window.location
const originalLocation = global.window ? global.window.location : undefined;

describe('apiClient interceptors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAccessToken();

    // Setup global window and location if not present (Node environment)
    if (!global.window) {
      global.window = {};
    }
    global.window.location = { href: '' };

    // Reset the mock adapter on apiClient
    apiClient.defaults.adapter = vi.fn().mockImplementation((config) => {
      return Promise.resolve({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    });
  });

  afterEach(() => {
    if (originalLocation) {
      global.window.location = originalLocation;
    } else {
      delete global.window.location;
    }
  });

  it('should add Authorization header to requests when accessToken is set', async () => {
    setAccessToken('test-secret-token');

    const response = await apiClient.get('/some-secure-data');

    expect(response.config.headers.Authorization).toBe('Bearer test-secret-token');
  });

  it('should not add Authorization header if accessToken is not set', async () => {
    const response = await apiClient.get('/public-data');

    expect(response.config.headers.Authorization).toBeUndefined();
  });

  it('should retry original request on 401 by calling refresh token endpoint', async () => {
    let callCount = 0;
    
    // Simulate first call returning 401, second call succeeding
    apiClient.defaults.adapter = vi.fn().mockImplementation((config) => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject({
          response: { status: 401 },
          config,
        });
      }
      return Promise.resolve({
        data: { success: true, retried: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    });

    // Mock axios.post for the token refresh endpoint (called globally by response interceptor)
    const axiosPostSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        data: {
          access_token: 'newly-refreshed-token',
        },
      },
    });

    const response = await apiClient.get('/data-requiring-refresh');

    expect(axiosPostSpy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/token/refresh/'),
      { refresh: '' },
      { withCredentials: true }
    );
    expect(getAccessToken()).toBe('newly-refreshed-token');
    expect(response.data.retried).toBe(true);
    expect(response.config.headers.Authorization).toBe('Bearer newly-refreshed-token');
  });

  it('should clear access token and redirect to /login if refresh token request fails', async () => {
    // Fail first call with 401
    apiClient.defaults.adapter = vi.fn().mockImplementation((config) => {
      return Promise.reject({
        response: { status: 401 },
        config,
      });
    });

    // Mock token refresh to throw error
    const axiosPostSpy = vi.spyOn(axios, 'post').mockRejectedValue(new Error('Refresh failed'));

    await expect(apiClient.get('/data-unauthorized')).rejects.toThrow();

    expect(axiosPostSpy).toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
    expect(global.window.location.href).toBe('/login');
  });
});
