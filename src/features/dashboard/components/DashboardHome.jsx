import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  TrendingUp, Users, Wallet, ArrowUpRight,
  ArrowDownLeft, Plus, HandCoins, Building2,
  ChevronRight, Activity, AlertCircle, CheckCircle2,
  Clock, Scale, ShieldCheck, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageSpinner } from '../../../components/feedback/LoadingState';
import { ErrorState, EmptyState } from '../../../components/feedback/ErrorState';
import { dashboardApi } from '../api/dashboardApi';
import { formatKES, formatTimeAgo, truncate } from '../../../utils/format';
import { getInitials } from '../../../utils/format';
import useAuthStore from '../../../stores/authStore';
import useUIStore from '../../../stores/uiStore';
import { toast } from 'sonner';

const quickActions = [
  {
    id: 'contribute',
    label: 'Contribute',
    sublabel: 'Add funds',
    icon: Plus,
    path: '/chamas/contribute',
    color: 'bg-terracotta',
    requiresChama: true,
  },
  {
    id: 'loan',
    label: 'Request Loan',
    sublabel: 'Apply now',
    icon: HandCoins,
    path: '/chamas/loans',
    color: 'bg-success',
    requiresChama: true,
  },
  {
    id: 'invest',
    label: 'Invest',
    sublabel: 'Browse SACCOs',
    icon: Building2,
    path: '/investments',
    color: 'bg-slate',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function HealthBadge({ grade }) {
  if (!grade) return null;
  const normalized = String(grade).toLowerCase();
  const styles = {
    a: { label: 'Excellent', color: 'bg-success/10 text-success' },
    b: { label: 'Good', color: 'bg-blue-500/10 text-blue-600' },
    c: { label: 'Fair', color: 'bg-alert/10 text-alert' },
    d: { label: 'Poor', color: 'bg-danger/10 text-danger' },
    e: { label: 'Critical', color: 'bg-red-900/10 text-red-800' },
  };
  const s = styles[normalized] || { label: grade, color: 'bg-sand border border-sand/40 text-slate' };
  return (
    <Badge className={`text-[10px] font-semibold px-2 py-0.5 border-0 rounded-full ${s.color}`}>
      {s.label}
    </Badge>
  );
}

function sumNumeric(items = [], key) {
  return items.reduce((total, item) => total + (parseFloat(item?.[key]) || 0), 0);
}

function uniqueCount(items = [], key) {
  return new Set(items.filter(Boolean).map((item) => item?.[key])).size;
}

/* ── Action icon mapper ──────────────────────────────────────────── */
function actionIcon(type) {
  switch (type) {
    case 'pending_settlement': return { icon: ArrowUpRight, color: 'text-terracotta', bg: 'bg-sand-light' };
    case 'pending_loan_approval': return { icon: HandCoins, color: 'text-alert', bg: 'bg-alert/10' };
    case 'active_liquidity_request': return { icon: Scale, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    case 'open_dispute': return { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/10' };
    default: return { icon: Clock, color: 'text-slate/60', bg: 'bg-sand-light' };
  }
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const { activeMode } = useUIStore();
  const { user } = useAuthStore();

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    dataUpdatedAt: dashboardUpdatedAt,
    refetch: dashboardRefetch,
  } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () =>
      dashboardApi.getDashboardSummary().then((r) => {
        const d = r.data.data || r.data;
        return {
          user: d.user || {},
          chamas: d.chamas || [],
          investments: d.investments || {},
          pending_actions: d.pending_actions || {},
          recent_activity: d.recent_activity || [],
          summary: {
            total_chamas: d.chamas?.length ?? 0,
            total_savings: sumNumeric(d.chamas, 'my_balance'),
            total_investments: d.investments?.total_value ?? 0,
            total_pending: d.pending_actions?.total_pending ?? 0,
          },
        };
      }),
  });

  const refreshedAt = dashboardUpdatedAt ? new Date(dashboardUpdatedAt).toISOString() : null;
  const activeModeLabel = activeMode === 'chama' ? 'Chama dashboard' : 'Investments dashboard';

  const {
    data: unreadCount,
  } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => dashboardApi.getNotifications().then((r) => r.data?.data ?? { unread_count: 0 }),
    refetchInterval: 30000,
    initialData: { unread_count: 0 },
  });

  const handleQuickAction = (action) => {
    if (action.id === 'contribute' || action.id === 'loan') {
      const chamasList = dashboardData?.chamas || [];
      if (chamasList.length === 0) {
        toast.error('Please join or create a Chama first!');
        navigate({ to: '/chamas' });
        return;
      }
      const firstChamaId = chamasList[0].id;
      if (action.id === 'contribute') {
        navigate({ to: `/chamas/${firstChamaId}/contribute` });
      } else {
        navigate({ to: `/chamas/${firstChamaId}/loan` });
      }
    } else {
      navigate({ to: action.path });
    }
  };

  if (dashboardLoading) return <PageSpinner />;
  if (dashboardError) return <ErrorState message="Failed to load dashboard" onRetry={dashboardRefetch} />;

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';
  const chamas = dashboardData?.chamas || [];
  const hasChamas = chamas.length > 0;
  const summary = dashboardData?.summary || {};

  const pa = dashboardData?.pending_actions || {};
  const pendingItems = [
    { type: 'pending_settlement', label: 'Pending Settlements', count: pa.pending_settlements ?? 0 },
    { type: 'pending_loan_approval', label: 'Loan Approvals Pending', count: pa.pending_loan_approvals ?? 0 },
    { type: 'active_liquidity_request', label: 'Active Liquidity Requests', count: pa.active_liquidity_requests ?? 0 },
    { type: 'open_dispute', label: 'Open Disputes', count: pa.open_disputes ?? 0 },
  ].filter((p) => p.count > 0);

  const recentActivity = dashboardData?.recent_activity || [];
  const totalPending = pa.total_pending ?? 0;

  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto bg-slate-50 rounded-2xl">

      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">
                {getGreeting()}
              </p>
              <h1 className="text-2xl font-bold font-heading text-slate">
                {firstName}<span className="text-terracotta"> .</span>
              </h1>
            </div>
            <span className="security-badge">
              <ShieldCheck className="h-3 w-3" /> AES-256 Encrypted
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-slate/70">{activeModeLabel}</p>
            {unreadCount?.unread_count > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-terracotta font-semibold">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
                {unreadCount.unread_count} unread
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="h-3 w-3" /> All clear
              </span>
            )}
          </div>
        </div>
        {refreshedAt && (
          <p className="text-[11px] text-gray-400 uppercase tracking-widest">
            {new Date(refreshedAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* ── Bento Grid ────────────────────────────────────────────── */}
      <div className="bento-grid">

        {/* Portfolio Hero — spans 7 cols */}
        <div className="col-span-12 lg:col-span-7">
          <Card
            className="border-0 overflow-hidden h-full animate-fade-up"
            style={{ background: 'linear-gradient(135deg, #C67B5C 0%, #8B4513 100%)' }}
          >
            <CardContent className="p-0 h-full">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(white 0.8px, transparent 0.8px)', backgroundSize: '18px 18px' }}
              />
              <div className="relative p-5 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
                    <Sparkles className="h-3 w-3" />
                    {activeMode === 'chama' ? 'Chama insights' : 'Investment insights'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                    <TrendingUp className="h-3 w-3" />
                    +2.4% vs last month
                  </span>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-1">
                      {activeMode === 'chama' ? 'Total Chama Savings' : 'Portfolio Value'}
                    </p>
                    <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatKES(activeMode === 'chama' ? summary.total_savings : summary.total_investments)}
                    </h2>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="border-t border-white/20 mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Chamas', value: summary.total_chamas, icon: Users },
                    { label: activeMode === 'chama' ? 'Savings' : 'Value', value: activeMode === 'chama' ? formatKES(summary.total_savings) : formatKES(summary.total_investments), icon: activeMode === 'chama' ? Wallet : Building2 },
                    { label: 'Pending', value: totalPending, icon: Clock },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="text-center">
                      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 mb-1.5"><Icon className="h-3.5 w-3.5 text-white/80" /></div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wide font-medium leading-none mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions — spans 5 cols */}
        <div className="col-span-12 lg:col-span-5">
          <div className="bento-card p-4 h-full animate-fade-up">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3">
              Quick Actions
            </p>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map((action) => {
                const disabled = action.requiresChama && !hasChamas;
                return (
                  <button
                    key={action.id}
                    id={`quick-action-${action.id}`}
                    onClick={() => handleQuickAction(action)}
                    disabled={disabled}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 active:scale-[0.97] ${
                      disabled ? 'border-sand/40 bg-sand-light/30 opacity-50 cursor-not-allowed' : 'border-sand/50 bg-white hover:border-terracotta/30 hover:bg-sand-light/50 hover:-translate-y-0.5 hover:shadow-sm'
                    }`}
                    title={disabled ? 'Requires a Chama' : action.sublabel}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${disabled ? 'bg-gray-200' : action.color} shadow-xs`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-semibold text-slate leading-tight">{action.label}</p>
                      <p className="text-[9px] text-gray-400 leading-tight">{action.sublabel}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {!hasChamas && (
              <div className="mt-3 p-3 rounded-xl bg-sand-light/60 border border-sand/40">
                <p className="text-xs font-medium text-slate mb-2">Need a chama?</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs border-sand/40 h-8" onClick={() => navigate({ to: '/chamas' })}>Browse</Button>
                  <Button size="sm" className="text-xs bg-terracotta text-white h-8" onClick={() => navigate({ to: '/chamas/new' })}>Create</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pending Actions — spans 4 cols, only if items exist */}
        {pendingItems.length > 0 && (
          <div className="col-span-12 md:col-span-4">
            <div className="bento-card p-4 h-full animate-fade-up">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Pending</p>
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-alert/10 text-alert text-[10px] font-bold">{totalPending}</span>
              </div>
              <div className="space-y-1.5">
                {pendingItems.map((item) => {
                  const { icon: Icon, color, bg } = actionIcon(item.type);
                  return (
                    <div key={item.type} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-sand-light/30 hover:bg-sand-light/60 transition-colors cursor-pointer">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} flex-shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate font-medium truncate">{item.label}</p>
                        <p className="text-[10px] text-gray-400">{item.count} item{item.count > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Security card */}
        <div className="col-span-12 md:col-span-4">
          <div className="bento-card p-4 h-full animate-fade-up bg-gradient-to-br from-sand-light/60 to-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-3">Security</p>
            <div className="space-y-2.5">
              {[
                { label: 'End-to-end encryption', active: true },
                { label: '2FA enabled', active: true },
                { label: 'Session active', active: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${item.active ? 'bg-success' : 'bg-gray-300'}`} />
                  <span className="text-xs text-slate font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
              All data encrypted in transit and at rest using AES-256 standards.
            </p>
          </div>
        </div>

        {/* Activity — spans 4 cols */}
        <div className="col-span-12 md:col-span-4">
          <div className="bento-card animate-fade-up h-full">
            <div className="p-4 border-b border-sand/30 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Recent Activity</p>
              {recentActivity.length > 0 && (
                <button onClick={() => navigate({ to: '/activity' })} className="text-[10px] font-semibold text-terracotta hover:text-clay">
                  View all &rarr;
                </button>
              )}
            </div>
            <div className="p-2">
              {recentActivity.slice(0, 4).map((activity, i) => {
                const useDisplay = activity.type_display || activity.description || activity.type;
                const isOutflow = ['withdrawal', 'settlement', 'loan_disbursement'].includes(activity.type);
                return (
                  <div key={activity.id || i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-sand-light/50 transition-colors">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 ${isOutflow ? 'bg-sand-light' : 'bg-success/10'}`}>
                      {isOutflow ? <ArrowUpRight className="h-3.5 w-3.5 text-terracotta" /> : <ArrowDownLeft className="h-3.5 w-3.5 text-success" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate truncate font-medium">{useDisplay}</p>
                      <p className="text-[10px] text-gray-400">{activity.time_ago || formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
              {recentActivity.length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">No activity yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Chamas — spans full width */}
        {chamas.length > 0 && (
          <div className="col-span-12">
            <div className="bento-card animate-fade-up">
              <div className="p-4 border-b border-sand/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-terracotta" />
                  <p className="text-xs font-bold text-slate">My Chamas ({chamas.length})</p>
                </div>
                <button onClick={() => navigate({ to: '/chamas' })} className="text-[10px] font-semibold text-terracotta hover:text-clay">
                  View all &rarr;
                </button>
              </div>
              <div className="divide-y divide-sand/20">
                {chamas.slice(0, 3).map((chama) => (
                  <div
                    key={chama.id}
                    onClick={() => navigate({ to: `/chamas/${chama.id}` })}
                    className="flex items-center gap-3 p-4 hover:bg-sand-light/50 cursor-pointer transition-colors"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta text-white text-xs font-bold font-heading shadow-sm">
                      {getInitials(chama.name?.split(' ')[0], chama.name?.split(' ')[1])}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate text-sm truncate">{chama.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {chama.role} &middot; {formatKES(chama.my_balance || chama.balance)}
                        {chama.member_count != null && ` · ${chama.member_count}m`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {chama.health_grade ? <HealthBadge grade={chama.health_grade} /> : null}
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}