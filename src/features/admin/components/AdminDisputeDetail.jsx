import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, AlertCircle, CheckCircle2, RefreshCcw,
  Shield, XCircle, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatDate, formatDateTime } from '../../../utils/format';

const resolveActions = [
  {
    action: 'manual_credit',
    label: 'Manual Credit to Buyer',
    description: 'Credit the full amount to the buyer',
    icon: CheckCircle2,
    color: 'text-success',
  },
  {
    action: 'reversal',
    label: 'Reversal',
    description: 'Reverse the transaction and return funds',
    icon: RefreshCcw,
    color: 'text-alert',
  },
  {
    action: 'force_settle',
    label: 'Force Settle',
    description: 'Force the settlement to complete',
    icon: Shield,
    color: 'text-blue-500',
  },
  {
    action: 'trustee_close',
    label: 'Close by Trustee',
    description: 'Close the dispute without action',
    icon: XCircle,
    color: 'text-gray-500',
  },
];

export default function AdminDisputeDetail() {
  const { disputeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const {
    data: dispute,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-dispute', disputeId],
    queryFn: () =>
      adminApi
        .getDisputesAdmin({})
        .then((r) => {
          const disputes = r.data.results || r.data.data || [];
          return disputes.find((d) => d.id?.toString() === disputeId);
        }),
    enabled: !!disputeId,
  });

  const handleResolve = async () => {
    if (!selectedAction) {
      toast.error('Select a resolution action');
      return;
    }
    setIsResolving(true);
    try {
      await adminApi.resolveDispute(disputeId, {
        action: selectedAction,
        notes: resolutionNotes || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dispute', disputeId] });
      toast.success('Dispute resolved');
      navigate({ to: '/admin/disputes' });
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to resolve dispute'
      );
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load dispute" onRetry={refetch} />;
  if (!dispute) return <ErrorState message="Dispute not found" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate({ to: '/admin/disputes' })}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-sand bg-white/50 text-slate hover:bg-sand-light hover:text-terracotta transition-colors shadow-subtle"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate">
            Dispute #{dispute.id}
          </h1>
          <p className="text-sm text-gray-500">
            Settlement #{dispute.settlement_id}
          </p>
        </div>
      </div>

      {/* Dispute Info */}
      <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-sand/30 bg-sand-light/10">
          <CardTitle className="text-base text-slate font-bold">Dispute Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Reason</span>
            <span className="font-semibold text-slate">
              {dispute.reason_display || dispute.reason}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="font-bold text-terracotta">
              {formatKES(dispute.settlement_amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">SACCO</span>
            <span className="font-semibold text-slate">{dispute.sacco_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Filed</span>
            <span className="text-slate font-medium">{formatDate(dispute.created_at)}</span>
          </div>
          <div className="pt-4 border-t border-sand/30">
            <p className="text-xs font-semibold text-slate/70 mb-2">Description</p>
            <p className="text-sm text-slate bg-sand-light/20 p-3 rounded-lg border border-sand/30 leading-relaxed">{dispute.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Resolution */}
      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
        <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-sand/30 bg-sand-light/10">
            <CardTitle className="text-base text-slate font-bold">Resolve Dispute</CardTitle>
            <CardDescription className="text-xs text-gray-500">Choose a resolution action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resolveActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.action}
                    onClick={() => setSelectedAction(action.action)}
                    className={`text-left p-3.5 rounded-xl border transition-all duration-200 ${
                      selectedAction === action.action
                        ? 'border-terracotta bg-terracotta/5 shadow-subtle ring-1 ring-terracotta/30'
                        : 'border-sand hover:border-terracotta/50 bg-white/50 hover:bg-sand-light/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${action.color}`} />
                      <span className="text-sm font-semibold text-slate">
                        {action.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate/60 mt-1 ml-6 leading-normal">
                      {action.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <Textarea
              placeholder="Resolution notes (optional)..."
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="border-sand bg-white/50 focus:border-terracotta focus:ring-1 focus:ring-terracotta rounded-xl shadow-subtle transition-all mt-2"
            />

            <Button
              className="w-full bg-terracotta hover:bg-clay text-white shadow-subtle border-none rounded-xl font-semibold py-5 transition-all duration-200"
              onClick={handleResolve}
              disabled={!selectedAction || isResolving}
            >
              {isResolving ? 'Resolving...' : 'Confirm Resolution'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resolution Info */}
      {dispute.resolution && (
        <Card className="border border-success/30 bg-success/5 shadow-subtle rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-success/20 bg-success/10 p-4">
            <CardTitle className="text-base text-success flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm p-6 bg-white/30">
            <p className="text-slate font-medium leading-relaxed">{dispute.resolution}</p>
            {dispute.resolved_at && (
              <p className="text-xs text-gray-400">
                Resolved on {formatDateTime(dispute.resolved_at)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}