import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  DollarSign, Clock, CheckCircle2, XCircle, Users,
  ChevronRight, Plus, RefreshCw, AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const requestStatusConfig = {
  active: {
    label: 'Active',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
  },
  matched: {
    label: 'Matched',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Users,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-200 text-gray-600 border-gray-300',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    color: 'bg-alert/10 text-alert border-alert/20',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-terracotta/10 text-terracotta border-terracotta/20',
    icon: CheckCircle2,
  },
};

function RequestCard({ request }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = requestStatusConfig[request.status] || requestStatusConfig.active;
  const StatusIcon = status.icon;

  const cancelMutation = useMutation({
    mutationFn: () => investmentsApi.cancelRequest(request.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      toast.success('Request cancelled');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to cancel request'
      );
    },
  });

  const handleCancel = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this request?')) {
      cancelMutation.mutate();
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/investments/requests/${request.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate">
                {request.sacco_name}
              </h3>
              <Badge className={status.color} variant="outline">
                <StatusIcon className="h-3 w-3 mr-0.5" />
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{request.share_class_name}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="text-sm font-semibold text-slate">
              {request.quantity?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-sm font-semibold text-slate">
              {formatKES(request.price_per_share)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-semibold text-terracotta">
              {formatKES((request.quantity || 0) * (request.price_per_share || 0))}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {request.interested_buyers > 0 ? (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {request.interested_buyers} interested buyer
                {request.interested_buyers !== 1 ? 's' : ''}
              </span>
            ) : (
              formatTimeAgo(request.created_at)
            )}
          </span>
          {request.status === 'active' && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-danger h-auto p-0"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MyRequestsListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MyRequestsList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');

  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-requests', page, status],
    queryFn: () =>
      investmentsApi
        .getMyRequests({
          page,
          page_size: 10,
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
  });

  const requests = requestsData?.results || requestsData?.data || [];
  const total = requestsData?.count || requests.length;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {isLoading ? '...' : `${total} Request${total !== 1 ? 's' : ''}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-md px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/investments/sell' })}
          >
            <Plus className="h-3 w-3 mr-1" /> New
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <MyRequestsListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load requests" onRetry={refetch} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No requests yet"
          description="Create a liquidity request to sell your shares"
          action={
            <Button onClick={() => navigate({ to: '/investments/sell' })}>
              <Plus className="h-4 w-4 mr-2" />
              Sell Shares
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}