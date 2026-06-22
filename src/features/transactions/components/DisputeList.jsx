import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle, CheckCircle2, Clock, ChevronRight,
  XCircle, FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { transactionApi } from '../api/transactionApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const disputeStatusConfig = {
  open: { label: 'Open', color: 'bg-danger/10 text-danger border border-danger/20', icon: AlertCircle },
  under_review: { label: 'Under Review', color: 'bg-alert/10 text-alert border border-alert/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success border border-success/20', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 border border-gray-200', icon: XCircle },
};

function DisputeCard({ dispute }) {
  const navigate = useNavigate();
  const status = disputeStatusConfig[dispute.status] || disputeStatusConfig.open;
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer border-sand shadow-subtle card-lift transition-all duration-200"
      onClick={() => navigate({ to: `/disputes/${dispute.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate truncate">
                {dispute.reason_display || dispute.reason}
              </h3>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${status.color}`} variant="outline">
                <StatusIcon className="h-3 w-3 mr-0.5" />
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Settlement #{dispute.settlement_id} · {dispute.sacco_name}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 bg-sand-light/50 p-2.5 rounded-xl border border-sand/40">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Amount</p>
            <p className="text-sm font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(dispute.settlement_amount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Filed</p>
            <p className="text-xs font-bold text-slate">
              {formatTimeAgo(dispute.created_at)}
            </p>
          </div>
        </div>

        {dispute.description && (
          <p className="text-xs text-gray-500 font-medium line-clamp-2">
            {dispute.description}
          </p>
        )}

        {dispute.resolution && (
          <div className="mt-3 bg-success/5 border border-success/20 rounded-xl p-2.5 text-xs">
            <span className="font-bold text-success">Resolution: </span>
            <span className="text-slate-dark/95 leading-relaxed">{dispute.resolution}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DisputeListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <div className="skeleton-shimmer h-4 w-36 rounded-lg" />
                  <div className="skeleton-shimmer h-4 w-16 rounded-full" />
                </div>
                <div className="skeleton-shimmer h-3 w-40 rounded" />
              </div>
              <div className="skeleton-shimmer h-4 w-4 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 bg-sand-light/50 p-2.5 rounded-xl border border-sand/40">
              <div className="space-y-1.5"><div className="skeleton-shimmer h-3 w-12 rounded" /><div className="skeleton-shimmer h-4 w-16 rounded" /></div>
              <div className="space-y-1.5"><div className="skeleton-shimmer h-3 w-12 rounded" /><div className="skeleton-shimmer h-4 w-16 rounded" /></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DisputeList() {
  const {
    data: disputesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-disputes'],
    queryFn: () =>
      transactionApi.getMyDisputes().then((r) => r.data),
  });

  const disputes = disputesData?.results || disputesData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-terracotta" />
        <h2 className="text-sm font-semibold text-slate">
          {disputes.length} Dispute{disputes.length !== 1 ? 's' : ''}
        </h2>
      </div>

      {isLoading ? (
        <DisputeListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load disputes" onRetry={refetch} />
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No disputes"
          description="Your filed disputes will appear here"
        />
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))}
        </div>
      )}
    </div>
  );
}