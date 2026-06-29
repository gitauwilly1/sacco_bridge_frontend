import { createRouter, createRoute, createRootRoute, useNavigate, useParams } from '@tanstack/react-router';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import App from './App';

// ── Feature imports ─────────────────────────────────────────────────────────
import DashboardHome from './features/dashboard/components/DashboardHome';

// Auth
import AuthLayout from './features/auth/components/AuthLayout';

// Profile
import ProfilePage from './features/profile/components/ProfilePage';

// Investments
import SACCOList from './features/investments/components/SACCOList';
import SACCODetail from './features/investments/components/SACCODetail';
import HoldingsList from './features/investments/components/HoldingsList';
import MyRequestsList from './features/investments/components/MyRequestsList';
import LiquidityRequestForm from './features/investments/components/LiquidityRequestForm';
import OpportunityList from './features/investments/components/OpportunityList';
import ConnectionList from './features/investments/components/ConnectionList';
import ConnectionDetail from './features/investments/components/ConnectionDetail';
import BuySharesForm from './features/investments/components/BuySharesForm';
import PortfolioSummary from './features/investments/components/PortfolioSummary';
import SACCOMarketChart from './features/investments/components/SACCOMarketChart';

// Chamas
import ChamaDetail from './features/chamas/components/ChamaDetail';
import ChamaForm from './features/chamas/components/ChamaForm';
import RecordContribution from './features/chamas/components/RecordContribution';
import BulkContribution from './features/chamas/components/BulkContribution';
import LoanApplication from './features/chamas/components/LoanApplication';

// Transactions
import TransactionList from './features/transactions/components/TransactionList';
import TransactionDetail from './features/transactions/components/TransactionDetail';
import LedgerList from './features/transactions/components/LedgerList';
import DisputeList from './features/transactions/components/DisputeList';
import DisputeDetail from './features/transactions/components/DisputeDetail';
import RaiseDisputeForm from './features/transactions/components/RaiseDisputeForm';

// Notifications
import NotificationList from './features/notifications/components/NotificationList';

// Chatbot
import ChatScreen from './features/chatbot/components/ChatScreen';

// Receipts
import ShareReceipt from './features/receipts/components/ShareReceipt';

// Help
import HelpPage from './features/help/components/HelpPage';

// Feedback
import NotFound from './components/feedback/NotFound';

// Admin
import AdminDashboard from './features/admin/components/AdminDashboard';
import UserList from './features/admin/components/UserList';
import UserDetail from './features/admin/components/UserDetail';
import SACCOManagement from './features/admin/components/SACCOManagement';
import AdminSACCODetail from './features/admin/components/AdminSACCODetail';
import ChamaOversight from './features/admin/components/ChamaOversight';
import AdminDisputeList from './features/admin/components/AdminDisputeList';
import AdminDisputeDetail from './features/admin/components/AdminDisputeDetail';
import FraudReview from './features/admin/components/FraudReview';
import EscrowManagement from './features/admin/components/EscrowManagement';
import AuditLog from './features/admin/components/AuditLog';
import WebhookManagement from './features/admin/components/WebhookManagement';
import LegalDocuments from './features/admin/components/LegalDocuments';
import Reports from './features/admin/components/Reports';
import DeletionRequests from './features/admin/components/DeletionRequests';
import KnowledgeBase from './features/admin/components/KnowledgeBase';

import { dashboardApi } from './features/dashboard/api/dashboardApi';
import { getInitials, formatKES } from './utils/format';

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
  component: DashboardHome,
});

// ── Auth Routes ──────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: () => <AuthLayout initialView="login" />,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: () => <AuthLayout initialView="register" />,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: () => <AuthLayout initialView="forgot" />,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  component: () => <AuthLayout initialView="verify" />,
});

const verify2FARoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-2fa',
  component: () => <AuthLayout initialView="verify-2fa" />,
});

// ── Profile Routes ───────────────────────────────────────────────────────────
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const profileEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/edit',
  component: () => <ProfilePage defaultTab="profile" />,
});

const profileSecurityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/security',
  component: () => <ProfilePage defaultTab="security" />,
});

const profileNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/notifications',
  component: () => <ProfilePage defaultTab="notifications" />,
});

const profileSessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/sessions',
  component: () => <ProfilePage defaultTab="sessions" />,
});

const profileAppearanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/appearance',
  component: () => <ProfilePage defaultTab="appearance" />,
});

const profileDataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/data',
  component: () => <ProfilePage defaultTab="data" />,
});

const profileLimitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/limits',
  component: () => <ProfilePage defaultTab="limits" />,
});

const profileVerificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/verification',
  component: () => <ProfilePage defaultTab="profile" />,
});

const profileConnectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/connections',
  component: () => <Padded><ConnectionList /></Padded>,
});

const profileConnectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/connections/$connectionId',
  component: ConnectionDetail,
});

// Legacy settings/security aliases
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: () => <ProfilePage defaultTab="appearance" />,
});

const securityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/security',
  component: () => <ProfilePage defaultTab="security" />,
});

// ── Chama Routes ─────────────────────────────────────────────────────────────
const chamasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas',
  component: ChamaListPage,
});

const newChamaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/new',
  component: ChamaForm,
});

const chamaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId',
  component: ChamaDetail,
});

