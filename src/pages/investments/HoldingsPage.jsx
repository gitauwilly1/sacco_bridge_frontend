import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function HoldingsPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-holdings'],
    queryFn: async () => {
      const { data } = await api.get('/investments/holdings/');
      return data.data || data;
    },
  });

  const holdings = Array.isArray(data) ? data : data?.results || [];

  const totalValue = holdings.reduce(
    (sum, h) => sum + parseFloat(h.estimated_value || 0),
    0
  );

  if (isLoading) return <div className="px-4 py-4"><ListSkeleton rows={4} /></div>;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-heading font-semibold text-slate-800">My Holdings</h2>

      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-5 text-white shadow-medium">
        <p className="text-slate-300 text-xs font-medium uppercase tracking-wide">Total Portfolio Value</p>
        <p className="text-3xl font-numbers font-bold mt-1">
          KSh {totalValue.toLocaleString()}
        </p>
        <div className="flex gap-4 mt-3">
          <div>
            <p className="text-slate-400 text-xs">SACCOs</p>
            <p className="font-semibold">{holdings.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Available</p>
            <p className="font-semibold">
              {holdings.filter((h) => parseFloat(h.available_shares) > 0).length}
            </p>
          </div>
        </div>
      </div>

      {holdings.length === 0 ? (
        <EmptyState
          icon={<Wallet className="w-10 h-10 text-terracotta-500" />}
          title="No holdings yet"
          description="Browse SACCOs and purchase shares to start building your cooperative portfolio."
          actionLabel="Browse SACCOs"
          onAction={() => navigate('/saccos')}
        />
      ) : (
        <div className="space-y-2">
          {holdings.map((holding) => (
            <Link
              key={holding.id}
              to={`/saccos/${holding.sacco}`}
              className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 block"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-slate-800 text-sm">
                    {holding.sacco_name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {holding.share_class_name || 'Shares'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="font-numbers font-semibold text-slate-800 text-sm">
                    {parseFloat(holding.total_shares || 0).toFixed(0)}
                  </p>
                </div>
                <div className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Available</p>
                  <p className="font-numbers font-semibold text-success-600 text-sm">
                    {parseFloat(holding.available_shares || 0).toFixed(0)}
                  </p>
                </div>
                <div className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Est. Value</p>
                  <p className="font-numbers font-semibold text-terracotta-600 text-sm">
                    KSh {parseFloat(holding.estimated_value || 0).toFixed(0)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/saccos')}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta"
      >
        <Plus className="w-4 h-4" />
        Browse SACCOs
      </button>
    </div>
  );
}