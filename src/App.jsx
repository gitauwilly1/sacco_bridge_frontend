import { useEffect, lazy, Suspense, ErrorBoundary } from 'react';
const AuthLayout = lazy(() => import('./features/auth/components/AuthLayout'));
import { useLocation } from '@tanstack/react-router';
import useAuthStore from './stores/authStore';
import useUIStore from './stores/uiStore';
import useSocketStore from './stores/socketStore';
import { isAdmin } from './utils/permissions';

import { ModeProvider } from './contexts/ModeContext';
import { Loader2 } from 'lucide-react';
import SkipToContent from './components/accessibility/SkipToContent';
import { FullPageLoader } from './components/feedback/LoadingState';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import AdminLayout from './features/admin/components/AdminLayout';
import { Outlet, useNavigate } from '@tanstack/react-router';
import ErrorFallback from './components/feedback/ErrorFallback';
import useIdleTimer from './hooks/useIdleTimer';
import SessionTimeoutModal from './components/feedback/SessionTimeoutModal';
import CookieConsentBanner from './components/CookieConsentBanner';

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

  const userIsAdmin = isAdmin(user);

  const authView = AUTH_ROUTE_VIEWS[location.pathname];
  const isAuthRoute = !!authView;

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated && isInitialized && isLoading) {
      const timer = setTimeout(() => {
        useAuthStore.setState({ isLoading: false });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isInitialized, isLoading]);

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

  const { showWarning, timeLeft, resetTimer } = useIdleTimer({
    enabled: isAuthenticated,
    onTimeout: () => {
      useAuthStore.getState().logout();
    },
  });

  // Redirect authenticated users away from auth routes
  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated && isAuthRoute) {
      // Already logged in, redirect to proper destination
      if (userIsAdmin) {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/' });
      }
      return;
    }

    // Redirect admin to admin dashboard on landing
    if (isAuthenticated && userIsAdmin && location.pathname === '/') {
      navigate({ to: '/admin' });
      return;
    }

    // Redirect non-admin away from admin routes
    if (isAuthenticated && !userIsAdmin && location.pathname.startsWith('/admin')) {
      navigate({ to: '/' });
      return;
    }

    // Unauthenticated user on protected route → redirect to login
    if (!isAuthenticated && !isAuthRoute) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, isInitialized, userIsAdmin, location.pathname]);

  if (!isInitialized || isLoading) {
    return <FullPageLoader />;
  }

const renderApp = () => {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-surface dark:bg-surface">
          <SkipToContent />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin size-8 text-primary" /></div>}>
            <AuthLayout initialView={authView || 'login'} />
          </Suspense>
          <Toaster position="top-center" richColors />
        </div>
      );
    }
    if (userIsAdmin) {
      return (
        <div className="min-h-screen bg-surface dark:bg-surface">
          <SkipToContent />
          <AdminLayout>
            <Outlet />
          </AdminLayout>
          <Toaster position="top-center" richColors />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-surface dark:bg-surface">
        <SkipToContent />
        <AppShell>
          <Outlet />
        </AppShell>
        <Toaster position="top-center" richColors />
      </div>
    );
  };

  return (
    <ErrorBoundary fallback={<ErrorFallback />} onReset={() => window.location.reload()}>
      <ModeProvider>
        {showWarning && <SessionTimeoutModal timeLeft={timeLeft} onStayLoggedIn={resetTimer} />}
        <CookieConsentBanner />
        {renderApp()}
      </ModeProvider>
    </ErrorBoundary>
  );
}