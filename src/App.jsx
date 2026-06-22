import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import useUIStore from './stores/uiStore';
import useSocketStore from './stores/socketStore';
import { FullPageLoader } from './components/feedback/LoadingState';
import { Toaster } from '@/components/ui/sonner';
import AuthLayout from './features/auth/components/AuthLayout';
import AppShell from './components/layout/AppShell';
import { Outlet } from '@tanstack/react-router';

export default function App() {
  const { initialize, isLoading, isInitialized, isAuthenticated } = useAuthStore();
  const { setOnlineStatus } = useUIStore();
  const { connect, disconnect } = useSocketStore();

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

  if (!isInitialized || isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="min-h-screen bg-surface">
      {isAuthenticated ? (
        <AppShell>
          <Outlet />
        </AppShell>
      ) : (
        <AuthLayout />
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}