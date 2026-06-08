import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import SplashScreen from '@/pages/onboarding/SplashScreen.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}