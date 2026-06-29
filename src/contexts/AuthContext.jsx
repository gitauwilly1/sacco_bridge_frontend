import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '@/lib/apiClient';
import { isAdmin as checkIsAdmin, isPlatformAdmin as checkIsPlatformAdmin, isSupportAgent as checkIsSupportAgent } from '@/utils/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get('/users/profile/');
      setUser(data.data);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await apiClient.post('/auth/login/', {
      email,
      password,
      device_info: 'Web',
    });

    if (data.data.requires_2fa) {
      return { requires2FA: true, sessionToken: data.data.session_token };
    }

    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    setUser(data.data.user);
    setIsAuthenticated(true);
    return { requires2FA: false };
  };

  const verify2FA = async (totpCode, sessionToken) => {
    const { data } = await apiClient.post('/auth/2fa/verify/', {
      totp_code: totpCode,
      session_token: sessionToken,
    });

    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    setUser(data.data.user);
    setIsAuthenticated(true);
  };

  const register = async (userData) => {
    const { data } = await apiClient.post('/auth/register/', userData);
    return data;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout/', { refresh_token: refreshToken });
      }
    } catch (error) {
      // Proceed with local logout even if API call fails
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);
  const isPlatformAdmin = useMemo(() => checkIsPlatformAdmin(user), [user]);
  const isSupportAgent = useMemo(() => checkIsSupportAgent(user), [user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    isPlatformAdmin,
    isSupportAgent,
    login,
    verify2FA,
    register,
    logout,
    updateUser,
    refreshUser: fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}