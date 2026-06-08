import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function LiquidityRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-liquidity-requests'],
    queryFn: async () => {
      const { data } = await api.get('/investments/requests/');
      return data.data || data;
    },
  });

  const requests = Array.isArray(data) ? data : data?.results || [];

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/investments/requests/${id}/cancel/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-liquidity-requests'] });
      queryClient.invalidateQueries({ queryKey: ['invest-dashboard'] });
    },
  });

  const statusConfig = {
    ACTIVE: { icon: Clock, color: 'text-alert-600 bg-alert-50', label: 'Active' },
    MATCHED: { icon: CheckCircle, color: 'text-terracotta-600 bg-terracotta-50', label: 'Matched' },
    IN_NEGOTIATION: { icon: Clock, color: 'text-alert-600 bg-alert-50', label: 'Negotiating' },
    ACCEPTED: { icon: CheckCircle, color: 'text-success-600 bg-success-50', label: 'Accepted' },
    SETTLED: { icon: CheckCircle, color: 'text-success-600 bg-success-50', label: 'Settled' },
    CANCELLED: { icon: XCircle, color: 'text-slate-500 bg-slate-100', label: 'Cancelled' },
    EXPIRED: { icon: XCircle, color: 'text-slate-500 bg-slate-100', label: 'Expired' },
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">My Requests</h2>
        <Link
          to="/requests/new"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta"
        >
          <Plus className="w-4 h-4" /> New
        </Link>
      </div>

      {isLoading && <ListSkeleton rows={4} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && requests.length === 0 && (
        <EmptyState
          icon={<Clock className="w-10 h-10 text-terracotta-500" />}
          title="No liquidity requests"
          description="Create a request to sell your SACCO shares and access funds when you need them."
          actionLabel="Create Request"
          onAction={() => navigate('/requests/new')}
        />
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <div className="space-y-2">
          {requests.map((req) => {
            const status = statusConfig[req.status] || statusConfig.ACTIVE;
            const StatusIcon = status.icon;
            return (
              <div
                key={req.id}
                className="bg-white rounded-xl p-4 shadow-subtle"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{status.label}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {req.urgency_display || req.urgency}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-sm">
                      {req.sacco_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {req.share_quantity} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-numbers font-semibold text-slate-700 text-sm">
                      KSh {parseInt(req.total_expected_value || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {req.buyer_interest_count || 0} interested
                    </p>
                  </div>
                </div>

                {(req.status === 'ACTIVE' || req.status === 'MATCHED') && (
                  <button
                    onClick={() => cancelMutation.mutate(req.id)}
                    disabled={cancelMutation.isPending}
                    className="w-full py-2 text-sm text-error-600 border border-error-200 rounded-lg hover:bg-error-50 transition-colors disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                )}

                {req.status === 'MATCHED' && (
                  <Link
                    to={`/connections`}
                    className="block w-full mt-2 py-2 text-center text-sm text-terracotta-600 border border-terracotta-200 rounded-lg hover:bg-terracotta-50 transition-colors"
                  >
                    View Interested Buyers
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}