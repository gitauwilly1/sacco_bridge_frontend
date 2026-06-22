import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Define window mock globally for environment independence
if (typeof global.window === 'undefined') {
  global.window = {};
}

// Define navigator mock
const navigatorMock = { userAgent: 'mock-user-agent' };
Object.defineProperty(global, 'navigator', {
  value: navigatorMock,
  writable: true,
  configurable: true,
});
global.window.navigator = navigatorMock;

// Mock localStorage
const localStorageStore = {};
const localStorageMock = {
  getItem: vi.fn((key) => localStorageStore[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageStore[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  }),
};

global.localStorage = localStorageMock;
global.window.localStorage = localStorageMock;

import apiClient, { setAccessToken, clearAccessToken } from '../../lib/apiClient';

vi.mock('../../lib/apiClient', () => {
  return {
    default: {
      post: vi.fn(),
    },
    setAccessToken: vi.fn(),
    clearAccessToken: vi.fn(),
  };
});

let useAuthStore;

describe('authStore', () => {
  beforeAll(async () => {
    const module = await import('../authStore');
    useAuthStore = module.default;
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Reset store state to initial state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('should update state on login success', async () => {
    const mockUser = { id: 1, email: 'test@example.com', first_name: 'Jane' };
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          access_token: 'mock-access-token',
          user: mockUser,
        },
      },
    });

    const result = await useAuthStore.getState().login('test@example.com', 'password123');

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login/', {
      email: 'test@example.com',
      password: 'password123',
      device_info: 'mock-user-agent',
    });
    expect(setAccessToken).toHaveBeenCalledWith('mock-access-token');
    expect(result).toEqual({ success: true });

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should not update state on login failure', async () => {
    apiClient.post.mockRejectedValue(new Error('Invalid credentials'));

    await expect(
      useAuthStore.getState().login('test@example.com', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials');

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('should clear state on logout', async () => {
    // Set authenticated state first
    useAuthStore.setState({
      user: { id: 1, email: 'test@example.com' },
      isAuthenticated: true,
      isLoading: false,
    });

    apiClient.post.mockResolvedValue({});

    await useAuthStore.getState().logout();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout/', {});
    expect(clearAccessToken).toHaveBeenCalled();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should persist and restore state from localStorage', () => {
    // Set state which triggers Zustand persist middleware
    useAuthStore.setState({
      user: { id: 1, email: 'test@example.com' },
      isAuthenticated: true,
    });

    // Check if store state was written to localStorage under 'sacco-auth'
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sacco-auth',
      expect.stringContaining('"isAuthenticated":true')
    );

    const persistedVal = localStorage.getItem('sacco-auth');
    const parsed = JSON.parse(persistedVal);
    expect(parsed.state.user).toEqual({ id: 1, email: 'test@example.com' });
    expect(parsed.state.isAuthenticated).toBe(true);
  });
});
