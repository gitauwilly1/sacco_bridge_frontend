import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import {
  Users, Building2, HandCoins, AlertCircle,
  TrendingUp, Activity, ArrowRight, DollarSign,
  UserPlus, RefreshCw, BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';

/* ── Simple SVG Line Chart ────────────────────────────────────────── */
function SimpleLineChart({ data, width = 300, height = 96 }) {
  if (!data?.length) return null;
  const values = data.map((d) => Number(d.value ?? d.count ?? d));
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const stepX = width / (values.length - 1 || 1);

  const points = values.map((v, i) =>
    `${(i * stepX).toFixed(1)},${(height - ((v - min) / range) * (height - 8) - 4).toFixed(1)}`
  ).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
      <polyline fill="none" stroke="#C67B5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        points={points} className="animate-draw-path" />
      {values.map((v, i) => (
        <circle key={i} cx={(i * stepX).toFixed(1)} cy={(height - ((v - min) / range) * (height - 8) - 4).toFixed(1)}
          r="2.5" fill="#C67B5C" className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </svg>
  );
}

/* ── Simple SVG Bar Chart ─────────────────────────────────────────── */
function SimpleBarChart({ data, width = 300, height = 96 }) {
  if (!data?.length) return null;
  const values = data.map((d) => Number(d.value ?? d.amount ?? d));
  const max = Math.max(...values, 1);
  const barWidth = Math.max(4, (width / values.length) * 0.6);
  const gap = (width / values.length) * 0.4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24">
      {values.map((v, i) => {
        const barH = ((v / max) * (height - 12));
        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barH - 4;
        return (
          <rect key={i} x={x.toFixed(1)} y={y.toFixed(1)} width={barWidth.toFixed(1)}
            height={barH.toFixed(1)} rx="3" fill="#2D8B4E" className="animate-fade-up"
            style={{ animationDelay: `${i * 0.05}s` }} />
        );
      })}
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-sand bg-white shadow-subtle rounded-2xl">
            <CardContent className="p-4 space-y-2.5">
              <div className="skeleton-shimmer h-4 w-16 rounded" />
              <div className="skeleton-shimmer h-8 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-sand bg-white shadow-subtle rounded-2xl">
        <CardContent className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-shimmer h-12 w-full rounded-xl" />
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
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () =>
      adminApi.getPlatformAnalytics().then((r) => {
        const d = r.data.data || r.data;
        return {
          total_users: d.users?.total ?? d.summary?.total_users ?? d.total_users,
          active_chamas: d.chamas?.total_active ?? d.summary?.active_chamas ?? d.active_chamas,
          total_volume: d.settlements?.total_volume ?? d.summary?.total_volume ?? d.total_volume ?? '0',
          open_disputes: d.disputes?.open ?? d.summary?.open_disputes ?? d.open_disputes ?? 0,
          recent_activity: d.recent_activity || [],
          user_growth: d.user_growth || [],
          volume_trend: d.volume_trend || [],
          _raw: d,
        };
      }),
    refetchInterval: 30000,
  });

  const lastRefreshed = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })
    : null;

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
      color: analytics?.open_disputes > 0 ? 'text-danger' : 'text-slate/60',
      bg: analytics?.open_disputes > 0 ? 'bg-danger/10' : 'bg-sand-light',
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
            <Card key={stat.label} className="border-sand bg-white shadow-subtle rounded-2xl card-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  <div className={`h-8 w-8 rounded-full ${stat.bg} flex items-center justify-center shadow-subtle flex-shrink-0`}>
                    <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-xl font-extrabold text-slate font-numbers">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="border-sand bg-white shadow-subtle rounded-2xl">
        <CardHeader className="pb-2 border-b border-sand/40">
          <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.to}
                  variant="outline"
                  className="w-full flex items-center justify-start p-3 bg-white border border-sand/40 hover:border-terracotta/40 hover:bg-sand-light/10 card-lift rounded-xl text-xs font-bold text-slate transition-all cursor-pointer h-11"
                  onClick={() => navigate({ to: action.to })}
                >
                  <Icon className="h-4.5 w-4.5 mr-2 text-slate/50" />
                  {action.label}
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-terracotta" />
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth Sparkline */}
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {analytics?.user_growth?.length > 0 ? (
              <SimpleLineChart data={analytics.user_growth} />
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-gray-400">
                <TrendingUp className="h-5 w-5 mr-2 text-sand" />
                No growth data available
              </div>
            )}
            {lastRefreshed && (
              <p className="text-[10px] text-gray-400 mt-3 text-right">
                <RefreshCw className="h-3 w-3 inline mr-1" />
                Updated {lastRefreshed}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Volume Trend */}
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Volume Trend (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {analytics?.volume_trend?.length > 0 ? (
              <SimpleBarChart data={analytics.volume_trend} />
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-gray-400">
                <BarChart3 className="h-5 w-5 mr-2 text-sand" />
                No volume data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {analytics?.recent_activity?.length > 0 && (
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-terracotta" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-sand/40 pt-1">
            {analytics.recent_activity.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-center justify-between text-xs py-3.5"
              >
                <div>
                  <p className="font-bold text-slate">
                    {activity.action || activity.event}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">
                    {activity.description || activity.details}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400/90 font-medium font-numbers ml-3 flex-shrink-0">
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