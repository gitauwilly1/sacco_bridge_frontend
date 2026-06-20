import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, Building2, HandCoins, AlertCircle,
  TrendingUp, Activity, ArrowRight, DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () =>
      adminApi.getPlatformAnalytics().then((r) => r.data.data || r.data),
  });

  if (isLoading) return <DashboardSkeleton />;
  if (error) {
    return <ErrorState message="Failed to load analytics" onRetry={refetch} />;
  }

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.total_users?.toLocaleString() || '—',
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Chamas',
      value: analytics?.active_chamas?.toLocaleString() || '—',
      icon: HandCoins,
      color: 'text-terracotta',
      bg: 'bg-terracotta/10',
    },
    {
      label: 'Total Volume',
      value: formatKES(analytics?.total_volume || 0),
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Open Disputes',
      value: analytics?.open_disputes?.toLocaleString() || '0',
      icon: AlertCircle,
      color: analytics?.open_disputes > 0 ? 'text-danger' : 'text-gray-500',
      bg: analytics?.open_disputes > 0 ? 'bg-danger/10' : 'bg-gray-100',
    },
  ];

  const quickActions = [
    { label: 'Manage Users', to: '/admin/users', icon: Users },
    { label: 'Review Disputes', to: '/admin/disputes', icon: AlertCircle },
    { label: 'Verify SACCOs', to: '/admin/saccos', icon: Building2 },
    { label: 'View Audit Log', to: '/admin/audit', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-slate">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.to}
                  variant="outline"
                  className="justify-start"
                  onClick={() => navigate({ to: action.to })}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {analytics?.recent_activity?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-terracotta" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analytics.recent_activity.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate">
                    {activity.action || activity.event}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.description || activity.details}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatTimeAgo(activity.timestamp || activity.created_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}