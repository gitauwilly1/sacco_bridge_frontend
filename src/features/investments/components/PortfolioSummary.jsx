import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, AlertTriangle, PieChart, Shield,
  Layers, DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState } from '@/components/feedback';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';

function getConcentrationColor(score) {
  if (score >= 80) return 'text-success';
  if (score >= 50) return 'text-alert';
  return 'text-danger';
}

function getConcentrationBg(score) {
  if (score >= 80) return 'bg-success/5';
  if (score >= 50) return 'bg-alert/5';
  return 'bg-danger/5';
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
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-sand">
            <CardContent className="p-4 space-y-2">
              <div className="skeleton-shimmer h-3.5 w-16 rounded" />
              <div className="skeleton-shimmer h-7 w-24 rounded-lg" />
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
    <div className="space-y-4">
      {/* Portfolio Value */}
      <div className="bg-sand border border-sand-dark/20 rounded-2xl p-5 text-center shadow-subtle">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-extrabold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {formatKES(concentration.total_value)}
        </p>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-success" />
          <span className="text-xs text-success font-semibold font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {concentration.percentage_change ?? 0}% all time
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="h-4 w-4 text-terracotta" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">SACCOs</p>
            </div>
            <p className="text-xl font-bold text-slate font-numbers animate-count-up" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{concentration.total_saccos || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Holdings</p>
            </div>
            <p className="text-xl font-bold text-slate font-numbers animate-count-up" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{concentration.total_holdings || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <PieChart className="h-4 w-4 text-purple-500" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Diversification</p>
            </div>
            <p className={`text-xl font-bold font-numbers animate-count-up ${colorClass}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {score}/100
            </p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle card-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="h-4 w-4 text-success" />
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Risk Level</p>
            </div>
            <p className="text-xl font-bold text-slate">
              {score >= 80 ? 'Low' : score >= 50 ? 'Medium' : 'High'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Concentration Warnings */}
      {concentration.warnings?.length > 0 && (
        <Card className={`border-0 border-l-4 ${score >= 80 ? 'border-l-success' : score >= 50 ? 'border-l-alert' : 'border-l-danger'} ${bgClass} rounded-xl shadow-subtle`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-alert flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate mb-2">
                  Concentration Warning{concentration.warnings.length > 1 ? 's' : ''}
                </p>
                <ul className="space-y-1.5">
                  {concentration.warnings.map((warning, i) => (
                    <li key={i} className="text-xs text-gray-500 font-medium flex items-start gap-1">
                      <span className="text-slate">&bull;</span>
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