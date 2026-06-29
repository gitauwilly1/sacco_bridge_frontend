import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, DollarSign, Clock, CheckCircle2, XCircle, Users,
  AlertCircle, Calendar, Building2, TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatDate, formatDateTime } from '../../../utils/format';

const requestStatusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  matched: { label: 'Matched', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Users },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-400 border-gray-200', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-alert/10 text-alert border-alert/20', icon: Clock },
  completed: { label: 'Completed', color: 'bg-terracotta/10 text-terracotta border-terracotta/20', icon: CheckCircle2 },
};

export default function RequestDetail() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['request', requestId],
    queryFn: () =>
      investmentsApi.getRequestDetail(requestId).then((r) => r.data.data || r.data),
    enabled: !!requestId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => investmentsApi.cancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      toast.success('Request cancelled');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to cancel request');
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load request" onRetry={refetch} />;
  if (!request) return <ErrorState message="Request not found" />;

  const status = requestStatusConfig[request.status] || requestStatusConfig.active;
  const StatusIcon = status.icon;
  const totalValue = (request.quantity || 0) * (request.price_per_share || 0);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/investments/requests' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to requests"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Request Details</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
              #{request.id} � {request.sacco_name}
            </p>
          </div>
          {request.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              className="border-danger/30 text-danger hover:bg-danger/5 text-xs font-bold h-8"
              onClick={() => {
                if (window.confirm('Cancel this liquidity request?')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Status Banner */}
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${status.color}`}>
          <StatusIcon className="h-6 w-6" />
          <div>
            <p className="font-bold text-sm">{status.label}</p>
            <p className="text-xs opacity-75 mt-0.5">
              {request.status === 'active' && 'Waiting for a buyer to match'}
              {request.status === 'matched' && 'Buyer found \u2014 interested'}
              {request.status === 'completed' && 'Sale completed successfully'}
              {request.status === 'cancelled' && 'You cancelled this request'}
              {request.status === 'expired' && 'This request has expired'}
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-3 border-b border-sand">
            <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-terracotta" />
              Liquidity Request Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">SACCO</span>
              <span className="font-semibold text-slate">{request.sacco_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Share Class</span>
              <span className="font-semibold text-slate">{request.share_class_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quantity</span>
              <span className="font-bold text-slate font-numbers">{request.quantity?.toLocaleString()} shares</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per Share</span>
              <span className="font-bold text-slate font-numbers">{formatKES(request.price_per_share)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-sand/30">
              <span className="text-gray-400 font-semibold">Total Value</span>
              <span className="font-extrabold text-terracotta font-numbers text-base">{formatKES(totalValue)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline / Details */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-3 border-b border-sand">
            <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate/60" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Created</span>
              <span className="font-medium text-slate">{formatDateTime(request.created_at)}</span>
            </div>
            {request.updated_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last Updated</span>
                <span className="font-medium text-slate">{formatDateTime(request.updated_at)}</span>
              </div>
            )}
            {request.expires_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Expires</span>
                <span className="font-medium text-slate">{formatDate(request.expires_at)}</span>
              </div>
            )}
            {request.urgency && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Urgency</span>
                <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-full border-0">
                  {request.urgency}
                </Badge>
              </div>
            )}
            {request.interested_buyers > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Interested Buyers</span>
                <span className="font-semibold text-slate flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {request.interested_buyers}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {request.notes && (
          <Card className="border-sand bg-white shadow-subtle">
            <CardHeader className="pb-3 border-b border-sand">
              <CardTitle className="text-sm font-bold text-slate">Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-slate leading-relaxed">{request.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}