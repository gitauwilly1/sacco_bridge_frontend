import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import useUIStore from './stores/uiStore';
import useSocketStore from './stores/socketStore';
import { FullPageLoader } from './components/feedback/LoadingState';
import { Toaster } from '@/components/ui/sonner';
import AuthLayout from './features/auth/components/AuthLayout';
import AppShell from './components/layout/AppShell';
import AdminLayout from './features/admin/components/AdminLayout';
import { Outlet, useNavigate } from '@tanstack/react-router';

export default function App() {
  const { initialize, isLoading, isInitialized, isAuthenticated, user } = useAuthStore();
  const { setOnlineStatus } = useUIStore();
  const { connect, disconnect } = useSocketStore();
  const navigate = useNavigate();

  const isAdmin =
    user?.roles?.includes('PLATFORM_ADMIN') ||
    user?.roles?.includes('SUPPORT_AGENT') ||
    user?.role === 'PLATFORM_ADMIN' ||
    user?.role === 'SUPPORT_AGENT';

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => disconnect();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const isPathAdmin = window.location.pathname.startsWith('/admin');
      if (isAdmin && window.location.pathname === '/') {
        navigate({ to: '/admin' });
      } else if (!isAdmin && isPathAdmin) {
        navigate({ to: '/' });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (!isInitialized || isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {isAuthenticated ? (
        isAdmin ? (
          <AdminLayout>
            <Outlet />
          </AdminLayout>
        ) : (
          <AppShell>
            <Outlet />
          </AppShell>
        )
      ) : (
        <AuthLayout />
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}