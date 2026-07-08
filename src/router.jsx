import { createRouter, createRoute, createRootRoute, useNavigate, useParams } from '@tanstack/react-router';
import React, { Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import App from './App';

// ── Feature imports (lazy loaded for code splitting) ────────────────────────
const DashboardHome = React.lazy(() => import('./features/dashboard/components/DashboardHome'));
const AuthLayout = React.lazy(() => import('./features/auth/components/AuthLayout'));
const ProfilePage = React.lazy(() => import('./features/profile/components/ProfilePage'));
const LoginHistory = React.lazy(() => import('./features/profile/components/LoginHistory'));
const DeviceManagement = React.lazy(() => import('./features/notifications/components/DeviceManagement'));
const SACCOList = React.lazy(() => import('./features/investments/components/SACCOList'));
const SACCODetail = React.lazy(() => import('./features/investments/components/SACCODetail'));
const HoldingsList = React.lazy(() => import('./features/investments/components/HoldingsList'));
const MyRequestsList = React.lazy(() => import('./features/investments/components/MyRequestsList'));
const RequestDetail = React.lazy(() => import('./features/investments/components/RequestDetail'));
const LiquidityRequestForm = React.lazy(() => import('./features/investments/components/LiquidityRequestForm'));
const OpportunityList = React.lazy(() => import('./features/investments/components/OpportunityList'));
const ConnectionList = React.lazy(() => import('./features/investments/components/ConnectionList'));
const ConnectionDetail = React.lazy(() => import('./features/investments/components/ConnectionDetail'));
const BuySharesForm = React.lazy(() => import('./features/investments/components/BuySharesForm'));
const PortfolioSummary = React.lazy(() => import('./features/investments/components/PortfolioSummary'));
const SACCOMarketChart = React.lazy(() => import('./features/investments/components/SACCOMarketChart'));
const ChamaDetail = React.lazy(() => import('./features/chamas/components/ChamaDetail'));
const ChamaForm = React.lazy(() => import('./features/chamas/components/ChamaForm'));
const RecordContribution = React.lazy(() => import('./features/chamas/components/RecordContribution'));
const BulkContribution = React.lazy(() => import('./features/chamas/components/BulkContribution'));
const LoanApplication = React.lazy(() => import('./features/chamas/components/LoanApplication'));
const LoanDetail = React.lazy(() => import('./features/chamas/components/LoanDetail'));
const MeetingForm = React.lazy(() => import('./features/chamas/components/MeetingForm'));
const MeetingDetail = React.lazy(() => import('./features/chamas/components/MeetingDetail'));
const PollForm = React.lazy(() => import('./features/chamas/components/PollForm'));
const PollDetail = React.lazy(() => import('./features/chamas/components/PollDetail'));
const SettlementList = React.lazy(() => import('./features/investments/components/SettlementTracker').then(m => ({ default: m.SettlementList })));
const SettlementTracker = React.lazy(() => import('./features/investments/components/SettlementTracker'));
const TransactionList = React.lazy(() => import('./features/transactions/components/TransactionList'));
const TransactionDetail = React.lazy(() => import('./features/transactions/components/TransactionDetail'));
const LedgerList = React.lazy(() => import('./features/transactions/components/LedgerList'));
const DisputeList = React.lazy(() => import('./features/transactions/components/DisputeList'));
const DisputeDetail = React.lazy(() => import('./features/transactions/components/DisputeDetail'));
const RaiseDisputeForm = React.lazy(() => import('./features/transactions/components/RaiseDisputeForm'));
const NotificationList = React.lazy(() => import('./features/notifications/components/NotificationList'));
const ChatScreen = React.lazy(() => import('./features/chatbot/components/ChatScreen'));
const ShareReceipt = React.lazy(() => import('./features/receipts/components/ShareReceipt'));
const HelpPage = React.lazy(() => import('./features/help/components/HelpPage'));
const SupportList = React.lazy(() => import('./features/support/components/SupportList'));
const CreateTicket = React.lazy(() => import('./features/support/components/CreateTicket'));
const SupportDetail = React.lazy(() => import('./features/support/components/SupportDetail'));
const SignatureVerify = React.lazy(() => import('./features/legal/components/SignatureVerify'));
const KYCVerification = React.lazy(() => import('./features/kyc/components/KYCVerification'));
const LegalAcceptance = React.lazy(() => import('./features/legal/components/LegalAcceptance'));
const NotFound = React.lazy(() => import('./components/feedback/NotFound'));

// Admin (lazy loaded for code splitting)
const AdminDashboard = React.lazy(() => import('./features/admin/components/AdminDashboard'));
const UserList = React.lazy(() => import('./features/admin/components/UserList'));
const UserDetail = React.lazy(() => import('./features/admin/components/UserDetail'));
const SACCOManagement = React.lazy(() => import('./features/admin/components/SACCOManagement'));
const AdminSACCODetail = React.lazy(() => import('./features/admin/components/AdminSACCODetail'));
const ChamaOversight = React.lazy(() => import('./features/admin/components/ChamaOversight'));
const AdminDisputeList = React.lazy(() => import('./features/admin/components/AdminDisputeList'));
const AdminDisputeDetail = React.lazy(() => import('./features/admin/components/AdminDisputeDetail'));
const FraudReview = React.lazy(() => import('./features/admin/components/FraudReview'));
const EscrowManagement = React.lazy(() => import('./features/admin/components/EscrowManagement'));
const AuditLog = React.lazy(() => import('./features/admin/components/AuditLog'));
const WebhookManagement = React.lazy(() => import('./features/admin/components/WebhookManagement'));
const LegalDocuments = React.lazy(() => import('./features/admin/components/LegalDocuments'));
const Reports = React.lazy(() => import('./features/admin/components/Reports'));
const DeletionRequests = React.lazy(() => import('./features/admin/components/DeletionRequests'));
const DeletionRequestDetail = React.lazy(() => import('./features/admin/components/DeletionRequestDetail'));
const KnowledgeBase = React.lazy(() => import('./features/admin/components/KnowledgeBase'));
const AdminVolumeAnalytics = React.lazy(() => import('./features/admin/components/AdminVolumeAnalytics'));
const AdminUnderwriting = React.lazy(() => import('./features/admin/components/AdminUnderwriting'));
const AdminSettlementList = React.lazy(() => import('./features/admin/components/AdminSettlementList'));
const ApprovalList = React.lazy(() => import('./features/admin/components/ApprovalList'));
const AdminKYCList = React.lazy(() => import('./features/admin/components/AdminKYCList'));

import { dashboardApi } from './features/dashboard/api/dashboardApi';
import { getInitials, formatKES } from './utils/format';
import useAuthStore from './stores/authStore';
import { isAdmin, canAccessRoute } from './utils/permissions';
import { FullPageLoader } from './components/feedback/LoadingState';

// ── Padding wrapper for full-page list views ─────────────────────────────────
function Padded({ children }) {
  return <div className="p-4 max-w-2xl mx-auto">{children}</div>;
}

// ── ChamaListPage ────────────────────────────────────────────────────────────
function ChamaListPage() {
  const navigate = useNavigate();
  const { data: chamas, isLoading } = useQuery({
    queryKey: ['myChamasList'],
    queryFn: () => dashboardApi.getMyChamas().then((r) => r.data),
  });

  const chamasList = Array.isArray(chamas) ? chamas : (chamas?.data || []);

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate">My Chamas</h1>
        <Button
          id="create-chama-btn"
          onClick={() => navigate({ to: '/chamas/new' })}
          className="bg-terracotta hover:bg-clay text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Chama
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : chamasList.length > 0 ? (
        <div className="space-y-3">
          {chamasList.map((chama) => (
            <Card
              key={chama.id}
              id={`chama-card-${chama.id}`}
              className="cursor-pointer card-lift border-sand hover:border-terracotta/30"
              onClick={() => navigate({ to: `/chamas/${chama.id}` })}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta text-white text-sm font-bold font-heading shadow-sm">
                  {getInitials(chama.name?.split(' ')[0], chama.name?.split(' ')[1])}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate text-sm truncate">{chama.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-normal">
                    {chama.role} · {formatKES(chama.balance)}
                  </p>
                  {chama.chama_type && (
                    <Badge className="mt-1 text-[10px] px-2 py-0.5 bg-sand text-slate border-sand-dark/20 rounded-full shadow-none border-0">
                      {chama.chama_type?.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {chama.health_grade && (
                    <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-0 ${
                      chama.health_grade.startsWith('A') ? 'bg-success/10 text-success' :
                      chama.health_grade === 'B' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-alert/10 text-alert'
                    }`}>
                      {chama.health_grade}
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-sand-light flex items-center justify-center">
            <Plus className="h-8 w-8 text-terracotta/50" />
          </div>
          <div>
            <p className="font-semibold text-slate">No chamas yet</p>
            <p className="text-sm text-gray-400 mt-1">Create or join a chama to get started.</p>
          </div>
          <Button
            onClick={() => navigate({ to: '/chamas/new' })}
            className="bg-terracotta hover:bg-clay text-white font-semibold rounded-xl px-6"
          >
            <Plus className="h-4 w-4 mr-2" /> Create your first Chama
          </Button>
        </div>
      )}
    </div>
  );
}

// ── InvestmentDashboard ──────────────────────────────────────────────────────
function InvestmentDashboard() {
  const navigate = useNavigate();
  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate">Investments</h1>
        <Button
          onClick={() => navigate({ to: '/investments/sell' })}
          className="bg-terracotta hover:bg-clay text-white font-semibold rounded-xl px-4 text-sm"
        >
          Sell Shares
        </Button>
      </div>

      {/* Quick nav tabs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'SACCOs', path: '/investments/saccos', emoji: '🏦' },
          { label: 'Holdings', path: '/investments/holdings', emoji: '📊' },
          { label: 'Opportunities', path: '/investments/opportunities', emoji: '🎯' },
          { label: 'Connections', path: '/investments/connections', emoji: '🤝' },
        ].map(({ label, path, emoji }) => (
          <button
            key={path}
            onClick={() => navigate({ to: path })}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-sand bg-white hover:border-terracotta/40 hover:bg-sand-light transition-all active:scale-[0.97]"
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-[10px] font-semibold text-slate">{label}</span>
          </button>
        ))}
      </div>

      {/* Portfolio summary */}
      <PortfolioSummary />

      {/* Market chart */}
      <SACCOMarketChart />
    </div>
  );
}

// ── Root Route ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <App />,
});

// ── App Routes ───────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <LazyLoad><DashboardHome /></LazyLoad>,
});

// ── Auth Routes ──────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <LazyLoad><AuthLayout initialView="login" /></LazyLoad>,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => <LazyLoad><AuthLayout initialView="register" /></LazyLoad>,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: () => <LazyLoad><AuthLayout initialView="forgot" /></LazyLoad>,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: () => <LazyLoad><AuthLayout initialView="verify" /></LazyLoad>,
});

const verify2FARoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-2fa',
  component: () => <LazyLoad><AuthLayout initialView="verify-2fa" /></LazyLoad>,
});

// ── Profile Routes ───────────────────────────────────────────────────────────
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => <LazyLoad><ProfilePage /></LazyLoad>,
});

const profileEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/edit',
  component: () => <LazyLoad><ProfilePage defaultTab="profile" /></LazyLoad>,
});

const profileSecurityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/security',
  component: () => <LazyLoad><ProfilePage defaultTab="security" /></LazyLoad>,
});

const profileNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/notifications',
  component: () => <LazyLoad><ProfilePage defaultTab="notifications" /></LazyLoad>,
});

const profileSessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/sessions',
  component: () => <LazyLoad><ProfilePage defaultTab="sessions" /></LazyLoad>,
});

const profileAppearanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/appearance',
  component: () => <LazyLoad><ProfilePage defaultTab="appearance" /></LazyLoad>,
});

const profileDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/data',
  component: () => <LazyLoad><ProfilePage defaultTab="data" /></LazyLoad>,
});

const profileLimitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/limits',
  component: () => <LazyLoad><ProfilePage defaultTab="limits" /></LazyLoad>,
});

const profileVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/verification',
  component: () => <LazyLoad><ProfilePage defaultTab="profile" /></LazyLoad>,
});

const profileConnectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/connections',
  component: () => <LazyLoad><Padded><ConnectionList /></Padded></LazyLoad>,
});

const profileConnectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/connections/$connectionId',
  component: () => <LazyLoad><ConnectionDetail /></LazyLoad>,
});

const profileLoginHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/login-history',
  component: () => <LazyLoad><Padded><LoginHistory /></Padded></LazyLoad>,
});

const profileDevicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/devices',
  component: () => <LazyLoad><Padded><DeviceManagement /></Padded></LazyLoad>,
});

// ── KYC Route ─────────────────────────────────────────────────────────────────
const kycRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kyc',
  component: () => <LazyLoad><KYCVerification /></LazyLoad>,
});

// Legacy settings/security aliases
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <LazyLoad><ProfilePage defaultTab="appearance" /></LazyLoad>,
});

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  component: () => <LazyLoad><ProfilePage defaultTab="security" /></LazyLoad>,
});

// ── Chama Routes ─────────────────────────────────────────────────────────────
const chamasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas',
  component: () => <LazyLoad><ChamaListPage /></LazyLoad>,
});

const newChamaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/new',
  component: () => <LazyLoad><ChamaForm /></LazyLoad>,
});

const chamaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId',
  component: () => <LazyLoad><ChamaDetail /></LazyLoad>,
});

// Chama sub-routes — these render ChamaDetail with the correct active tab
function ChamaDetailWithTab({ tab }) {
  const { chamaId } = useParams({ strict: false });
  return <ChamaDetail defaultTab={tab} />;
}

const chamaMembersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/members',
  component: () => <LazyLoad><ChamaDetailWithTab tab="members" /></LazyLoad>,
});

const chamaContributionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/contributions',
  component: () => <LazyLoad><ChamaDetailWithTab tab="contributions" /></LazyLoad>,
});

const chamaLoansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/loans',
  component: () => <LazyLoad><ChamaDetailWithTab tab="loans" /></LazyLoad>,
});

const chamaMeetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/meetings',
  component: () => <LazyLoad><ChamaDetailWithTab tab="meetings" /></LazyLoad>,
});

const chamaPollsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/polls',
  component: () => <LazyLoad><ChamaDetailWithTab tab="polls" /></LazyLoad>,
});

const chamaContributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/contribute',
  component: () => <LazyLoad><RecordContribution /></LazyLoad>,
});

const chamaBulkContributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/bulk-contribute',
  component: () => <LazyLoad><BulkContribution /></LazyLoad>,
});

const chamaLoanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/loan',
  component: () => <LazyLoad><LoanApplication /></LazyLoad>,
});

const chamaLoanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/loans/$loanId',
  component: () => <LazyLoad><LoanDetail /></LazyLoad>,
});

const chamaNewMeetingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/meetings/new',
  component: () => <LazyLoad><MeetingForm /></LazyLoad>,
});

const chamaMeetingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/meetings/$meetingId',
  component: () => <LazyLoad><MeetingDetail /></LazyLoad>,
});

const chamaNewPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/polls/new',
  component: () => <LazyLoad><PollForm /></LazyLoad>,
});

const chamaPollDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/polls/$pollId',
  component: () => <LazyLoad><PollDetail /></LazyLoad>,
});

// ── Investment Routes ─────────────────────────────────────────────────────────
const investmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments',
  component: () => <LazyLoad><InvestmentDashboard /></LazyLoad>,
});

const investmentsSaccosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos',
  component: () => <LazyLoad><Padded><SACCOList /></Padded></LazyLoad>,
});

const saccoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId',
  component: () => <LazyLoad><SACCODetail /></LazyLoad>,
});

const buySharesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId/buy',
  component: () => <LazyLoad><BuySharesForm /></LazyLoad>,
});

const investmentsSaccoSellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId/sell',
  component: () => <LazyLoad><LiquidityRequestForm /></LazyLoad>,
});

const holdingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/holdings',
  component: () => <LazyLoad><Padded><HoldingsList /></Padded></LazyLoad>,
});

// Legacy alias
const holdingsLegacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/holdings',
  component: () => <LazyLoad><Padded><HoldingsList /></Padded></LazyLoad>,
});

const investmentsRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/requests/$requestId',
  component: () => <LazyLoad><RequestDetail /></LazyLoad>,
});

const investmentsRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/requests',
  component: () => <LazyLoad><Padded><MyRequestsList /></Padded></LazyLoad>,
});

const investmentsSellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/sell',
  component: () => <LazyLoad><LiquidityRequestForm /></LazyLoad>,
});

const opportunitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/opportunities',
  component: () => <LazyLoad><Padded><OpportunityList /></Padded></LazyLoad>,
});

const connectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/connections',
  component: () => <LazyLoad><Padded><ConnectionList /></Padded></LazyLoad>,
});

const connectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/connections/$connectionId',
  component: () => <LazyLoad><ConnectionDetail /></LazyLoad>,
});

const settlementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/settlements',
  component: () => <LazyLoad><Padded><SettlementList /></Padded></LazyLoad>,
});

const settlementDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/settlements/$settlementId',
  component: () => <LazyLoad><SettlementTrackerPage /></LazyLoad>,
});

// ── Transaction Routes ────────────────────────────────────────────────────────
const activityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity',
  component: () => <LazyLoad><Padded><TransactionList /></Padded></LazyLoad>,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: () => <LazyLoad><Padded><TransactionList /></Padded></LazyLoad>,
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/$settlementId',
  component: () => <LazyLoad><TransactionDetail /></LazyLoad>,
});

const transactionRaiseDisputeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/$settlementId/dispute',
  component: () => <LazyLoad><RaiseDisputeForm /></LazyLoad>,
});

const disputeListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/disputes',
  component: () => <LazyLoad><Padded><DisputeList /></Padded></LazyLoad>,
});

// Legacy alias
const disputeListLegacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes',
  component: () => <LazyLoad><Padded><DisputeList /></Padded></LazyLoad>,
});

const disputeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes/$disputeId',
  component: () => <LazyLoad><DisputeDetail /></LazyLoad>,
});

const ledgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ledger',
  component: () => <LazyLoad><Padded><LedgerList /></Padded></LazyLoad>,
});

const shareReceiptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receipts/$receiptId',
  component: () => <LazyLoad><ShareReceipt /></LazyLoad>,
});

// ── Notification Routes ───────────────────────────────────────────────────────
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => <LazyLoad><Padded><NotificationList /></Padded></LazyLoad>,
});

const notificationPreferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications/preferences',
  component: () => <LazyLoad><ProfilePage defaultTab="notifications" /></LazyLoad>,
});

// ── Chat / Assistant Routes ───────────────────────────────────────────────────
const assistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistant',
  component: () => <LazyLoad><ChatScreen /></LazyLoad>,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: () => <LazyLoad><ChatScreen /></LazyLoad>,
});

const chatSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$sessionId',
  component: () => <LazyLoad><ChatScreen /></LazyLoad>,
});

// ── Help Route ────────────────────────────────────────────────────────────────
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help',
  component: () => <LazyLoad><HelpPage /></LazyLoad>,
});

// ── Support Ticket Routes ──────────────────────────────────────────────────────
const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support',
  component: () => <LazyLoad><SupportList /></LazyLoad>,
});

const supportNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support/new',
  component: () => <LazyLoad><CreateTicket /></LazyLoad>,
});

const supportDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support/$ticketId',
  component: () => <LazyLoad><SupportDetail /></LazyLoad>,
});

const legalVerifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/verify/$hash',
  component: () => <LazyLoad><SignatureVerify /></LazyLoad>,
});

const legalDocumentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/legal/documents',
  component: () => <LazyLoad><Padded><LegalAcceptance /></Padded></LazyLoad>,
});

function LazyLoad({ children }) {
  return <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin size-8 text-primary" /></div>}>{children}</Suspense>;
}

function SettlementTrackerPage() {
  const { settlementId } = useParams({ strict: false });
  return <SettlementTracker settlementId={settlementId} />;
}

function AdminGuard({ children, restricted }) {
  const { user, isInitialized } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isInitialized) return;
    if (!isAdmin(user)) {
      navigate({ to: '/' });
      return;
    }
    if (restricted && !canAccessRoute(user, window.location.pathname)) {
      navigate({ to: '/admin' });
    }
  }, [isInitialized, user, restricted]);
  if (!isInitialized) return <FullPageLoader />;
  if (!isAdmin(user)) return null;
  if (restricted && !canAccessRoute(user, window.location.pathname)) return null;
  return children;
}

// ── Admin Routes ──────────────────────────────────────────────────────────────
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => <AdminGuard><LazyLoad><AdminDashboard /></LazyLoad></AdminGuard>,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: () => <AdminGuard><LazyLoad><UserList /></LazyLoad></AdminGuard>,
});

const adminUserDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users/$userId',
  component: () => <AdminGuard><LazyLoad><UserDetail /></LazyLoad></AdminGuard>,
});

const adminSaccosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/saccos',
  component: () => <AdminGuard><LazyLoad><SACCOManagement /></LazyLoad></AdminGuard>,
});

const adminSACCODetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/saccos/$saccoId',
  component: () => <AdminGuard><LazyLoad><AdminSACCODetail /></LazyLoad></AdminGuard>,
});

const adminChamasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/chamas',
  component: () => <AdminGuard><LazyLoad><ChamaOversight /></LazyLoad></AdminGuard>,
});

const adminDisputesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/disputes',
  component: () => <AdminGuard><LazyLoad><AdminDisputeList /></LazyLoad></AdminGuard>,
});

const adminDisputeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/disputes/$disputeId',
  component: () => <AdminGuard><LazyLoad><AdminDisputeDetail /></LazyLoad></AdminGuard>,
});

const adminFraudRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/fraud',
  component: () => <AdminGuard><LazyLoad><FraudReview /></LazyLoad></AdminGuard>,
});

const adminEscrowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/escrow',
  component: () => <AdminGuard><LazyLoad><EscrowManagement /></LazyLoad></AdminGuard>,
});

const adminAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/audit',
  component: () => <AdminGuard restricted><LazyLoad><AuditLog /></LazyLoad></AdminGuard>,
});

const adminWebhooksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/webhooks',
  component: () => <AdminGuard restricted><LazyLoad><WebhookManagement /></LazyLoad></AdminGuard>,
});

const adminLegalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/legal',
  component: () => <AdminGuard restricted><LazyLoad><LegalDocuments /></LazyLoad></AdminGuard>,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/reports',
  component: () => <AdminGuard><LazyLoad><Reports /></LazyLoad></AdminGuard>,
});

const adminDeletionRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/deletion-requests',
  component: () => <AdminGuard restricted><LazyLoad><DeletionRequests /></LazyLoad></AdminGuard>,
});

const adminDeletionRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/deletion-requests/$id',
  component: () => <AdminGuard restricted><LazyLoad><DeletionRequestDetail /></LazyLoad></AdminGuard>,
});

// Spec alias
const adminDeletionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/deletions',
  component: () => <AdminGuard restricted><LazyLoad><DeletionRequests /></LazyLoad></AdminGuard>,
});

const adminKnowledgeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/knowledge',
  component: () => <AdminGuard><LazyLoad><KnowledgeBase /></LazyLoad></AdminGuard>,
});

const adminVolumeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/volume',
  component: () => <AdminGuard><LazyLoad><AdminVolumeAnalytics /></LazyLoad></AdminGuard>,
});

const adminUnderwritingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/underwriting',
  component: () => <AdminGuard><LazyLoad><AdminUnderwriting /></LazyLoad></AdminGuard>,
});

const adminSettlementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settlements',
  component: () => <AdminGuard><LazyLoad><AdminSettlementList /></LazyLoad></AdminGuard>,
});

const adminApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/approvals',
  component: () => <AdminGuard><LazyLoad><ApprovalList /></LazyLoad></AdminGuard>,
});

const adminKYCRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/kyc',
  component: () => <AdminGuard><LazyLoad><AdminKYCList /></LazyLoad></AdminGuard>,
});

// ── Catch-all 404 ─────────────────────────────────────────────────────────────
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: () => <LazyLoad><NotFound /></LazyLoad>,
});

// ── Route Tree ────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  // Core
  indexRoute,

  // Auth
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  verifyEmailRoute,
  verify2FARoute,

  // Profile
  profileRoute,
  profileEditRoute,
  profileSecurityRoute,
  profileNotificationsRoute,
  profileSessionsRoute,
  profileAppearanceRoute,
  profileDataRoute,
  profileLimitsRoute,
  profileVerificationRoute,
  profileConnectionsRoute,
  profileConnectionDetailRoute,
  profileLoginHistoryRoute,
  settingsRoute,
  securityRoute,

  // KYC
  kycRoute,

  // Chamas
  chamasRoute,
  newChamaRoute,
  chamaDetailRoute,
  chamaMembersRoute,
  chamaContributionsRoute,
  chamaLoansRoute,
  chamaMeetingsRoute,
  chamaPollsRoute,
  chamaContributeRoute,
  chamaBulkContributeRoute,
  chamaLoanRoute,
  chamaLoanDetailRoute,
  chamaNewMeetingRoute,
  chamaMeetingDetailRoute,
  chamaNewPollRoute,
  chamaPollDetailRoute,

  // Investments
  investmentsRoute,
  investmentsSaccosRoute,
  saccoDetailRoute,
  buySharesRoute,
  investmentsSaccoSellRoute,
  holdingsRoute,
  holdingsLegacyRoute,
  investmentsRequestDetailRoute,
  investmentsRequestsRoute,
  investmentsSellRoute,
  opportunitiesRoute,
  connectionsRoute,
  connectionDetailRoute,
  settlementsRoute,
  settlementDetailRoute,

  // Transactions
  activityRoute,
  transactionsRoute,
  transactionDetailRoute,
  transactionRaiseDisputeRoute,
  disputeListRoute,
  disputeListLegacyRoute,
  disputeDetailRoute,
  ledgerRoute,
  shareReceiptRoute,

  // Notifications
  notificationsRoute,
  notificationPreferencesRoute,

  // Chat
  assistantRoute,
  chatRoute,
  chatSessionRoute,

  // Help
  helpRoute,

  // Support
  supportRoute,
  supportNewRoute,
  supportDetailRoute,

  // Legal
  legalVerifyRoute,
  legalDocumentsRoute,

  // Admin
  adminDashboardRoute,
  adminUsersRoute,
  adminUserDetailRoute,
  adminSaccosRoute,
  adminSACCODetailRoute,
  adminChamasRoute,
  adminDisputesRoute,
  adminDisputeDetailRoute,
  adminFraudRoute,
  adminEscrowRoute,
  adminAuditRoute,
  adminWebhooksRoute,
  adminLegalRoute,
  adminReportsRoute,
  adminDeletionRequestsRoute,
  adminDeletionRequestDetailRoute,
  adminDeletionsRoute,
  adminKnowledgeRoute,
  adminVolumeRoute,
  adminUnderwritingRoute,
  adminSettlementsRoute,
  adminApprovalsRoute,
  adminKYCRoute,

  // Profile sub pages
  profileDevicesRoute,

  // 404
  catchAllRoute,
]);

export const router = createRouter({ routeTree });
