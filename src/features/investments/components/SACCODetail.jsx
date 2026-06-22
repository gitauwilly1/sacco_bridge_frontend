import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, TrendingUp, Users, FileText,
  Shield, Award, Calendar, DollarSign, Layers,
  ShoppingCart, BadgePercent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';

const tierConfig = {
  1: { label: 'Tier 1', color: 'bg-success/10 text-success border border-success/20', icon: Award },
  2: { label: 'Tier 2', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', icon: Shield },
  3: { label: 'Tier 3', color: 'bg-sand text-slate border border-sand-dark/30', icon: Building2 },
};

export default function SACCODetail() {
  const { saccoId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: sacco,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sacco', saccoId],
    queryFn: () => investmentsApi.getSACCODetail(saccoId).then((r) => r.data.data || r.data),
    enabled: !!saccoId,
  });

  const { data: shareClasses } = useQuery({
    queryKey: ['sacco-share-classes', saccoId],
    queryFn: () =>
      investmentsApi.getShareClasses(saccoId).then((r) => r.data.results || r.data.data || []),
    enabled: !!saccoId,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load SACCO details" onRetry={refetch} />;
  if (!sacco) return <ErrorState message="SACCO not found" />;

  const tier = tierConfig[sacco.sasra_tier] || tierConfig[3];
  const TierIcon = tier.icon;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/investments' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to investments"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">{sacco.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${tier.color}`}>
                <TierIcon className="h-3 w-3 mr-0.5" />
                {tier.label}
              </Badge>
              {sacco.registration_number && (
                <span className="text-xs text-gray-400 font-medium">{sacco.registration_number}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 p-4">
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/10">
              <Users className="h-5 w-5 text-terracotta" />
            </div>
            <p className="text-2xl font-bold font-numbers text-slate leading-none mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {sacco.total_members?.toLocaleString() || '—'}
            </p>
            <p className="text-xs text-gray-400 font-medium">Members</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold font-numbers text-success leading-none mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {sacco.dividend_rate != null ? `${sacco.dividend_rate}%` : '—'}
            </p>
            <p className="text-xs text-gray-400 font-medium">Dividend Rate</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold font-numbers text-slate leading-none mb-1 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {sacco.total_assets ? formatKES(sacco.total_assets) : '—'}
            </p>
            <p className="text-xs text-gray-400 font-medium">Total Assets</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-alert/10">
              <Calendar className="h-5 w-5 text-alert" />
            </div>
            <p className="text-2xl font-bold font-numbers text-slate leading-none mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {sacco.established_year || '—'}
            </p>
            <p className="text-xs text-gray-400 font-medium">Established</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 flex gap-3 mb-6">
        <Button
          size="sm"
          className="flex-1 bg-terracotta hover:bg-clay text-white shadow-sm transition-all"
          onClick={() => navigate({ to: `/investments/saccos/${saccoId}/buy` })}
        >
          <ShoppingCart className="h-4 w-4 mr-1.5" /> Buy Shares
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-sand hover:bg-sand-light text-slate hover:text-terracotta transition-all"
          onClick={() => navigate({ to: `/investments/saccos/${saccoId}/sell` })}
        >
          <DollarSign className="h-4 w-4 mr-1.5" /> Sell Shares
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full justify-start overflow-x-auto flex gap-1 bg-sand/40 p-1 rounded-full border border-sand">
          <TabsTrigger
            value="overview"
            className="rounded-full text-xs font-semibold px-4 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="share-classes"
            className="rounded-full text-xs font-semibold px-4 py-1.5 transition-all data-[state=active]:bg-terracotta data-[state=active]:text-white data-[state=active]:shadow-sm cursor-pointer"
          >
            Share Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4 outline-none">
          {/* About */}
          {sacco.description && (
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
                <CardTitle className="text-sm font-semibold text-slate">About</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  {sacco.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Details */}
          <Card className="border-sand bg-white shadow-subtle overflow-hidden">
            <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
              <CardTitle className="text-sm font-semibold text-slate">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 divide-y divide-sand/40 *:pt-3 first:*:pt-0">
              {sacco.registration_number && (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Registration</span>
                  <span className="font-semibold text-slate">{sacco.registration_number}</span>
                </div>
              )}
              {sacco.sasra_tier && (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">SASRA Tier</span>
                  <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${tier.color}`}>{tier.label}</Badge>
                </div>
              )}
              {sacco.established_year && (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Established</span>
                  <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{sacco.established_year}</span>
                </div>
              )}
              {sacco.website && (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Website</span>
                  <a
                    href={sacco.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:text-clay font-bold hover:underline"
                  >
                    Visit Site &rarr;
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share-classes" className="mt-4 space-y-3 outline-none">
          {shareClasses?.length > 0 ? (
            shareClasses.map((sc) => (
              <Card
                key={sc.id}
                className="cursor-pointer border-sand shadow-subtle card-lift hover:border-terracotta/30 transition-all duration-200"
                onClick={() => navigate({ to: `/investments/share-classes/${sc.id}` })}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <h3 className="text-sm font-bold text-slate truncate">{sc.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1 flex-wrap">
                      <span className="font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Min: {formatKES(sc.minimum_investment)}</span>
                      {sc.dividend_yield && (
                        <span className="flex items-center gap-1 text-success font-semibold">
                          <BadgePercent className="h-3.5 w-3.5" />
                          {sc.dividend_yield}% yield
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-extrabold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatKES(sc.current_price || sc.price_per_share)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">per share</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center font-medium py-8">
              No share classes available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}