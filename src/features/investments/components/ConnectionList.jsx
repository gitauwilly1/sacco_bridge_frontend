import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, ChevronRight, MessageSquare, Clock,
  RefreshCw, ArrowRightLeft, UserCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const roleConfig = {
  buyer: { label: 'Buying', color: 'bg-blue-500/10 text-blue-500' },
  seller: { label: 'Selling', color: 'bg-terracotta/10 text-terracotta' },
};

const connectionStatusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success' },
  settled: { label: 'Settled', color: 'bg-gray-200 text-gray-600' },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger' },
};

function ConnectionCard({ connection }) {
  const navigate = useNavigate();
  const role = roleConfig[connection.my_role] || roleConfig.buyer;
  const status = connectionStatusConfig[connection.status] || connectionStatusConfig.active;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/investments/connections/${connection.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate truncate">
                {connection.counterparty_name || 'Member'}
              </h3>
              <Badge className={role.color} variant="outline">
                {role.label}
              </Badge>
              <Badge className={status.color} variant="outline">
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {connection.sacco_name} · {connection.share_class_name}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="text-sm font-semibold text-slate">
              {connection.quantity?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Offer</p>
            <p className="text-sm font-semibold text-terracotta">
              {connection.last_offer_price
                ? formatKES(connection.last_offer_price)
                : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            {connection.unread_messages > 0 && (
              <Badge className="bg-danger/10 text-danger text-[10px]">
                {connection.unread_messages} new
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {connection.last_message_at
                ? formatTimeAgo(connection.last_message_at)
                : formatTimeAgo(connection.created_at)}
            </span>
          </div>
          {connection.pending_offer && (
            <Badge className="bg-alert/10 text-alert text-xs">
              Offer pending
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectionListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-3 w-32 mb-3" />
            <div className="grid grid-cols-2 gap-2 mb-3">
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

export default function ConnectionList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');

  const {
    data: connectionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-connections', page, status],
    queryFn: () =>
      investmentsApi
        .getMyConnections({
          page,
          page_size: 10,
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
  });

  const connections = connectionsData?.results || connectionsData?.data || [];
  const total = connectionsData?.count || connections.length;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {isLoading ? '...' : `${total} Connection${total !== 1 ? 's' : ''}`}
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
            <option value="settled">Settled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <ConnectionListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load connections" onRetry={refetch} />
      ) : connections.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No connections yet"
          description="Express interest in shares to start a connection"
        />
      ) : (
        <>
          <div className="space-y-2">
            {connections.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} />
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