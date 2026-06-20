import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Building2, ChevronRight, Layers, DollarSign,
  BadgePercent, TrendingUp, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';
import PortfolioSummary from './PortfolioSummary';

function HoldingCard({ holding }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/investments/saccos/${holding.sacco_id}` })}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* SACCO Icon */}
        <div className="h-10 w-10 rounded-lg bg-sand-light flex items-center justify-center flex-shrink-0">
          <Building2 className="h-5 w-5 text-terracotta" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate truncate">
            {holding.sacco_name}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {holding.share_class_name || 'Shares'}
            </span>
            <span>
              {holding.quantity_owned?.toLocaleString()} shares
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-slate">
            {formatKES(holding.estimated_value)}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {holding.dividend_yield != null && (
              <span className="text-xs text-success flex items-center gap-0.5">
                <BadgePercent className="h-3 w-3" />
                {holding.dividend_yield}%
              </span>
            )}
            {holding.available_to_sell > 0 && (
              <Badge className="bg-blue-500/10 text-blue-500 text-xs">
                {holding.available_to_sell} available
              </Badge>
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </CardContent>
    </Card>
  );
}

function HoldingsListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function HoldingsList() {
  const [page, setPage] = useState(1);

  const {
    data: holdingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-holdings', page],
    queryFn: () =>
      investmentsApi
        .getMyHoldings({ page, page_size: 10 })
        .then((r) => r.data),
  });

  const holdings = holdingsData?.results || holdingsData?.data || [];
  const total = holdingsData?.count || holdings.length;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <PortfolioSummary />

      {/* Holdings List */}
      {isLoading ? (
        <HoldingsListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load holdings" onRetry={refetch} />
      ) : holdings.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No holdings yet"
          description="Browse SACCOs and start investing in shares"
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-terracotta" />
              <h2 className="text-sm font-semibold text-slate">
                {total} Holding{total !== 1 ? 's' : ''}
              </h2>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {holdings.map((holding) => (
              <HoldingCard key={holding.id} holding={holding} />
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