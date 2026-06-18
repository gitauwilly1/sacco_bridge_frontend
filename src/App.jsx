import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import useUIStore from './stores/uiStore';
import { FullPageLoader } from './components/feedback/LoadingState';
import { Toaster } from '@/components/ui/sonner';
import AuthLayout from './features/auth/components/AuthLayout';

export default function App() {
  const { initialize, isLoading, isInitialized, isAuthenticated } = useAuthStore();
  const { setOnlineStatus } = useUIStore();

  useEffect(() => {
    initialize();
  }, []);

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
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-slate">Dashboard coming next...</p>
        </div>
      ) : (
        <AuthLayout />
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}