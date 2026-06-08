import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowUp, ArrowDown, ArrowRight, Plus } from 'lucide-react';
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function InvestDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['invest-dashboard'],
    queryFn: async () => {
      const [holdingsRes, saccosRes, connectionsRes, analyticsRes] = await Promise.all([
        api.get('/investments/holdings/'),
        api.get('/investments/saccos/'),
        api.get('/investments/connections/'),
        api.get('/analytics/dashboard/user/'),
      ]);
      return {
        holdings: holdingsRes.data.data || [],
        saccos: saccosRes.data.data || [],
        connections: connectionsRes.data.data || [],
        analytics: analyticsRes.data.data,
      };
    },
  });

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const holdings = Array.isArray(data?.holdings) ? data.holdings : data?.holdings?.results || [];
  const saccos = Array.isArray(data?.saccos) ? data.saccos : data?.saccos?.results || [];
  const connections = Array.isArray(data?.connections) ? data.connections : data?.connections?.results || [];
  const analytics = data?.analytics || {};

  const totalValue = holdings.reduce(
    (sum, h) => sum + parseFloat(h.estimated_value || 0),
    0
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">
          Welcome, {user?.first_name || 'Investor'}
        </h2>
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-5 text-white shadow-medium">
        <p className="text-slate-300 text-xs font-medium uppercase tracking-wide">
          Portfolio Value
        </p>
        <p className="text-3xl font-numbers font-bold mt-1">
          KSh {totalValue.toLocaleString()}
        </p>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-slate-400 text-xs">Holdings</p>
            <p className="font-semibold">{holdings.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Active Orders</p>
            <p className="font-semibold">{connections.filter((c) => c.status !== 'SETTLED').length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Completed</p>
            <p className="font-semibold">{connections.filter((c) => c.status === 'SETTLED').length}</p>
          </div>
        </div>
      </div>

      {saccos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-heading font-semibold text-slate-700">
              Market Overview
            </h3>
            <button
              onClick={() => navigate('/saccos')}
              className="flex items-center gap-1 text-xs text-terracotta-600 hover:text-terracotta-700 font-medium"
            >
              See All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {saccos.slice(0, 5).map((sacco) => (
              <div
                key={sacco.id}
                onClick={() => navigate(`/saccos/${sacco.id}`)}
                className="min-w-[140px] bg-white rounded-xl p-3 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-success-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate">
                    {sacco.name}
                  </span>
                </div>
                <p className="font-numbers font-semibold text-slate-800">
                  KSh {parseFloat(sacco.estimated_share_value || 0).toFixed(0)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {sacco.dividend_rate}% dividend
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {connections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-heading font-semibold text-slate-700">
              Active Connections
            </h3>
            <button
              onClick={() => navigate('/connections')}
              className="flex items-center gap-1 text-xs text-terracotta-600 hover:text-terracotta-700 font-medium"
            >
              See All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {connections.filter((c) => c.status !== 'SETTLED').slice(0, 3).map((conn) => (
              <div
                key={conn.id}
                onClick={() => navigate(`/connections/${conn.id}`)}
                className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-semibold text-slate-800 text-sm">
                      {conn.sacco_name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {conn.status_display || conn.status}
                    </p>
                  </div>
                  {conn.total_amount && (
                    <p className="font-numbers font-semibold text-slate-700 text-sm">
                      KSh {parseInt(conn.total_amount).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/opportunities')}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        Browse Investment Opportunities
      </button>
    </div>
  );
}