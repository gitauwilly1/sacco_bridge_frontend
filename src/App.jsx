import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { ModeProvider } from '@/contexts/ModeContext.jsx';
import { queryClient } from '@/lib/query-client.js';
import ProtectedRoute from '@/components/layout/ProtectedRoute.jsx';
import AppShell from '@/components/layout/AppShell.jsx';
import SplashScreen from '@/pages/onboarding/SplashScreen.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage.jsx';
import HomePage from '@/pages/home/HomePage.jsx';
import ChamaListPage from '@/pages/chamas/ChamaListPage.jsx';
import ChamaDetailPage from '@/pages/chamas/ChamaDetailPage.jsx';
import ChamaMembersPage from '@/pages/chamas/ChamaMembersPage.jsx';
import ChamaContributionsPage from '@/pages/chamas/ChamaContributionsPage.jsx';
import ChamaLoansPage from '@/pages/chamas/ChamaLoansPage.jsx';
import ChamaMeetingsPage from '@/pages/chamas/ChamaMeetingsPage.jsx';
import ChamaSettingsPage from '@/pages/chamas/ChamaSettingsPage.jsx';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ModeProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/splash" element={<SplashScreen />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="chamas" element={<ChamaListPage />} />
                <Route path="chamas/:id" element={<ChamaDetailPage />} />
                <Route path="chamas/:id/members" element={<ChamaMembersPage />} />
                <Route path="chamas/:id/contributions" element={<ChamaContributionsPage />} />
                <Route path="chamas/:id/loans" element={<ChamaLoansPage />} />
                <Route path="chamas/:id/meetings" element={<ChamaMeetingsPage />} />
                <Route path="chamas/:id/settings" element={<ChamaSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/splash" replace />} />
            </Routes>
          </ModeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}