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
  open: { label: 'Open', color: 'bg-danger/10 text-danger', icon: AlertCircle },
  under_review: { label: 'Under Review', color: 'bg-alert/10 text-alert', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-200 text-gray-600', icon: XCircle },
};

function DisputeCard({ dispute }) {
  const navigate = useNavigate();
  const status = disputeStatusConfig[dispute.status] || disputeStatusConfig.open;
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/disputes/${dispute.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate">
                {dispute.reason_display || dispute.reason}
              </h3>
              <Badge className={status.color} variant="outline">
                <StatusIcon className="h-3 w-3 mr-0.5" />
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Settlement #{dispute.settlement_id} · {dispute.sacco_name}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-semibold text-terracotta">
              {formatKES(dispute.settlement_amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Filed</p>
            <p className="text-sm text-slate">
              {formatTimeAgo(dispute.created_at)}
            </p>
          </div>
        </div>

        {dispute.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {dispute.description}
          </p>
        )}

        {dispute.resolution && (
          <div className="mt-2 bg-success/5 rounded p-2 text-xs">
            <span className="font-medium text-success">Resolution: </span>
            <span className="text-gray-600">{dispute.resolution}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DisputeListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-32 mb-3" />
            <Skeleton className="h-4 w-24" />
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
        <div className="space-y-2">
          {disputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))}
        </div>
      )}
    </div>
  );
}