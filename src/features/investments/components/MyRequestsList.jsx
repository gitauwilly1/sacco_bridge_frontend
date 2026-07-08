import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  DollarSign, Clock, CheckCircle2, XCircle, Users,
  ChevronRight, Plus, RefreshCw, Edit, Save,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState, EmptyState } from '@/components/feedback';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const requestStatusConfig = {
  active: {
    label: 'Active',
    color: 'bg-success/10 text-success border border-success/20',
    icon: CheckCircle2,
  },
  matched: {
    label: 'Matched',
    color: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: Users,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-400 border border-gray-200',
    icon: XCircle,
  },
  expired: {
    label: 'Expired',
    color: 'bg-alert/10 text-alert border border-alert/20',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-terracotta/10 text-terracotta border border-terracotta/20',
    icon: CheckCircle2,
  },
};

function RequestCard({ request }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(request.quantity?.toString() || '');
  const [editPrice, setEditPrice] = useState(request.price_per_share?.toString() || '');
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

  const updateMutation = useMutation({
    mutationFn: (data) => investmentsApi.updateRequest(request.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      setEditing(false);
      toast.success('Request updated');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to update request'
      );
    },
  });

  const handleCancel = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this request?')) {
      cancelMutation.mutate();
    }
  };

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    const qty = parseInt(editQuantity, 10);
    const price = parseFloat(editPrice);
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    if (!price || price <= 0) { toast.error('Enter a valid price'); return; }
    updateMutation.mutate({ quantity: qty, price_per_share: price });
  };

  const handleCardClick = (e) => {
    if (editing) return;
    navigate({ to: `/investments/requests/${request.id}` });
  };

  return (
    <Card
      className={`${editing ? '' : 'cursor-pointer'} border-sand shadow-subtle card-lift transition-all duration-200`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-sm font-bold text-slate truncate">
                {request.sacco_name}
              </h3>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-0.5" />
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-medium">{request.share_class_name}</p>
          </div>
          {!editing && <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />}
        </div>

        {editing ? (
          <div className="space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate uppercase tracking-wider">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="border-sand focus-visible:ring-terracotta text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold text-slate uppercase tracking-wider">Price per Share (KES)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="border-sand focus-visible:ring-terracotta text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                className="bg-terracotta hover:bg-clay text-white text-xs font-semibold"
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
              >
                <Save className="h-3 w-3 mr-1" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-sand text-slate text-xs font-semibold"
                onClick={(e) => { e.stopPropagation(); setEditing(false); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 mb-3.5 pt-1">
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Quantity</p>
              <p className="text-sm font-bold text-slate font-numbers mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {request.quantity?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Price</p>
              <p className="text-sm font-bold text-slate font-numbers mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatKES(request.price_per_share)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total</p>
              <p className="text-sm font-extrabold text-terracotta font-numbers mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatKES((request.quantity || 0) * (request.price_per_share || 0))}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs pt-3.5 border-t border-sand/40 font-medium">
          <span className="text-gray-400">
            {request.interested_buyers > 0 ? (
              <span className="flex items-center gap-1 text-slate font-semibold">
                <Users className="h-3.5 w-3.5" />
                {request.interested_buyers} interested buyer{request.interested_buyers !== 1 ? 's' : ''}
              </span>
            ) : (
              formatTimeAgo(request.created_at)
            )}
          </span>
          <div className="flex items-center gap-2">
            {request.status === 'active' && !editing && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-slate font-bold h-auto p-0 hover:bg-transparent hover:text-terracotta"
                  onClick={(e) => { e.stopPropagation(); setEditQuantity(request.quantity?.toString() || ''); setEditPrice(request.price_per_share?.toString() || ''); setEditing(true); }}
                >
                  <Edit className="h-3 w-3 mr-0.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-danger font-bold h-auto p-0 hover:bg-transparent hover:text-danger/80"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  Cancel Request
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MyRequestsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4 space-y-3">
            <div className="skeleton-shimmer h-5 w-40 rounded-lg" />
            <div className="grid grid-cols-3 gap-2">
              <div className="skeleton-shimmer h-4 w-16 rounded" />
              <div className="skeleton-shimmer h-4 w-16 rounded" />
              <div className="skeleton-shimmer h-4 w-16 rounded" />
            </div>
            <div className="skeleton-shimmer h-3.5 w-24 rounded mt-1" />
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
            className="text-xs border border-input rounded-lg px-2.5 py-1.5 bg-white text-slate font-medium outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="matched">Matched</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            size="sm"
            className="bg-terracotta hover:bg-clay text-white shadow-sm transition-all duration-150 active:scale-[0.98]"
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
            <Button
              className="bg-terracotta hover:bg-clay text-white shadow-sm transition-all"
              onClick={() => navigate({ to: '/investments/sell' })}
            >
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
                className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
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