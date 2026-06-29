// src/features/transactions/components/TransactionDetail.jsx

import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, User, DollarSign, FileText,
  AlertCircle, RefreshCw, XCircle, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { transactionApi } from '../api/transactionApi';
import { formatKES, formatDate, formatDateTime } from '../../../utils/format';
import SettlementTimeline from './SettlementTimeline';

const statusConfig = {
  LEDGER_FINALIZED: { label: 'Completed', color: 'bg-success/10 text-success border border-success/20' },
  DISPUTED_MANUAL: { label: 'Disputed', color: 'bg-danger/10 text-danger border border-danger/20' },
  REVERSED: { label: 'Reversed', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
  COMPENSATING: { label: 'Reversing', color: 'bg-alert/10 text-alert border border-alert/20' },
};

export default function TransactionDetail() {
  const { settlementId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: settlement,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settlement', settlementId],
    queryFn: () =>
      transactionApi
        .getSettlementDetail(settlementId)
        .then((r) => r.data.data || r.data),
    enabled: !!settlementId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => transactionApi.cancelSettlement(settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlement', settlementId] });
      toast.success('Settlement cancelled');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to cancel settlement'
      );
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => transactionApi.retrySettlement(settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlement', settlementId] });
      toast.success('Settlement retry initiated');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to retry settlement'
      );
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load settlement" onRetry={refetch} />;
  if (!settlement) return <ErrorState message="Settlement not found" />;

  const currentState = settlement.state || settlement.status;
  const status = statusConfig[currentState] || {
    label: currentState,
    color: 'bg-gray-100 text-gray-500 border border-gray-200',
  };
  const isActive = !['LEDGER_FINALIZED', 'REVERSED', 'DISPUTED_MANUAL'].includes(currentState);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/transactions' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to transactions"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">
              Settlement #{settlement.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${status.color}`} variant="outline">
                {status.label}
              </Badge>
              <span className="text-xs text-gray-400 font-medium">
                {formatDate(settlement.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* SACCO & Share Details */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-terracotta" />
              SACCO & Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">SACCO</p>
                <p className="text-sm font-bold text-slate truncate">{settlement.sacco_name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Share Class</p>
                <p className="text-sm font-bold text-slate truncate">{settlement.share_class_name || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Quantity</p>
                <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {settlement.quantity?.toLocaleString()} shares
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Price per Share</p>
                <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(settlement.price_per_share)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <User className="h-4 w-4 text-terracotta" />
              Parties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="bg-sand-light/50 border border-sand/40 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Buyer</p>
                <p className="text-sm font-bold text-slate truncate">
                  {settlement.buyer_name || 'You'}
                </p>
                {settlement.buyer_role && (
                  <Badge className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold border-blue-500/20 bg-blue-500/10 text-blue-500 shadow-none capitalize" variant="outline">
                    {settlement.buyer_role}
                  </Badge>
                )}
              </div>
              <div className="bg-sand-light/50 border border-sand/40 rounded-xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Seller</p>
                <p className="text-sm font-bold text-slate truncate">
                  {settlement.seller_name || settlement.counterparty_name || 'Counterparty'}
                </p>
                {settlement.seller_role && (
                  <Badge className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-semibold border-terracotta/20 bg-terracotta/10 text-terracotta shadow-none capitalize" variant="outline">
                    {settlement.seller_role}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amount Breakdown */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-terracotta" />
              Amount Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Principal</span>
                <span className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(settlement.principal || settlement.total_value)}
                </span>
              </div>
              {settlement.fee != null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Transaction Fee</span>
                  <span className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatKES(settlement.fee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2.5 border-t border-sand/50">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Net Amount</span>
                <span className="text-base font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(settlement.net_amount || settlement.total_value)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <FileText className="h-4 w-4 text-terracotta" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SettlementTimeline
              settlementId={settlementId}
              currentState={currentState}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {isActive && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-sand hover:bg-sand-light text-slate cursor-pointer h-10 rounded-xl text-xs font-semibold"
              onClick={() => navigate({ to: `/transactions/${settlementId}/dispute` })}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Raise Dispute
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-sand hover:bg-danger/5 hover:text-danger text-slate cursor-pointer h-10 rounded-xl text-xs font-semibold"
              onClick={() => {
                if (window.confirm('Cancel this settlement?')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        )}

        {/* Retry for failed */}
        {currentState === 'REVERSED' && (
          <Button
            variant="outline"
            className="w-full border-sand hover:bg-sand-light text-slate cursor-pointer h-10 rounded-xl text-xs font-semibold"
            onClick={() => retryMutation.mutate()}
            disabled={retryMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Settlement
          </Button>
        )}
      </div>
    </div>
  );
}