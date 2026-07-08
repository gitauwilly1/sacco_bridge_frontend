import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient, { setAccessToken, clearAccessToken } from '../lib/apiClient';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,

      login: async (email, password, recaptcha_token) => {
        const body = {
          email,
          password,
          device_info: navigator.userAgent.slice(0, 50),
        };
        if (recaptcha_token) {
          body.recaptcha = recaptcha_token;
        }

        const { data } = await apiClient.post('/auth/login/', body);

        if (data.data?.requires_2fa) {
          return {
            requires2FA: true,
            sessionToken: data.data.session_token,
          };
        }

        setAccessToken(data.data.access_token);
        set({
          user: data.data.user,
          isAuthenticated: true,
          isLoading: true,
        });

        return { success: true };
      },

      verify2FA: async (totpCode, sessionToken) => {
        const { data } = await apiClient.post('/auth/2fa/verify/', {
          totp_code: totpCode,
          session_token: sessionToken,
        });

        setAccessToken(data.data.access_token);
        set({
          user: data.data.user,
          isAuthenticated: true,
          isLoading: true,
        });
      },

      googleLogin: async (idToken) => {
        const { data } = await apiClient.post('/auth/google/', {
          id_token: idToken,
          device_info: navigator.userAgent.slice(0, 50),
        });

        setAccessToken(data.data.access_token);
        set({
          user: data.data.user,
          isAuthenticated: true,
          isLoading: true,
        });

        return { success: true };
      },

      register: async (formData) => {
        const { data } = await apiClient.post('/auth/register/', formData);
        return data;
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout/', {});
        } catch (e) {
          // Ignore
        }
        clearAccessToken();
        set({ user: null, isAuthenticated: false });
      },

      initialize: async () => {
        try {
          const { data } = await apiClient.post('/auth/token/refresh/', {});
          if (data.data?.access_token) {
            setAccessToken(data.data.access_token);
            set({
              user: data.data.user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            return;
          }
        } catch (e) {
          clearAccessToken();
        }
        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'sacco-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;