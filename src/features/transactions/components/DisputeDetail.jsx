import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, AlertCircle, Clock, CheckCircle2,
  Building2, User, FileText, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { transactionApi } from '../api/transactionApi';
import { formatKES, formatDate, formatDateTime } from '../../../utils/format';

const disputeStatusConfig = {
  open: { label: 'Open', color: 'bg-danger/10 text-danger', icon: AlertCircle },
  under_review: { label: 'Under Review', color: 'bg-alert/10 text-alert', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-200 text-gray-600', icon: CheckCircle2 },
};

export default function DisputeDetail() {
  const { disputeId } = useParams();
  const navigate = useNavigate();

  const {
    data: dispute,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: () =>
      transactionApi
        .getDisputeDetail(disputeId)
        .then((r) => r.data.data || r.data),
    enabled: !!disputeId,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load dispute" onRetry={refetch} />;
  if (!dispute) return <ErrorState message="Dispute not found" />;

  const status = disputeStatusConfig[dispute.status] || disputeStatusConfig.open;
  const StatusIcon = status.icon;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/disputes' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">
              Dispute #{dispute.id}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={status.color} variant="outline">
                <StatusIcon className="h-3 w-3 mr-0.5" />
                {status.label}
              </Badge>
              <span className="text-xs text-gray-500">
                {formatDate(dispute.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Settlement Reference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Settlement Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              className="w-full text-left"
              onClick={() => navigate({ to: `/transactions/${dispute.settlement_id}` })}
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Settlement ID</p>
                  <p className="font-semibold text-terracotta">
                    #{dispute.settlement_id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-semibold text-slate">
                    {formatKES(dispute.settlement_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">SACCO</p>
                  <p className="font-semibold text-slate">{dispute.sacco_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">View</p>
                  <p className="text-terracotta text-sm">→</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Dispute Reason */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-terracotta" />
              Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-slate mb-2">
              {dispute.reason_display || dispute.reason}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {dispute.description}
            </p>
          </CardContent>
        </Card>

        {/* Resolution */}
        {dispute.resolution && (
          <Card className="border-success/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{dispute.resolution}</p>
              {dispute.resolved_at && (
                <p className="text-xs text-gray-400 mt-2">
                  Resolved on {formatDate(dispute.resolved_at)}
                </p>
              )}
              {dispute.resolved_by && (
                <p className="text-xs text-gray-400">
                  by {dispute.resolved_by}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Updates/Timeline */}
        {dispute.updates?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-terracotta" />
                Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dispute.updates.map((update, index) => (
                <div
                  key={update.id || index}
                  className="border-l-2 border-gray-200 pl-3 py-1"
                >
                  <p className="text-sm text-gray-600">{update.message || update.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDateTime(update.created_at)}
                    {update.author && ` · ${update.author}`}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Status Info */}
        {dispute.status === 'open' && (
          <Card className="bg-blue-50 border-0">
            <CardContent className="p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate">Awaiting Review</p>
                <p className="text-xs text-gray-600 mt-1">
                  A trustee will review your dispute. You'll be notified when there's an update.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}