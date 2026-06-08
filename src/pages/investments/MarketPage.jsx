import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function MarketPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['saccos-market'],
    queryFn: async () => {
      const { data } = await api.get('/investments/saccos/');
      return data.data || data;
    },
  });

  const saccos = Array.isArray(data) ? data : data?.results || [];

  const filteredSaccos = saccos.filter((sacco) => {
    const matchesSearch = sacco.name?.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || sacco.sasra_tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const tiers = ['ALL', 'TIER_1', 'TIER_2', 'TIER_3'];

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-heading font-semibold text-slate-800">SACCO Market</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SACCOs..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tiers.map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              tierFilter === tier
                ? 'bg-terracotta-500 text-white'
                : 'bg-white text-slate-600 border border-sand-200 hover:border-terracotta-300'
            }`}
          >
            {tier === 'ALL' ? 'All Tiers' : tier.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="space-y-3">
          {filteredSaccos.map((sacco) => (
            <div
              key={sacco.id}
              onClick={() => navigate(`/saccos/${sacco.id}`)}
              className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-sm">
                      {sacco.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        sacco.sasra_tier === 'TIER_1'
                          ? 'bg-success-50 text-success-700'
                          : sacco.sasra_tier === 'TIER_2'
                          ? 'bg-alert-50 text-alert-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sacco.sasra_tier?.replace('_', ' ') || 'Unrated'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {sacco.total_members?.toLocaleString()} members
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Dividend</p>
                  <p className="font-numbers font-semibold text-success-600 text-sm">
                    {sacco.dividend_rate || 0}%
                  </p>
                </div>
                <div className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Est. Price</p>
                  <p className="font-numbers font-semibold text-slate-800 text-sm">
                    KSh {parseFloat(sacco.estimated_share_value || 0).toFixed(0)}
                  </p>
                </div>
                <div className="bg-sand-50 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-500">Listings</p>
                  <p className="font-numbers font-semibold text-terracotta-600 text-sm">
                    {sacco.active_listings || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredSaccos.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No SACCOs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}