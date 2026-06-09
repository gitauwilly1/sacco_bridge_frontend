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
import ContributionFlowPage from '@/pages/chamas/ContributionFlowPage.jsx';
import BulkContributionPage from '@/pages/chamas/BulkContributionPage.jsx';
import MarketPage from '@/pages/investments/MarketPage.jsx';
import SaccoDetailPage from '@/pages/investments/SaccoDetailPage.jsx';
import HoldingsPage from '@/pages/investments/HoldingsPage.jsx';
import LiquidityRequestsPage from '@/pages/investments/LiquidityRequestsPage.jsx';
import OpportunitiesPage from '@/pages/investments/OpportunitiesPage.jsx';
import ConnectionRoomPage from '@/pages/investments/ConnectionRoomPage.jsx';
import ActivityPage from '@/pages/transactions/ActivityPage.jsx';
import SettlementDetailPage from '@/pages/transactions/SettlementDetailPage.jsx';
import ReceiptsPage from '@/pages/transactions/ReceiptsPage.jsx';
import ReceiptDetailPage from '@/pages/transactions/ReceiptDetailPage.jsx';
import ProfilePage from '@/pages/profile/ProfilePage.jsx';
import NotificationsPage from '@/pages/notifications/NotificationsPage.jsx';
import ChatPage from '@/pages/chatbot/ChatPage.jsx';
import LoanApplicationPage from '@/pages/chamas/LoanApplicationPage.jsx';
import CreateLiquidityRequestPage from '@/pages/investments/CreateLiquidityRequestPage.jsx';
import PhoneEntryScreen from '@/pages/onboarding/PhoneEntryScreen.jsx';
import OTPVerifyScreen from '@/pages/onboarding/OTPVerifyScreen.jsx';
import RoleSelectScreen from '@/pages/onboarding/RoleSelectScreen.jsx';
import TermsScreen from '@/pages/onboarding/TermsScreen.jsx';

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
                <Route path="contribute" element={<ContributionFlowPage />} />
                <Route path="contribute/bulk" element={<BulkContributionPage />} />
                <Route path="saccos" element={<MarketPage />} />
                <Route path="saccos/:id" element={<SaccoDetailPage />} />
                <Route path="holdings" element={<HoldingsPage />} />
                <Route path="requests" element={<LiquidityRequestsPage />} />
                <Route path="opportunities" element={<OpportunitiesPage />} />
                <Route path="connections/:id" element={<ConnectionRoomPage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="settlements/:id" element={<SettlementDetailPage />} />
                <Route path="receipts" element={<ReceiptsPage />} />
                <Route path="receipts/:number" element={<ReceiptDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="chat/:sessionId" element={<ChatPage />} />
                <Route path="loans/new" element={<LoanApplicationPage />} />
                <Route path="requests/new" element={<CreateLiquidityRequestPage />} />
                <Route path="/onboarding" element={<PhoneEntryScreen />} />
                <Route path="/onboarding/verify" element={<OTPVerifyScreen />} />
                <Route path="/onboarding/roles" element={<RoleSelectScreen />} />
                <Route path="/onboarding/terms" element={<TermsScreen />} />
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