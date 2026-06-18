import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight,
  ArrowDownLeft, Plus, HandCoins, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSpinner } from '../../../components/feedback/LoadingState';
import { ErrorState, EmptyState } from '../../../components/feedback/ErrorState';
import { dashboardApi } from '../api/dashboardApi';
import { formatKES, formatTimeAgo, truncate } from '../../../utils/format';
import useUIStore from '../../../stores/uiStore';

export default function DashboardHome() {
  const navigate = useNavigate();
  const { activeMode } = useUIStore();

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getUserDashboard().then((r) => r.data.data),
  });

  const {
    data: activityData,
    isLoading: activityLoading,
  } = useQuery({
    queryKey: ['activity'],
    queryFn: () => dashboardApi.getRecentActivity({ days: 7 }).then((r) => r.data),
  });

  const {
    data: unreadCount,
  } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => dashboardApi.getNotifications().then((r) => r.data.data),
    refetchInterval: 30000,
  });

  if (dashboardLoading) return <PageSpinner />;
  if (dashboardError) return <ErrorState message="Failed to load dashboard" />;

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate">
          {activeMode === 'chama' ? 'My Chamas' : 'My Portfolio'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {unreadCount?.unread_count > 0
            ? `You have ${unreadCount.unread_count} unread notifications`
            : 'Everything looks great!'}
        </p>
      </div>

      {/* Portfolio Summary Card */}
      <Card className="bg-gradient-to-br from-terracotta to-clay text-white border-0">
        <CardContent className="p-6">
          <p className="text-sm text-white/80 mb-1">Total Portfolio Value</p>
          <h2 className="text-3xl font-bold mb-4">
            {formatKES(dashboardData?.summary?.total_savings || 0)}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/60">Chamas</p>
              <p className="text-lg font-semibold">{dashboardData?.summary?.total_chamas || 0}</p>
            </div>
            <div>
              <p className="text-xs text-white/60">Savings</p>
              <p className="text-lg font-semibold">
                {formatKES(dashboardData?.summary?.total_savings || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/60">Settlements</p>
              <p className="text-lg font-semibold">
                {formatKES(dashboardData?.summary?.total_settlement_volume || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate({ to: '/chamas/contribute' })}
        >
          <Plus className="h-5 w-5 text-terracotta" />
          <span className="text-xs">Contribute</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate({ to: '/chamas/loans' })}
        >
          <HandCoins className="h-5 w-5 text-terracotta" />
          <span className="text-xs">Request Loan</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          onClick={() => navigate({ to: '/investments' })}
        >
          <Building2 className="h-5 w-5 text-terracotta" />
          <span className="text-xs">Invest</span>
        </Button>
      </div>

      {/* Chamas Section */}
      {dashboardData?.chamas?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate">My Chamas</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-terracotta"
              onClick={() => navigate({ to: '/chamas' })}
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {dashboardData.chamas.slice(0, 3).map((chama) => (
              <Card
                key={chama.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate({ to: `/chamas/${chama.id}` })}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate">{chama.name}</p>
                    <p className="text-sm text-gray-500">
                      {chama.role} · Balance: {formatKES(chama.balance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success">
                      Score: {chama.standing}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate">Recent Activity</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-terracotta"
            onClick={() => navigate({ to: '/activity' })}
          >
            View All
          </Button>
        </div>

        {activityLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : activityData?.data?.length > 0 ? (
          <div className="space-y-2">
            {activityData.data.slice(0, 5).map((activity) => (
              <Card key={activity.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.source === 'ACTIVITY' ? 'bg-sand-light' : 'bg-blue-50'
                  }`}>
                    {activity.source === 'ACTIVITY' ? (
                      <ArrowUpRight className="h-4 w-4 text-terracotta" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Your transactions and actions will appear here."
          />
        )}
      </div>
    </div>
  );
}