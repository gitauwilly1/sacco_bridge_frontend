import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function OpportunitiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data } = await api.get('/investments/opportunities/');
      return data.data || data;
    },
  });

  const opportunities = Array.isArray(data) ? data : data?.results || [];

  const filtered = opportunities.filter((opp) => {
    const matchesSearch = opp.sacco_name?.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === 'ALL' || opp.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const interestMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/investments/opportunities/${id}/express_interest/`, {
        message: 'I am interested in purchasing these shares.',
      });
    },
    onSuccess: () => {
      queryClient.invalidationQueries({ queryKey: ['opportunities'] });
      queryClient.invalidationQueries({ queryKey: ['invest-dashboard'] });
    },
  });

  const urgencyConfig = {
    STANDARD: { label: 'Standard', color: 'text-success-600 bg-success-50' },
    PRIORITY: { label: 'Priority', color: 'text-alert-600 bg-alert-50' },
    URGENT: { label: 'Urgent', color: 'text-error-600 bg-error-50' },
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-heading font-semibold text-slate-800">Opportunities</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by SACCO name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['ALL', 'STANDARD', 'PRIORITY', 'URGENT'].map((u) => (
          <button
            key={u}
            onClick={() => setUrgencyFilter(u)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              urgencyFilter === u
                ? 'bg-terracotta-500 text-white'
                : 'bg-white text-slate-600 border border-sand-200 hover:border-terracotta-300'
            }`}
          >
            {u === 'ALL' ? 'All' : urgencyConfig[u]?.label || u}
          </button>
        ))}
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={<TrendingUp className="w-10 h-10 text-terracotta-500" />}
          title={search ? 'No matches found' : 'No opportunities'}
          description={search ? 'Try a different search term.' : 'Check back later for new liquidity requests.'}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((opp) => {
            const urgency = urgencyConfig[opp.urgency] || urgencyConfig.STANDARD;
            return (
              <div
                key={opp.id}
                className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-sm">
                      {opp.sacco_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {opp.share_quantity} shares available
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgency.color}`}>
                    {urgency.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-sand-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Est. Range</p>
                    <p className="font-numbers font-semibold text-slate-800 text-xs">
                      KSh {parseInt(opp.total_expected_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-sand-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Price/Share</p>
                    <p className="font-numbers font-semibold text-slate-800 text-xs">
                      KSh {parseFloat(opp.expected_price_per_share || 0).toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-sand-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-slate-500">Timeline</p>
                    <p className="font-numbers font-semibold text-slate-800 text-xs">
                      {opp.urgency === 'URGENT' ? '24h' : opp.urgency === 'PRIORITY' ? '48h' : '1 week'}
                    </p>
                  </div>
                </div>

                {opp.notes && (
                  <p className="text-xs text-slate-500 mb-3 italic">"{opp.notes}"</p>
                )}

                <button
                  onClick={() => interestMutation.mutate(opp.id)}
                  disabled={interestMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  {interestMutation.isPending ? 'Sending...' : 'Express Interest'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}