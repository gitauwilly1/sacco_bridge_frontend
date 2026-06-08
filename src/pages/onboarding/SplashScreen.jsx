import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-900 via-clay-800 to-terracotta-900 flex flex-col items-center justify-center">
      <div className="animate-breathe">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-terracotta-400 to-sand-300 flex items-center justify-center shadow-2xl">
          <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                viewBox="0 0 40 40"
                className="w-10 h-10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="14" cy="16" r="8" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="26" cy="24" r="8" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="20" cy="20" r="3" fill="white" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <h1 className="mt-8 text-3xl font-heading font-bold text-white tracking-tight">
        SACCO BRIDGE
      </h1>
      <p className="mt-2 text-sand-300 text-sm font-body">
        Your Circle. Guaranteed.
      </p>

      <div className="mt-12 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-terracotta-400 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-terracotta-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-terracotta-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}