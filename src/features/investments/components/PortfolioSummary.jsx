import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, AlertTriangle, PieChart, Shield,
  Layers, DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';

function getConcentrationColor(score) {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-alert';
  return 'text-danger';
}

function getConcentrationBg(score) {
  if (score >= 80) return 'bg-success/10';
  if (score >= 50) return 'bg-alert/10';
  return 'bg-danger/10';
}

export default function PortfolioSummary() {
  const {
    data: concentration,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['concentration-check'],
    queryFn: () =>
      investmentsApi.getConcentrationCheck().then((r) => r.data.data || r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load portfolio" onRetry={refetch} />;
  }

  if (!concentration) return null;

  const score = concentration.diversification_score ?? 0;
  const colorClass = getConcentrationColor(score);
  const bgClass = getConcentrationBg(score);

  return (
    <div className="space-y-3">
      {/* Portfolio Value */}
      <div className="bg-sand-light rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold text-slate">
          {formatKES(concentration.total_value)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-1">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          <span className="text-xs text-success font-medium">
            {concentration.percentage_change ?? 0}% all time
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers className="h-4 w-4 text-terracotta" />
              <p className="text-xs text-gray-500">SACCOs</p>
            </div>
            <p className="text-xl font-bold text-slate">{concentration.total_saccos || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-gray-500">Holdings</p>
            </div>
            <p className="text-xl font-bold text-slate">{concentration.total_holdings || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-gray-500">Diversification</p>
            </div>
            <p className={`text-xl font-bold ${colorClass}`}>
              {score}/100
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-success" />
              <p className="text-xs text-gray-500">Risk Level</p>
            </div>
            <p className="text-xl font-bold text-slate">
              {score >= 80 ? 'Low' : score >= 50 ? 'Medium' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Concentration Warnings */}
      {concentration.warnings?.length > 0 && (
        <Card className={`border-0 ${bgClass}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-alert flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate mb-2">
                  Concentration Warning{concentration.warnings.length > 1 ? 's' : ''}
                </p>
                <ul className="space-y-1">
                  {concentration.warnings.map((warning, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span>•</span>
                      <span>{warning.message || warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}