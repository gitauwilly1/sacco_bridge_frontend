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
  buyer: { label: 'Buying', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
  seller: { label: 'Selling', color: 'bg-terracotta/10 text-terracotta border border-terracotta/20' },
};

const connectionStatusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border border-success/20' },
  settled: { label: 'Settled', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger border border-danger/20' },
};

function ConnectionCard({ connection }) {
  const navigate = useNavigate();
  const role = roleConfig[connection.my_role] || roleConfig.buyer;
  const status = connectionStatusConfig[connection.status] || connectionStatusConfig.active;

  return (
    <Card
      className="cursor-pointer border-sand shadow-subtle card-lift transition-all duration-200"
      onClick={() => navigate({ to: `/investments/connections/${connection.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-slate truncate">
                {connection.counterparty_name || 'Member'}
              </h3>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${role.color}`} variant="outline">
                {role.label}
              </Badge>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${status.color}`} variant="outline">
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-medium truncate">
              {connection.sacco_name} · {connection.share_class_name}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 bg-sand-light/50 p-2.5 rounded-xl border border-sand/40">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Quantity</p>
            <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {connection.quantity?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Last Offer</p>
            <p className="text-sm font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {connection.last_offer_price
                ? formatKES(connection.last_offer_price)
                : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 text-gray-400">
            {connection.unread_messages > 0 && (
              <Badge className="bg-danger text-white border-none px-1.5 py-0.5 rounded-full text-[9px] font-bold shadow-none leading-none">
                {connection.unread_messages} new
              </Badge>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              {connection.last_message_at
                ? formatTimeAgo(connection.last_message_at)
                : formatTimeAgo(connection.created_at)}
            </span>
          </div>
          {connection.pending_offer && (
            <Badge className="bg-alert/10 text-alert border border-alert/20 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-none">
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
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="skeleton-shimmer h-4 w-28 rounded-lg" />
                  <div className="skeleton-shimmer h-4 w-12 rounded-full" />
                </div>
                <div className="skeleton-shimmer h-3 w-40 rounded" />
              </div>
              <div className="skeleton-shimmer h-4 w-4 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 bg-sand-light/50 p-2.5 rounded-xl border border-sand/40">
              <div className="space-y-1.5"><div className="skeleton-shimmer h-3 w-12 rounded" /><div className="skeleton-shimmer h-4 w-16 rounded" /></div>
              <div className="space-y-1.5"><div className="skeleton-shimmer h-3 w-12 rounded" /><div className="skeleton-shimmer h-4 w-16 rounded" /></div>
            </div>
            <div className="skeleton-shimmer h-3.5 w-24 rounded" />
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
      <div className="flex items-center justify-between gap-4">
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
            className="text-xs border border-input rounded-xl px-2.5 py-1.5 bg-white text-slate focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer transition-colors"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="settled">Settled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="border-sand hover:bg-sand-light text-slate cursor-pointer"
          >
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
          <div className="space-y-3">
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
                className="border-sand hover:bg-sand-light text-slate cursor-pointer"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-400 font-medium">
                {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-sand hover:bg-sand-light text-slate cursor-pointer"
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