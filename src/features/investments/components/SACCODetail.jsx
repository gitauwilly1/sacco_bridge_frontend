import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, TrendingUp, Users, FileText,
  Shield, Award, Calendar, DollarSign, Layers,
  ChevronRight, ShoppingCart, BadgePercent, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatDate } from '../../../utils/format';

const tierConfig = {
  1: { label: 'Tier 1', color: 'bg-success/10 text-success border-success/20', icon: Award },
  2: { label: 'Tier 2', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Shield },
  3: { label: 'Tier 3', color: 'bg-alert/10 text-alert border-alert/20', icon: Building2 },
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
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/investments' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">{sacco.name}</h1>
            <div className="flex items-center gap-2">
              <Badge className={tier.color} variant="outline">
                <TierIcon className="h-3 w-3 mr-0.5" />
                {tier.label}
              </Badge>
              {sacco.registration_number && (
                <span className="text-xs text-gray-500">{sacco.registration_number}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 text-terracotta mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">
              {sacco.total_members?.toLocaleString() || '—'}
            </p>
            <p className="text-xs text-gray-500">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">
              {sacco.dividend_rate != null ? `${sacco.dividend_rate}%` : '—'}
            </p>
            <p className="text-xs text-gray-500">Dividend Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Layers className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">
              {sacco.total_assets ? formatKES(sacco.total_assets) : '—'}
            </p>
            <p className="text-xs text-gray-500">Total Assets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-5 w-5 text-alert mx-auto mb-1" />
            <p className="text-2xl font-bold text-slate">
              {sacco.established_year || '—'}
            </p>
            <p className="text-xs text-gray-500">Established</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-4 flex gap-2 mb-4">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => navigate({ to: `/investments/saccos/${saccoId}/buy` })}
        >
          <ShoppingCart className="h-4 w-4 mr-1" /> Buy Shares
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => navigate({ to: `/investments/saccos/${saccoId}/sell` })}
        >
          <DollarSign className="h-4 w-4 mr-1" /> Sell Shares
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="share-classes">Share Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* About */}
          {sacco.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {sacco.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sacco.registration_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Registration</span>
                  <span className="font-medium text-slate">{sacco.registration_number}</span>
                </div>
              )}
              {sacco.sasra_tier && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SASRA Tier</span>
                  <Badge className={tier.color} variant="outline">{tier.label}</Badge>
                </div>
              )}
              {sacco.established_year && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Established</span>
                  <span className="font-medium text-slate">{sacco.established_year}</span>
                </div>
              )}
              {sacco.website && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Website</span>
                  <a
                    href={sacco.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:underline"
                  >
                    Visit →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share-classes" className="mt-4 space-y-2">
          {shareClasses?.length > 0 ? (
            shareClasses.map((sc) => (
              <Card
                key={sc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate({ to: `/investments/share-classes/${sc.id}` })}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate">{sc.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>Min: {formatKES(sc.minimum_investment)}</span>
                      {sc.dividend_yield && (
                        <span className="flex items-center gap-1 text-success">
                          <BadgePercent className="h-3 w-3" />
                          {sc.dividend_yield}% yield
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate">
                      {formatKES(sc.current_price || sc.price_per_share)}
                    </p>
                    <p className="text-xs text-gray-400">per share</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              No share classes available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}