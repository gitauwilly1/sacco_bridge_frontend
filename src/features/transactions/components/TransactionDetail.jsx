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
  LEDGER_FINALIZED: { label: 'Completed', color: 'bg-success/10 text-success' },
  DISPUTED_MANUAL: { label: 'Disputed', color: 'bg-danger/10 text-danger' },
  REVERSED: { label: 'Reversed', color: 'bg-gray-200 text-gray-600' },
  COMPENSATING: { label: 'Reversing', color: 'bg-alert/10 text-alert' },
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
  const status = statusConfig[currentState];
  const isActive = !['LEDGER_FINALIZED', 'REVERSED', 'DISPUTED_MANUAL'].includes(currentState);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/transactions' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">
              Settlement #{settlement.id}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {status && (
                <Badge className={status.color} variant="outline">
                  {status.label}
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(settlement.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* SACCO & Share Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-terracotta" />
              SACCO & Shares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">SACCO</p>
                <p className="font-semibold text-slate">{settlement.sacco_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Share Class</p>
                <p className="font-semibold text-slate">{settlement.share_class_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-semibold text-slate">
                  {settlement.quantity?.toLocaleString()} shares
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price per Share</p>
                <p className="font-semibold text-slate">
                  {formatKES(settlement.price_per_share)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-terracotta" />
              Parties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-sand-light rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Buyer</p>
                <p className="font-semibold text-slate">
                  {settlement.buyer_name || 'You'}
                </p>
                {settlement.buyer_role && (
                  <Badge className="mt-1" variant="outline">
                    {settlement.buyer_role}
                  </Badge>
                )}
              </div>
              <div className="bg-sand-light rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Seller</p>
                <p className="font-semibold text-slate">
                  {settlement.seller_name || settlement.counterparty_name || 'Counterparty'}
                </p>
                {settlement.seller_role && (
                  <Badge className="mt-1" variant="outline">
                    {settlement.seller_role}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amount Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-terracotta" />
              Amount Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Principal</span>
                <span className="font-semibold text-slate">
                  {formatKES(settlement.principal || settlement.total_value)}
                </span>
              </div>
              {settlement.fee != null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Fee</span>
                  <span className="font-semibold text-slate">
                    {formatKES(settlement.fee)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500">Net Amount</span>
                <span className="font-semibold text-terracotta text-lg">
                  {formatKES(settlement.net_amount || settlement.total_value)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate({ to: `/transactions/${settlementId}/dispute` })}
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Raise Dispute
            </Button>
            <Button
              variant="outline"
              className="flex-1"
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
            className="w-full"
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