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
  open: { label: 'Open', color: 'bg-danger/10 text-danger border border-danger/20', icon: AlertCircle },
  under_review: { label: 'Under Review', color: 'bg-alert/10 text-alert border border-alert/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success border border-success/20', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-550 border border-gray-200', icon: CheckCircle2 },
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
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/disputes' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to disputes"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-heading text-slate leading-tight truncate">
              Dispute #{dispute.id}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${status.color}`} variant="outline">
                <StatusIcon className="h-3.5 w-3.5 mr-0.5" />
                {status.label}
              </Badge>
              <span className="text-xs text-gray-400 font-medium">
                {formatDate(dispute.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Settlement Reference */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">Settlement Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              className="w-full text-left bg-sand-light/50 border border-sand/40 hover:bg-sand-light hover:shadow-subtle rounded-xl p-3.5 transition-all text-xs font-medium cursor-pointer"
              onClick={() => navigate({ to: `/transactions/${dispute.settlement_id}` })}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Settlement ID</p>
                  <p className="text-sm font-bold text-terracotta">
                    #{dispute.settlement_id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Amount</p>
                  <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatKES(dispute.settlement_amount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">SACCO</p>
                  <p className="text-sm font-bold text-slate truncate">{dispute.sacco_name}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Details</p>
                    <p className="text-xs font-bold text-terracotta">View Transaction</p>
                  </div>
                  <p className="text-terracotta text-sm font-bold">→</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Dispute Reason */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-terracotta" />
              Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-bold text-slate mb-2">
              {dispute.reason_display || dispute.reason}
            </p>
            <p className="text-xs text-slate-dark/85 leading-relaxed bg-sand-light/30 border border-sand/40 rounded-xl p-3 font-medium">
              {dispute.description}
            </p>
          </CardContent>
        </Card>

        {/* Resolution */}
        {dispute.resolution && (
          <Card className="border-success/20 bg-success/5 text-success rounded-xl shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-success flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-slate-dark/90 leading-relaxed font-medium">{dispute.resolution}</p>
              <div className="pt-2 border-t border-success/15 flex items-center justify-between text-[10px] font-semibold text-success/80">
                {dispute.resolved_at && (
                  <span>
                    Resolved on {formatDate(dispute.resolved_at)}
                  </span>
                )}
                {dispute.resolved_by && (
                  <span>
                    by {dispute.resolved_by}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Updates/Timeline */}
        {dispute.updates?.length > 0 && (
          <Card className="border-sand bg-white shadow-subtle">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-terracotta" />
                Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {dispute.updates.map((update, index) => (
                <div
                  key={update.id || index}
                  className="border-l-2 border-terracotta/40 pl-3.5 py-0.5 space-y-1.5"
                >
                  <p className="text-xs text-slate font-medium leading-relaxed">{update.message || update.content}</p>
                  <p className="text-[10px] text-gray-400 font-semibold font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
          <Card className="border-blue-500/20 bg-blue-500/5 text-slate rounded-xl shadow-none">
            <CardContent className="p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs font-medium">
                <p className="font-bold text-slate">Awaiting Review</p>
                <p className="text-gray-500 mt-1 leading-relaxed">
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