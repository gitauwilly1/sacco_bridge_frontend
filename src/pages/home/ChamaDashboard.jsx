import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, Wallet, Landmark, Calendar, ArrowRight } from 'lucide-react';
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function ChamaDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chama-dashboard'],
    queryFn: async () => {
      const [chamasRes, analyticsRes] = await Promise.all([
        api.get('/chamas/'),
        api.get('/analytics/dashboard/user/'),
      ]);
      return {
        chamas: chamasRes.data,
        analytics: analyticsRes.data.data,
      };
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const chamas = Array.isArray(data?.chamas?.data)
    ? data.chamas.data
    : data?.chamas?.data?.results || [];
  const analytics = data?.analytics || {};

  if (chamas.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-10 h-10 text-terracotta-500" />}
        title="No chamas yet"
        description="Create or join a chama to start tracking your group savings digitally."
        actionLabel="Create Your First Chama"
        onAction={() => navigate('/chamas/new')}
      />
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">
          Welcome, {user?.first_name || 'Member'}
        </h2>
      </div>

      <div className="bg-gradient-to-br from-terracotta-500 to-clay-700 rounded-xl p-5 text-white shadow-terracotta">
        <p className="text-sand-200 text-xs font-medium uppercase tracking-wide">
          Total Savings
        </p>
        <p className="text-3xl font-numbers font-bold mt-1">
          {analytics.total_savings || 'KSh 0'}
        </p>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-sand-300 text-xs">Chamas</p>
            <p className="font-semibold">{analytics.total_chamas || 0}</p>
          </div>
          <div>
            <p className="text-sand-300 text-xs">Active Loans</p>
            <p className="font-semibold">{analytics.active_loans || 0}</p>
          </div>
          <div>
            <p className="text-sand-300 text-xs">Members</p>
            <p className="font-semibold">{analytics.total_members || 0}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { icon: Wallet, label: 'Contribute', path: '/contribute' },
          { icon: Landmark, label: 'Request Loan', path: '/loans/new' },
          { icon: Calendar, label: 'Meetings', path: '/chamas' },
          { icon: Users, label: 'Members', path: '/chamas' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-1.5 min-w-[72px] p-3 bg-white rounded-xl shadow-subtle hover:shadow-medium transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-sand-100 flex items-center justify-center">
              <action.icon className="w-5 h-5 text-terracotta-600" />
            </div>
            <span className="text-xs font-medium text-slate-600">{action.label}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-heading font-semibold text-slate-700">
            My Chamas
          </h3>
          <button
            onClick={() => navigate('/chamas')}
            className="flex items-center gap-1 text-xs text-terracotta-600 hover:text-terracotta-700 font-medium"
          >
            See All
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {chamas.slice(0, 3).map((chama) => (
            <div
              key={chama.id}
              onClick={() => navigate(`/chamas/${chama.id}`)}
              className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-semibold text-slate-800 text-sm">
                    {chama.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {chama.member_count || 0} members
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-numbers font-semibold text-slate-700 text-sm">
                    KSh {parseInt(chama.total_savings || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">total saved</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {analytics.recent_contributions?.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-slate-700 mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {analytics.recent_contributions.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-subtle"
              >
                <div className="w-2 h-2 rounded-full bg-success-500" />
                <div className="flex-1">
                  <p className="text-xs text-slate-700">{item.description}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                </div>
                <p className="text-xs font-numbers font-medium text-success-600">
                  {item.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}