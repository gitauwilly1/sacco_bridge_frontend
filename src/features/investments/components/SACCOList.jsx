import { useState } from 'react';
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
import { ErrorState, EmptyState } from '@/components/feedback';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';

const tierConfig = {
  1: {
    label: 'Tier 1',
    color: 'bg-success/10 text-success border border-success/20',
    icon: Award,
    description: 'Large national SACCO',
  },
  2: {
    label: 'Tier 2',
    color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    icon: Shield,
    description: 'Medium regional SACCO',
  },
  3: {
    label: 'Tier 3',
    color: 'bg-sand text-slate border border-sand-dark/30',
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
      className="cursor-pointer border-sand shadow-subtle card-lift transition-all duration-200"
      onClick={() => navigate({ to: `/investments/saccos/${sacco.id}` })}
    >
      <CardContent className="p-4 flex items-center gap-3.5">
        {/* Logo */}
        <div className="h-12 w-12 rounded-xl bg-sand-light flex items-center justify-center flex-shrink-0 ring-2 ring-sand/30">
          {sacco.logo_url ? (
            <img
              src={sacco.logo_url}
              alt={sacco.name}
              className="h-10 w-10 rounded-lg object-contain"
            />
          ) : (
            <Building2 className="h-6 w-6 text-terracotta" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-slate truncate">
              {sacco.name}
            </h3>
            <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${tier.color}`}>
              <TierIcon className="h-3 w-3 mr-0.5" />
              {tier.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Users className="h-3.5 w-3.5" />
              {sacco.total_members?.toLocaleString() || '—'}
            </span>
            {sacco.registration_number && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {sacco.registration_number}
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          {sacco.dividend_rate != null && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-sm font-bold text-success font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {sacco.dividend_rate}%
              </span>
            </div>
          )}
          {sacco.share_price_range && (
            <p className="text-[11px] text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(sacco.share_price_range)}
            </p>
          )}
          {sacco.active_listings > 0 && (
            <Badge className="bg-terracotta/10 text-terracotta border-0 text-[10px] font-semibold shadow-none">
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
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="skeleton-shimmer h-12 w-12 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-4 w-40 rounded-lg" />
              <div className="skeleton-shimmer h-3 w-24 rounded-lg" />
            </div>
            <div className="skeleton-shimmer h-4 w-16 rounded" />
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
            className="text-xs border border-input rounded-lg px-2.5 py-1.5 bg-white text-slate font-medium outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors flex-1"
          >
            <option value="all">All Tiers</option>
            <option value="1">Tier 1 - Large National</option>
            <option value="2">Tier 2 - Medium Regional</option>
            <option value="3">Tier 3 - Small Community</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light transition-all px-2.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3 text-gray-400" />
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