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

/* ── Quick action definition ───────────────────────────────────────── */
const quickActions = [
  {
    id: 'contribute',
    label: 'Contribute',
    sublabel: 'Add funds',
    icon: Plus,
    path: '/chamas/contribute',
    color: 'bg-terracotta',
  },
  {
    id: 'loan',
    label: 'Request Loan',
    sublabel: 'Apply now',
    icon: HandCoins,
    path: '/chamas/loans',
    color: 'bg-success',
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

export default function DashboardHome() {
  const navigate = useNavigate();
  const { activeMode } = useUIStore();
  const { user } = useAuthStore();

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

  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">

      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div className="animate-fade-up">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-0.5">
          {getGreeting()}
        </p>
        <h1 className="text-2xl font-bold font-heading text-slate">
          {firstName}<span className="text-terracotta"> .</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-white/60 font-medium uppercase tracking-widest mb-1">
                  {activeMode === 'chama' ? 'Total Chama Savings' : 'Portfolio Value'}
                </p>
                <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(dashboardData?.summary?.total_savings || 0)}
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
                { label: 'Chamas', value: dashboardData?.summary?.total_chamas || 0, icon: Users },
                { label: 'Savings', value: formatKES(dashboardData?.summary?.total_savings || 0), icon: Wallet },
                { label: 'Settled', value: formatKES(dashboardData?.summary?.total_settlement_volume || 0), icon: ArrowUpRight },
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
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.id}
            id={`quick-action-${action.id}`}
            onClick={() => navigate({ to: action.path })}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-sand bg-white hover:border-terracotta/40 hover:bg-sand-light hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 active:scale-[0.97]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} shadow-sm`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate leading-tight">{action.label}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{action.sublabel}</p>
            </div>
          </button>
        ))}
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