// Chama sub-routes — these render ChamaDetail with the correct active tab
function ChamaDetailWithTab({ tab }) {
  const { chamaId } = useParams({ strict: false });
  return <ChamaDetail defaultTab={tab} />;
}

const chamaMembersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/members',
  component: () => <ChamaDetailWithTab tab="members" />,
});

const chamaContributionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/contributions',
  component: () => <ChamaDetailWithTab tab="contributions" />,
});

const chamaLoansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/loans',
  component: () => <ChamaDetailWithTab tab="loans" />,
});

const chamaMeetingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/meetings',
  component: () => <ChamaDetailWithTab tab="meetings" />,
});

const chamaPollsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/polls',
  component: () => <ChamaDetailWithTab tab="polls" />,
});

const chamaContributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/contribute',
  component: RecordContribution,
});

const chamaBulkContributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/bulk-contribute',
  component: BulkContribution,
});

const chamaLoanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/loan',
  component: LoanApplication,
});

// ── Investment Routes ─────────────────────────────────────────────────────────
const investmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments',
  component: InvestmentDashboard,
});

const investmentsSaccosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos',
  component: () => <Padded><SACCOList /></Padded>,
});

const saccoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId',
  component: SACCODetail,
});

const buySharesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId/buy',
  component: BuySharesForm,
});

const investmentsSaccoSellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId/sell',
  component: LiquidityRequestForm,
});

const holdingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/holdings',
  component: () => <Padded><HoldingsList /></Padded>,
});

// Legacy alias
const holdingsLegacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/holdings',
  component: () => <Padded><HoldingsList /></Padded>,
});

const investmentsRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/requests',
  component: () => <Padded><MyRequestsList /></Padded>,
});

const investmentsSellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/sell',
  component: LiquidityRequestForm,
});

const opportunitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/opportunities',
  component: () => <Padded><OpportunityList /></Padded>,
});

const connectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/connections',
  component: () => <Padded><ConnectionList /></Padded>,
});

const connectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/connections/$connectionId',
  component: ConnectionDetail,
});

// ── Transaction Routes ────────────────────────────────────────────────────────
const activityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity',
  component: () => <Padded><TransactionList /></Padded>,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: () => <Padded><TransactionList /></Padded>,
});

const transactionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/$settlementId',
  component: TransactionDetail,
});

const transactionRaiseDisputeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/$settlementId/dispute',
  component: RaiseDisputeForm,
});

const disputeListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions/disputes',
  component: () => <Padded><DisputeList /></Padded>,
});

// Legacy alias
const disputeListLegacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes',
  component: () => <Padded><DisputeList /></Padded>,
});

const disputeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/disputes/$disputeId',
  component: DisputeDetail,
});

const ledgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ledger',
  component: () => <Padded><LedgerList /></Padded>,
});

const shareReceiptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/receipts/$receiptId',
  component: ShareReceipt,
});

// ── Notification Routes ───────────────────────────────────────────────────────
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => <Padded><NotificationList /></Padded>,
});

const notificationPreferencesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications/preferences',
  component: () => <ProfilePage defaultTab="notifications" />,
});

// ── Chat / Assistant Routes ───────────────────────────────────────────────────
const assistantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assistant',
  component: ChatScreen,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatScreen,
});

const chatSessionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$sessionId',
  component: ChatScreen,
});

// ── Help Route ────────────────────────────────────────────────────────────────
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help',
  component: HelpPage,
});

// ── Admin Routes ──────────────────────────────────────────────────────────────
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: UserList,
});

const adminUserDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users/$userId',
  component: UserDetail,
});

const adminSaccosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/saccos',
  component: SACCOManagement,
});

const adminSACCODetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/saccos/$saccoId',
  component: AdminSACCODetail,
});

const adminChamasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/chamas',
  component: ChamaOversight,
});

const adminDisputesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/disputes',
  component: AdminDisputeList,
});

const adminDisputeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/disputes/$disputeId',
  component: AdminDisputeDetail,
});

const adminFraudRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/fraud',
  component: FraudReview,
});

const adminEscrowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/escrow',
  component: EscrowManagement,
});

const adminAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/audit',
  component: AuditLog,
});

const adminWebhooksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/webhooks',
  component: WebhookManagement,
});

const adminLegalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/legal',
  component: LegalDocuments,
});

const adminReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/reports',
  component: Reports,
});

const adminDeletionRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/deletion-requests',
  component: DeletionRequests,
});

// Spec alias
const adminDeletionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/deletions',
  component: DeletionRequests,
});

const adminKnowledgeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/knowledge',
  component: KnowledgeBase,
});

// ── Catch-all 404 ─────────────────────────────────────────────────────────────
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: NotFound,
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
  settingsRoute,
  securityRoute,

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

  // Investments
  investmentsRoute,
  investmentsSaccosRoute,
  saccoDetailRoute,
  buySharesRoute,
  investmentsSaccoSellRoute,
  holdingsRoute,
  holdingsLegacyRoute,
  investmentsRequestsRoute,
  investmentsSellRoute,
  opportunitiesRoute,
  connectionsRoute,
  connectionDetailRoute,

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
  adminDeletionsRoute,
  adminKnowledgeRoute,

  // 404
  catchAllRoute,
]);

export const router = createRouter({ routeTree });