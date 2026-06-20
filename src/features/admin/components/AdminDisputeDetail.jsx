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
        <button onClick={() => navigate({ to: '/admin/disputes' })}>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dispute Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Reason</span>
            <span className="font-semibold text-slate">
              {dispute.reason_display || dispute.reason}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold text-terracotta">
              {formatKES(dispute.settlement_amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">SACCO</span>
            <span className="font-semibold text-slate">{dispute.sacco_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Filed</span>
            <span className="text-slate">{formatDate(dispute.created_at)}</span>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm text-slate">{dispute.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Resolution */}
      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolve Dispute</CardTitle>
            <CardDescription>Choose a resolution action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {resolveActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.action}
                    onClick={() => setSelectedAction(action.action)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedAction === action.action
                        ? 'border-terracotta bg-terracotta/5'
                        : 'border-gray-200 hover:border-terracotta/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${action.color}`} />
                      <span className="text-sm font-medium text-slate">
                        {action.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
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
            />

            <Button
              className="w-full"
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
        <Card className="border-success/30">
          <CardHeader>
            <CardTitle className="text-base text-success flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-slate">{dispute.resolution}</p>
            {dispute.resolved_at && (
              <p className="text-xs text-gray-500">
                {formatDateTime(dispute.resolved_at)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}