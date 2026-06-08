import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ModeProvider } from '@/contexts/ModeContext.jsx';
import { queryClient } from '@/lib/query-client.js';
import ProtectedRoute from '@/components/layout/ProtectedRoute.jsx';
import AppShell from '@/components/layout/AppShell.jsx';
import SplashScreen from '@/pages/onboarding/SplashScreen.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ModeProvider>
            <Routes>
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </ModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}