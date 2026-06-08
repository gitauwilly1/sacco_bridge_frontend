import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function SettlementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['settlement', id],
    queryFn: async () => {
      const [detailRes, eventsRes] = await Promise.all([
        api.get(`/transactions/settlements/${id}/`),
        api.get(`/transactions/settlements/${id}/events/`),
      ]);
      return {
        detail: detailRes.data.data || detailRes.data,
        events: eventsRes.data.data || eventsRes.data,
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

  const { detail, events } = data;
  const eventList = Array.isArray(events) ? events : events?.results || [];

  const stateIcons = {
    LEDGER_FINALIZED: { icon: CheckCircle, color: 'text-success-600' },
    DISPUTED_MANUAL: { icon: AlertTriangle, color: 'text-alert-600' },
    REVERSED: { icon: XCircle, color: 'text-error-600' },
    COMPENSATING: { icon: Clock, color: 'text-alert-600' },
  };

  const defaultIcon = { icon: Clock, color: 'text-slate-400' };

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-lg font-heading font-semibold text-slate-800">Settlement Detail</h2>

      <div className="bg-white rounded-xl p-4 shadow-subtle space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Status</span>
          <span className="text-sm font-medium text-slate-800">{detail.state_display || detail.state}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">SACCO</span>
          <span className="text-sm font-medium text-slate-800">{detail.seller_sacco_name || detail.buyer_sacco_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Shares</span>
          <span className="text-sm font-numbers font-semibold text-slate-800">{detail.share_quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Price/Share</span>
          <span className="text-sm font-numbers font-semibold text-slate-800">KSh {parseFloat(detail.price_per_share || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Amount</span>
          <span className="text-sm font-numbers font-bold text-slate-800">KSh {parseInt(detail.amount || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Fee</span>
          <span className="text-sm font-numbers text-slate-800">KSh {parseFloat(detail.platform_fee || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-slate-500">Net</span>
          <span className="text-sm font-numbers font-bold text-terracotta-600">KSh {parseFloat(detail.net_seller_amount || 0).toFixed(2)}</span>
        </div>
        {detail.buyer_debit_ref && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Debit Ref</span>
            <span className="text-xs font-mono text-slate-600">{detail.buyer_debit_ref}</span>
          </div>
        )}
        {detail.seller_credit_ref && (
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Credit Ref</span>
            <span className="text-xs font-mono text-slate-600">{detail.seller_credit_ref}</span>
          </div>
        )}
      </div>

      {eventList.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-slate-800 text-sm mb-3">Timeline</h3>
          <div className="relative pl-6 border-l-2 border-sand-200 space-y-4">
            {eventList.map((event, i) => {
              const { icon: Icon, color } = stateIcons[event.to_state] || defaultIcon;
              return (
                <div key={i} className="relative">
                  <div className={`absolute -left-[25px] w-4 h-4 rounded-full ${color} bg-white border-2 flex items-center justify-center`}>
                    <Icon className="w-2.5 h-2.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {event.to_state_display || event.to_state}
                    </p>
                    <p className="text-xs text-slate-500">
                      {event.trigger_display || event.trigger} · {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}