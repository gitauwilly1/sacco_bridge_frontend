import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/pages/onboarding/SplashScreen';

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