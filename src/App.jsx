import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import useAuthStore from './stores/authStore';
import useUIStore from './stores/uiStore';
import useSocketStore from './stores/socketStore';
import { FullPageLoader } from './components/feedback/LoadingState';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import AdminLayout from './features/admin/components/AdminLayout';
import AuthLayout from './features/auth/components/AuthLayout';
import { Outlet, useNavigate } from '@tanstack/react-router';

// Auth routes and the view they map to in AuthLayout
const AUTH_ROUTE_VIEWS = {
  '/login': 'login',
  '/register': 'register',
  '/forgot-password': 'forgot',
  '/verify-email': 'verify',
  '/verify-2fa': 'verify-2fa',
};

export default function App() {
  const { initialize, isLoading, isInitialized, isAuthenticated, user } = useAuthStore();
  const { setOnlineStatus } = useUIStore();
  const { connect, disconnect } = useSocketStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin =
    user?.roles?.includes('PLATFORM_ADMIN') ||
    user?.roles?.includes('SUPPORT_AGENT') ||
    user?.role === 'PLATFORM_ADMIN' ||
    user?.role === 'SUPPORT_AGENT';

  const authView = AUTH_ROUTE_VIEWS[location.pathname];
  const isAuthRoute = !!authView;

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

  // Redirect authenticated users away from auth routes
  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated && isAuthRoute) {
      // Already logged in, redirect to proper destination
      if (isAdmin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/' });
      }
      return;
    }

    // Redirect admin to admin dashboard on landing
    if (isAuthenticated && isAdmin && location.pathname === '/') {
      navigate({ to: '/admin' });
      return;
    }

    // Redirect non-admin away from admin routes
    if (isAuthenticated && !isAdmin && location.pathname.startsWith('/admin')) {
      navigate({ to: '/' });
      return;
    }

    // Unauthenticated user on protected route → redirect to login
    if (!isAuthenticated && !isAuthRoute) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isInitialized, isAdmin, location.pathname]);

  if (!isInitialized || isLoading) {
    return <FullPageLoader />;
  }

  // Unauthenticated → show AuthLayout (with correct view based on route)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface">
        <AuthLayout initialView={authView || 'login'} />
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // Authenticated admin → AdminLayout wrapping Outlet
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-surface">
        <AdminLayout>
          <Outlet />
        </AdminLayout>
        <Toaster position="top-center" richColors />
      </div>
    );
  }

  // Authenticated regular user → AppShell wrapping Outlet
  return (
    <div className="min-h-screen bg-surface">
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster position="top-center" richColors />
    </div>
  );
}