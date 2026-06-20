import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  ShoppingCart, Clock, AlertCircle, Building2,
  TrendingUp, Tag, ChevronRight, RefreshCw, Handshake,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import { URGENCY_LEVELS } from '../../../utils/constants';

const urgencyConfig = {
  STANDARD: { color: 'bg-blue-500/10 text-blue-500', label: 'Standard' },
  PRIORITY: { color: 'bg-alert/10 text-alert', label: 'Priority' },
  URGENT: { color: 'bg-danger/10 text-danger', label: 'Urgent' },
};

function OpportunityCard({ opportunity }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urgency = urgencyConfig[opportunity.urgency] || urgencyConfig.STANDARD;
  const totalValue = (opportunity.quantity || 0) * (opportunity.price_per_share || 0);

  const interestMutation = useMutation({
    mutationFn: () =>
      investmentsApi.expressInterest(opportunity.id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Interest expressed! Check your connections.');
    },
    onError: (error) => {
      const msg =
        error.response?.data?.error?.message ||
        'Failed to express interest';
      toast.error(msg);
    },
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-sand-light flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-terracotta" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate truncate">
                {opportunity.sacco_name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {opportunity.share_class_name}
              </p>
            </div>
          </div>
          <Badge className={urgency.color} variant="outline">
            {urgency.label}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="text-sm font-semibold text-slate">
              {opportunity.quantity?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Price/Share</p>
            <p className="text-sm font-semibold text-slate">
              {formatKES(opportunity.price_per_share)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-semibold text-terracotta">
              {formatKES(totalValue)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(opportunity.created_at)}
            </span>
            {opportunity.seller_name && (
              <span className="truncate max-w-[120px]">
                by {opportunity.seller_name}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => interestMutation.mutate()}
            disabled={interestMutation.isPending}
          >
            {interestMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <Handshake className="h-3 w-3 mr-1" />
                Express Interest
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function OpportunityListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function OpportunityList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [saccoFilter, setSaccoFilter] = useState('all');

  const { data: holdingsData } = useQuery({
    queryKey: ['my-holdings'],
    queryFn: () =>
      investmentsApi.getMyHoldings({ page_size: 100 }).then((r) => r.data),
  });

  const holdings = holdingsData?.results || holdingsData?.data || [];
  const mySaccos = [...new Map(holdings.map((h) => [h.sacco_id, h]))].map(
    ([_, h]) => ({ id: h.sacco_id, name: h.sacco_name })
  );

  const {
    data: opportunitiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['opportunities', page, saccoFilter],
    queryFn: () =>
      investmentsApi
        .getOpportunities({
          page,
          page_size: 10,
          ...(saccoFilter !== 'all' && { sacco_id: saccoFilter }),
        })
        .then((r) => r.data),
  });

  const opportunities = opportunitiesData?.results || opportunitiesData?.data || [];
  const total = opportunitiesData?.count || opportunities.length;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {isLoading
              ? '...'
              : `${total} Opportunit${total !== 1 ? 'ies' : 'y'}`}
          </h2>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* SACCO Filter */}
      {mySaccos.length > 1 && (
        <select
          value={saccoFilter}
          onChange={(e) => {
            setSaccoFilter(e.target.value);
            setPage(1);
          }}
          className="w-full text-xs border rounded-md px-2 py-1.5 bg-white"
        >
          <option value="all">All My SACCOs</option>
          {mySaccos.map((sacco) => (
            <option key={sacco.id} value={sacco.id}>
              {sacco.name}
            </option>
          ))}
        </select>
      )}

      {/* Content */}
      {isLoading ? (
        <OpportunityListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load opportunities" onRetry={refetch} />
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No opportunities yet"
          description={
            saccoFilter !== 'all'
              ? 'No active selling requests in this SACCO'
              : 'Shares for sale from other members will appear here'
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {opportunities.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
              />
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