import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Building2, Users, Wallet, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function SaccoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sacco', id],
    queryFn: async () => {
      const [saccoRes, classesRes] = await Promise.all([
        api.get(`/investments/saccos/${id}/`),
        api.get(`/investments/saccos/${id}/share_classes/`),
      ]);
      return {
        sacco: saccoRes.data.data || saccoRes.data,
        shareClasses: classesRes.data.data || classesRes.data,
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="skeleton h-6 w-32" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const { sacco, shareClasses } = data;
  const classes = Array.isArray(shareClasses) ? shareClasses : shareClasses?.results || [];

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-5 text-white shadow-medium">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">{sacco.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              sacco.sasra_tier === 'TIER_1'
                ? 'bg-success-500/30 text-white'
                : sacco.sasra_tier === 'TIER_2'
                ? 'bg-alert-500/30 text-white'
                : 'bg-white/20 text-white'
            }`}>
              {sacco.sasra_tier?.replace('_', ' ') || 'Unrated'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-slate-300 text-xs">Assets</p>
            <p className="font-numbers font-semibold text-sm">
              KSh {(parseFloat(sacco.total_assets || 0) / 1e9).toFixed(1)}B
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-xs">Members</p>
            <p className="font-numbers font-semibold text-sm">
              {sacco.total_members?.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-xs">Dividend</p>
            <p className="font-numbers font-semibold text-success-400 text-sm">
              {sacco.dividend_rate}%
            </p>
          </div>
        </div>
      </div>

      {sacco.description && (
        <div className="bg-white rounded-xl p-4 shadow-subtle">
          <h3 className="font-heading font-semibold text-slate-800 text-sm mb-2">About</h3>
          <p className="text-sm text-slate-600">{sacco.description}</p>
        </div>
      )}

      {classes.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-slate-800 text-sm mb-3">Share Classes</h3>
          <div className="space-y-2">
            {classes.map((sc) => (
              <div key={sc.id} className="bg-white rounded-xl p-4 shadow-subtle">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading font-semibold text-slate-800 text-sm">
                    {sc.share_class_display || sc.share_class}
                  </h4>
                  <span className="text-xs text-slate-500">
                    Nominal: KSh {sc.nominal_value}
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  {sc.dividend_eligible && (
                    <span className="flex items-center gap-1 text-success-600">
                      <ArrowUp className="w-3 h-3" /> Dividends
                    </span>
                  )}
                  {sc.voting_rights && (
                    <span className="flex items-center gap-1 text-terracotta-600">
                      <Users className="w-3 h-3" /> Voting Rights
                    </span>
                  )}
                  {sc.is_transferable && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3 h-3" /> Transferable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/requests/new')}
          className="flex-1 py-3 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 transition-all duration-200 text-sm"
        >
          Sell Shares
        </button>
        <button
          onClick={() => navigate('/opportunities')}
          className="flex-1 py-3 bg-white border-2 border-terracotta-500 text-terracotta-600 font-medium rounded-xl hover:bg-terracotta-50 transition-all duration-200 text-sm"
        >
          Browse Sellers
        </button>
      </div>
    </div>
  );
}