import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Building2, Search, ChevronRight, TrendingUp,
  Users, FileText, Award, Shield, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';

const tierConfig = {
  1: {
    label: 'Tier 1',
    color: 'bg-success/10 text-success border-success/20',
    icon: Award,
    description: 'Large national SACCO',
  },
  2: {
    label: 'Tier 2',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Shield,
    description: 'Medium regional SACCO',
  },
  3: {
    label: 'Tier 3',
    color: 'bg-alert/10 text-alert border-alert/20',
    icon: Building2,
    description: 'Small community SACCO',
  },
};

function SACCOCard({ sacco }) {
  const navigate = useNavigate();
  const tier = tierConfig[sacco.sasra_tier] || tierConfig[3];
  const TierIcon = tier.icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/investments/saccos/${sacco.id}` })}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* Logo */}
        <div className="h-12 w-12 rounded-lg bg-sand-light flex items-center justify-center flex-shrink-0">
          {sacco.logo_url ? (
            <img
              src={sacco.logo_url}
              alt={sacco.name}
              className="h-10 w-10 rounded object-contain"
            />
          ) : (
            <Building2 className="h-6 w-6 text-terracotta" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-slate truncate">
              {sacco.name}
            </h3>
            <Badge className={tier.color} variant="outline">
              <TierIcon className="h-3 w-3 mr-0.5" />
              {tier.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {sacco.total_members?.toLocaleString() || '—'} members
            </span>
            {sacco.registration_number && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {sacco.registration_number}
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="text-right flex-shrink-0">
          {sacco.dividend_rate != null && (
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-sm font-semibold text-success">
                {sacco.dividend_rate}%
              </span>
            </div>
          )}
          {sacco.share_price_range && (
            <p className="text-xs text-gray-500">
              {formatKES(sacco.share_price_range)}
            </p>
          )}
          {sacco.active_listings > 0 && (
            <Badge className="bg-terracotta/10 text-terracotta text-xs mt-1">
              {sacco.active_listings} active listing{sacco.active_listings !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </CardContent>
    </Card>
  );
}

function SACCOListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SACCOList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('all');
  const [page, setPage] = useState(1);

  const {
    data: saccosData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['saccos', page, tier, search],
    queryFn: () =>
      investmentsApi
        .getSACCOs({
          page,
          page_size: 10,
          ...(tier !== 'all' && { sasra_tier: tier }),
          ...(search && { search }),
        })
        .then((r) => r.data),
  });

  const saccos = saccosData?.results || saccosData?.data || [];
  const total = saccosData?.count || saccos.length;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search SACCOs by name or registration..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tier}
            onChange={(e) => {
              setTier(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-md px-2 py-1.5 bg-white flex-1"
          >
            <option value="all">All Tiers</option>
            <option value="1">Tier 1 - Large National</option>
            <option value="2">Tier 2 - Medium Regional</option>
            <option value="3">Tier 3 - Small Community</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <SACCOListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load SACCOs" onRetry={refetch} />
      ) : saccos.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No SACCOs found"
          description={
            search
              ? 'Try adjusting your search or filters'
              : 'No verified SACCOs available yet'
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-terracotta" />
              <h2 className="text-sm font-semibold text-slate">
                {total} SACCO{total !== 1 ? 's' : ''}
              </h2>
            </div>
          </div>

          <div className="space-y-2">
            {saccos.map((sacco) => (
              <SACCOCard key={sacco.id} sacco={sacco} />
            ))}
          </div>

          {/* Pagination */}
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