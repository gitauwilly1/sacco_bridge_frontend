import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, Building2, HandCoins, AlertCircle,
  TrendingUp, Activity, ArrowRight, DollarSign,
  UserPlus, RefreshCw, BarChart3, Smartphone, Database,
  CheckCircle2, XCircle, ShieldCheck, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartWrapper from '../../../components/charts/ChartWrapper';

/* ── Recharts Line Chart ──────────────────────────────────────────── */
function SimpleLineChart({ data }) {
  if (!data?.length) return null;
  const chartData = data.map((d) => ({ label: d.date || d.period || d.label || '', value: Number(d.value ?? d.count ?? d) }));
  return (
    <ChartWrapper>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCCC" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#A18E7B' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#A18E7B' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8DCCC' }} />
        <Line type="monotone" dataKey="value" stroke="#C67B5C" strokeWidth={2} dot={{ r: 2.5, fill: '#C67B5C' }} activeDot={{ r: 4 }} />
      </LineChart>
    </ChartWrapper>
  );
}

/* ── Recharts Bar Chart ───────────────────────────────────────────── */
function SimpleBarChart({ data }) {
  if (!data?.length) return null;
  const chartData = data.map((d) => ({ label: d.date || d.period || d.label || '', value: Number(d.value ?? d.amount ?? d) }));
  return (
    <ChartWrapper>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCCC" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#A18E7B' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#A18E7B' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8DCCC' }} />
        <Bar dataKey="value" fill="#2D8B4E" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartWrapper>
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
  const queryClient = useQueryClient();

  /* ── Rich overview stats ────────────────────────────────────────── */
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: overviewRefetch,
  } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () =>
      adminApi.getAdminOverview().then((r) => {
        const d = r.data.data || r.data;
        return {
          users: d.users || {},
          chamas: d.chamas || {},
          saccos: d.saccos || {},
          settlements: d.settlements || {},
          mpesa: d.mpesa || {},
          disputes: d.disputes || {},
          generated_at: d.generated_at,
        };
      }),
    refetchInterval: 30000,
  });

  /* ── Trend data for charts ──────────────────────────────────────── */
  const {
    data: trends,
  } = useQuery({
    queryKey: ['admin-trends'],
    queryFn: () =>
      adminApi.getPlatformAnalytics().then((r) => {
        const d = r.data.data || r.data;
        return {
          user_growth: d.trends?.user_growth || d.user_growth || [],
          settlement_volume: d.trends?.settlement_volume || d.volume_trend || [],
        };
      }),
    refetchInterval: 60000,
  });

  /* ── System health ──────────────────────────────────────────────── */
  const {
    data: health,
  } = useQuery({
    queryKey: ['admin-health'],
    queryFn: () =>
      adminApi.getAdminHealth().then((r) => r.data.data || r.data),
    refetchInterval: 120000,
  });

  /* ── Export handler ─────────────────────────────────────────────── */
  const handleExport = async () => {
    try {
      const res = await adminApi.getAdminExport({ type: 'overview' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  /* ── Refresh mutation ───────────────────────────────────────────── */
  const refreshMutation = useMutation({
    mutationFn: () => adminApi.refreshAnalytics(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trends'] });
      queryClient.invalidateQueries({ queryKey: ['admin-health'] });
      toast.success('Analytics refreshed');
    },
    onError: () => toast.error('Failed to refresh analytics'),
  });

  if (overviewLoading) return <DashboardSkeleton />;
  if (overviewError) {
    return <ErrorState message="Failed to load analytics" onRetry={overviewRefetch} />;
  }

  const u = overview?.users || {};
  const c = overview?.chamas || {};
  const s = overview?.saccos || {};
  const st = overview?.settlements || {};
  const mp = overview?.mpesa || {};
  const dp = overview?.disputes || {};

  const statCards = [
    {
      label: 'Total Users',
      value: u.total?.toLocaleString() || '—',
      sub: `${u.new_this_month || 0} new this month`,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Chamas',
      value: c.total_active?.toLocaleString() || '—',
      sub: `KES ${formatKES(c.total_savings)} saved`,
      icon: HandCoins,
      color: 'text-terracotta',
      bg: 'bg-terracotta/10',
    },
    {
      label: 'Total Volume',
      value: formatKES(st.total_volume || 0),
      sub: `${st.completed || 0} completed settlements`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Open Disputes',
      value: dp.open?.toLocaleString() || '0',
      sub: `${st.disputed || 0} total disputed`,
      icon: AlertCircle,
      color: dp.open > 0 ? 'text-danger' : 'text-slate/60',
      bg: dp.open > 0 ? 'bg-danger/10' : 'bg-sand-light',
    },
  ];

  const secondaryStats = [
    {
      label: 'Verified Users',
      value: u.verified?.toLocaleString() || '—',
      icon: CheckCircle2,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Active SACCOs',
      value: s.total_active?.toLocaleString() || '—',
      sub: `${s.active_liquidity_requests || 0} liquidity requests`,
      icon: Building2,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      label: 'M-Pesa Volume',
      value: formatKES(mp.total_volume || 0),
      sub: `${mp.completed_transactions || 0} transactions`,
      icon: Smartphone,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
    },
    {
      label: 'Fees Collected',
      value: formatKES(st.total_fees_collected || 0),
      icon: DollarSign,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  const healthServices = health?.services;
  const serviceIcons = { database: Database, redis: RefreshCw, celery: Activity, disk: BarChart3 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs border-sand/40"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="text-xs border-sand/40"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Stats Grid — Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bento-card p-4 card-lift">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                <div className={`h-8 w-8 rounded-full ${stat.bg} flex items-center justify-center shadow-subtle flex-shrink-0`}>
                  <Icon className={`h-4.5 w-4.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl font-extrabold text-slate font-numbers">{stat.value}</p>
              <div className="flex items-center gap-2 mt-1">
                {stat.sub && <p className="text-[10px] text-gray-400 font-medium">{stat.sub}</p>}
                <span className="insight-chip up">
                  <TrendingUp className="h-2.5 w-2.5" /> +12%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bento-card p-3 flex items-center gap-3 card-lift">
              <div className={`h-8 w-8 rounded-full ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate">{stat.value}</p>
                <p className="text-[10px] text-gray-400 font-medium">{stat.sub || stat.label}</p>
              </div>
            </div>
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
            {[
              { label: 'Manage Users', to: '/admin/users', icon: Users },
              { label: 'Review Disputes', to: '/admin/disputes', icon: AlertCircle },
              { label: 'Verify SACCOs', to: '/admin/saccos', icon: Building2 },
              { label: 'View Audit Log', to: '/admin/audit', icon: Activity },
            ].map((action) => {
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
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {trends?.user_growth?.length > 0 ? (
              <SimpleLineChart data={trends.user_growth} />
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-gray-400">
                <TrendingUp className="h-5 w-5 mr-2 text-sand" />
                No growth data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Settlement Volume (30d)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {trends?.settlement_volume?.length > 0 ? (
              <SimpleBarChart data={trends.settlement_volume} />
            ) : (
              <div className="h-32 flex items-center justify-center text-xs text-gray-400">
                <BarChart3 className="h-5 w-5 mr-2 text-sand" />
                No volume data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      {healthServices && (
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(healthServices).map(([name, svc]) => {
                const Icon = serviceIcons[name] || Activity;
                const isOk = svc?.status === 'ok';
                return (
                  <div key={name} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-sand-light/50">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isOk ? 'bg-success/10' : 'bg-danger/10'}`}>
                      <Icon className={`h-4 w-4 ${isOk ? 'text-success' : 'text-danger'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate capitalize">{name}</p>
                      <p className="text-[10px] text-gray-400">{isOk ? 'Healthy' : svc.status || 'Unknown'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {health?.app && (
              <p className="text-[10px] text-gray-400 mt-3 text-right">
                v{health.app.version} &middot; {health.app.environment}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Platform Summary — Chamas */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-sand bg-white shadow-subtle rounded-2xl">
            <CardHeader className="pb-2 border-b border-sand/40">
              <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
                <HandCoins className="h-4 w-4 text-terracotta" />
                Chamas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-slate">{c.total_active?.toLocaleString() || '0'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Active Chamas</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-success">{formatKES(c.total_savings || 0)}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Total Savings</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-blue-500">{c.total_loans?.toLocaleString() || '—'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Total Loans</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-slate">{c.total?.toLocaleString() || c.total_active?.toLocaleString() || '—'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Registered Chamas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sand bg-white shadow-subtle rounded-2xl">
            <CardHeader className="pb-2 border-b border-sand/40">
              <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Investments
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-slate">{formatKES(st.total_volume || 0)}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Total Volume</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-success">{st.completed?.toLocaleString() || '0'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Completed</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-alert">{st.disputed?.toLocaleString() || '0'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Disputed</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/40">
                  <p className="text-lg font-extrabold font-numbers text-amber-500">{formatKES(st.total_fees_collected || 0)}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Fees Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}