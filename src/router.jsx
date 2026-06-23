import { createRouter, createRoute, createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import App from './App';
import DashboardHome from './features/dashboard/components/DashboardHome';
import ProfilePage from './features/profile/components/ProfilePage';
import SACCOList from './features/investments/components/SACCOList';
import SACCODetail from './features/investments/components/SACCODetail';
import HoldingsList from './features/investments/components/HoldingsList';
import MyRequestsList from './features/investments/components/MyRequestsList';
import LiquidityRequestForm from './features/investments/components/LiquidityRequestForm';
import ChamaDetail from './features/chamas/components/ChamaDetail';
import ChamaForm from './features/chamas/components/ChamaForm';
import RecordContribution from './features/chamas/components/RecordContribution';

import { dashboardApi } from './features/dashboard/api/dashboardApi';
import { getInitials, formatKES } from './utils/format';

import AdminDashboard from './features/admin/components/AdminDashboard';
import UserList from './features/admin/components/UserList';
import UserDetail from './features/admin/components/UserDetail';
import SACCOManagement from './features/admin/components/SACCOManagement';
import ChamaOversight from './features/admin/components/ChamaOversight';
import AdminDisputeList from './features/admin/components/AdminDisputeList';
import AdminDisputeDetail from './features/admin/components/AdminDisputeDetail';
import FraudReview from './features/admin/components/FraudReview';
import EscrowManagement from './features/admin/components/EscrowManagement';
import AuditLog from './features/admin/components/AuditLog';
import WebhookManagement from './features/admin/components/WebhookManagement';
import LegalDocuments from './features/admin/components/LegalDocuments';
import Reports from './features/admin/components/Reports';

// Simple ChamaListPage rendered on /chamas path
function ChamaListPage() {
  const navigate = useNavigate();
  const { data: chamas, isLoading } = useQuery({
    queryKey: ['myChamasList'],
    queryFn: () => dashboardApi.getMyChamas().then((r) => r.data),
  });

  const chamasList = Array.isArray(chamas) ? chamas : (chamas?.data || []);

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
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
        <div className="text-gray-400 py-10 text-center">Loading chamas...</div>
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta text-white text-sm font-bold font-heading shadow-sm">
                  {getInitials(chama.name?.split(' ')[0], chama.name?.split(' ')[1])}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate text-sm truncate">{chama.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-normal">
                    {chama.role} &middot; {formatKES(chama.balance)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-10">No chamas found.</div>
      )}
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => <App />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardHome,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

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

const chamaContributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chamas/$chamaId/contribute',
  component: RecordContribution,
});

const investmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments',
  component: SACCOList,
});

const saccoDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId',
  component: SACCODetail,
});

const holdingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/holdings',
  component: HoldingsList,
});

const investmentsRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/requests',
  component: MyRequestsList,
});

const investmentsSellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/sell',
  component: LiquidityRequestForm,
});

const investmentsSaccoSellRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments/saccos/$saccoId/sell',
  component: LiquidityRequestForm,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: DashboardHome,
});

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

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: DashboardHome,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  chamasRoute,
  newChamaRoute,
  chamaDetailRoute,
  chamaContributeRoute,
  investmentsRoute,
  saccoDetailRoute,
  holdingsRoute,
  investmentsRequestsRoute,
  investmentsSellRoute,
  investmentsSaccoSellRoute,
  loginRoute,
  adminDashboardRoute,
  adminUsersRoute,
  adminUserDetailRoute,
  adminSaccosRoute,
  adminChamasRoute,
  adminDisputesRoute,
  adminDisputeDetailRoute,
  adminFraudRoute,
  adminEscrowRoute,
  adminAuditRoute,
  adminWebhooksRoute,
  adminLegalRoute,
  adminReportsRoute,
  catchAllRoute,
]);

export const router = createRouter({ routeTree });