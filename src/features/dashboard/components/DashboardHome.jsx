import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  TrendingUp, Users, Wallet, ArrowUpRight,
  ArrowDownLeft, Plus, HandCoins, Building2,
  ChevronRight, Activity,
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

/* ── Quick action definition ───────────────────────────────────────── */
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

/* ── Greeting helper ───────────────────────────────────────────────── */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function sumNumeric(items = [], key) {
  return items.reduce((total, item) => total + (parseFloat(item?.[key]) || 0), 0);
}

function uniqueCount(items = [], key) {
  return new Set(items.filter(Boolean).map((item) => item?.[key])).size;
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
    queryKey: ['dashboard'],
    queryFn: () =>
      dashboardApi.getUserDashboard().then((r) => {
        const d = r.data.data || r.data;
        return {
          chamas: d.chamas || [],
          holdings: d.holdings || [],
          recent_settlements: d.recent_settlements || [],
          summary: {
            total_chamas: d.summary?.total_chamas ?? d.total_chamas ?? 0,
            total_savings: d.summary?.total_savings ?? d.total_savings ?? 0,
            total_settlement_volume: d.summary?.total_settlement_volume ?? d.total_settlement_volume ?? 0,
          },
        };
      }),
  });

  const refreshedAt = dashboardUpdatedAt ? new Date(dashboardUpdatedAt).toISOString() : null;
  const activeModeLabel = activeMode === 'chama' ? 'Chama dashboard' : 'Investments dashboard';

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
  const holdings = dashboardData?.holdings || [];
  const recentSettlements = dashboardData?.recent_settlements || [];
  const hasChamas = chamas.length > 0;
  const portfolioValue = sumNumeric(holdings, 'estimated_value');
  const totalSACCOs = uniqueCount(holdings, 'sacco');
  const summary = {
    total_chamas: dashboardData?.summary?.total_chamas ?? chamas.length,
    total_savings: dashboardData?.summary?.total_savings ?? sumNumeric(chamas, 'balance'),
    total_settlement_volume:
      dashboardData?.summary?.total_settlement_volume ?? sumNumeric(recentSettlements, 'amount'),
    total_saccos: totalSACCOs,
    portfolio_value: portfolioValue,
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">

      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">
              {getGreeting()}
            </p>
            <h1 className="text-2xl font-bold font-heading text-slate">
              {firstName}<span className="text-terracotta"> .</span>
            </h1>
            <p className="text-xs text-slate/70 mt-1">
              {activeModeLabel}
            </p>
          </div>
          {refreshedAt && (
            <p className="text-[11px] text-gray-400 uppercase tracking-widest pl-2 border-l border-sand/30 sm:border-l-0 sm:pl-0">
              Refreshed: {new Date(refreshedAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-400 mt-3">
          {unreadCount?.unread_count > 0
            ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta animate-pulse" />
                You have{' '}
                <span className="text-terracotta font-semibold">{unreadCount.unread_count}</span>
                {' '}unread notification{unreadCount.unread_count > 1 ? 's' : ''}
              </span>
            )
            : 'Everything looks great today!'}
        </p>
      </div>

      {/* ── Portfolio Hero Card ────────────────────────────────────── */}
      <Card
        className="border-0 overflow-hidden shadow-terracotta animate-fade-up"
        style={{ background: 'linear-gradient(135deg, #C67B5C 0%, #8B4513 100%)' }}
      >
        <CardContent className="p-0">
          {/* Dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(white 0.8px, transparent 0.8px)',
              backgroundSize: '18px 18px',
            }}
          />
          <div className="relative p-5">
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/80">
                {activeMode === 'chama' ? 'Chama insights' : 'Investment insights'}
              </span>
            </div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-1">
                  {activeMode === 'chama' ? 'Total Chama Savings' : 'Portfolio Value'}
                </p>
                <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(activeMode === 'chama' ? summary.total_savings : summary.portfolio_value)}
                </h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/20 mb-4" />

            {/* 3-metric row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Chamas', value: summary.total_chamas, icon: Users },
                { label: activeMode === 'chama' ? 'Savings' : 'SACCOs', value: activeMode === 'chama' ? formatKES(summary.total_savings) : summary.total_saccos, icon: activeMode === 'chama' ? Wallet : Building2 },
                { label: activeMode === 'chama' ? 'Settled' : 'Portfolio', value: activeMode === 'chama' ? formatKES(summary.total_settlement_volume) : formatKES(summary.portfolio_value), icon: activeMode === 'chama' ? ArrowUpRight : ArrowDownLeft },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 mb-1.5">
                    <Icon className="h-3.5 w-3.5 text-white/80" />
                  </div>
                  <p className="text-[10px] text-white/50 uppercase tracking-wide font-medium leading-none mb-0.5">{label}</p>
                  <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-gray-400 mb-3">
          {hasChamas
            ? 'Pick an action to move your money forward.'
            : 'Join or create a Chama to unlock contribution and loan actions.'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const disabled = action.requiresChama && !hasChamas;
            return (
              <button
                key={action.id}
                id={`quick-action-${action.id}`}
                onClick={() => handleQuickAction(action)}
                disabled={disabled}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-sand bg-white transition-all duration-200 active:scale-[0.97] ${
                  disabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:border-terracotta/40 hover:bg-sand-light hover:-translate-y-0.5 hover:shadow-md'
                }`}
                title={disabled ? 'Requires a Chama to use this action' : action.sublabel}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} shadow-sm ${disabled ? 'bg-slate/30 text-slate/40' : ''}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate leading-tight">{action.label}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{action.sublabel}</p>
                </div>
              </button>
            );
          })}
        </div>

        {!hasChamas && (
          <div className="mt-4 rounded-2xl border border-sand bg-sand-light p-4 text-sm text-slate">
            <p className="font-medium text-slate mb-2">Need a place to start?</p>
            <p className="text-xs text-gray-500 mb-3">
              Create or browse Chamas to begin tracking contributions, loans, and group savings.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => navigate({ to: '/chamas' })}
              >
                Browse Chamas
              </Button>
              <Button
                className="w-full sm:w-auto bg-terracotta text-white hover:bg-clay"
                onClick={() => navigate({ to: '/chamas/new' })}
              >
                Create Chama
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── My Chamas ─────────────────────────────────────────────── */}
      {dashboardData?.chamas?.length > 0 && (
        <div>
          <div className="section-header">
            <h3 className="section-title">My Chamas</h3>
            <Button
              variant="ghost"
              size="sm"
              id="view-all-chamas-btn"
              className="text-terracotta hover:text-clay hover:bg-sand-light text-xs font-semibold"
              onClick={() => navigate({ to: '/chamas' })}
            >
              View All
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-2.5">
            {dashboardData.chamas.slice(0, 3).map((chama) => (
              <Card
                key={chama.id}
                id={`chama-card-${chama.id}`}
                className="cursor-pointer card-lift border-sand hover:border-terracotta/30"
                onClick={() => navigate({ to: `/chamas/${chama.id}` })}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {/* Chama avatar chip */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-terracotta text-white text-sm font-bold font-heading shadow-sm">
                    {getInitials(chama.name?.split(' ')[0], chama.name?.split(' ')[1])}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate text-sm truncate">{chama.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {chama.role} &middot; {formatKES(chama.balance)}
                    </p>
                  </div>

                  {/* Standing badge */}
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className="text-[10px] font-semibold px-2 py-0.5 bg-success/10 text-success border-0 rounded-full"
                    >
                      {chama.standing}
                    </Badge>
                  </div>

                  <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Activity ────────────────────────────────────────── */}
      <div>
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
          <Button
            variant="ghost"
            size="sm"
            id="view-all-activity-btn"
            className="text-terracotta hover:text-clay hover:bg-sand-light text-xs font-semibold"
            onClick={() => navigate({ to: '/activity' })}
          >
            View All
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>

        {activityLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : activityData?.data?.length > 0 ? (
          <div className="space-y-2">
            {activityData.data.slice(0, 5).map((activity) => {
              const isOutflow = activity.source === 'ACTIVITY';
              return (
                <Card
                  key={activity.id}
                  className={`border-sand border-l-2 transition-shadow hover:shadow-subtle ${
                    isOutflow ? 'border-l-terracotta' : 'border-l-success'
                  }`}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                      isOutflow ? 'bg-sand-light' : 'bg-success/10'
                    }`}>
                      {isOutflow ? (
                        <ArrowUpRight className="h-4 w-4 text-terracotta" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate truncate font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Your transactions and actions will appear here once you get started."
          />
        )}
      </div>
    </div>
  );
}
