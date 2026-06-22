import { useQuery } from '@tanstack/react-query';
import {
  ArrowRightLeft, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { transactionApi } from '../api/transactionApi';
import { formatKES } from '../../../utils/format';

export default function SettlementSummary() {
  const {
    data: summary,
    isLoading,
  } = useQuery({
    queryKey: ['settlement-summary'],
    queryFn: () =>
      transactionApi.getSettlementSummary().then((r) => r.data.data || r.data),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-sand bg-white shadow-subtle">
            <CardContent className="p-4">
              <div className="skeleton-shimmer h-3 w-16 rounded mb-2" />
              <div className="skeleton-shimmer h-6 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const stats = [
    {
      label: 'Total Bought',
      value: formatKES(summary.total_bought || 0),
      icon: TrendingDown,
      color: 'text-blue-500',
    },
    {
      label: 'Total Sold',
      value: formatKES(summary.total_sold || 0),
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      label: 'Total Volume',
      value: formatKES(summary.total_volume || 0),
      icon: ArrowRightLeft,
      color: 'text-terracotta',
    },
    {
      label: 'Pending',
      value: (summary.pending_count || 0).toLocaleString(),
      icon: Clock,
      color: 'text-alert',
    },
    {
      label: 'Completed',
      value: (summary.completed_count || 0).toLocaleString(),
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      label: 'Disputed',
      value: (summary.disputed_count || 0).toLocaleString(),
      icon: AlertCircle,
      color: 'text-danger',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="border-sand bg-white shadow-subtle">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{stat.label}</p>
              </div>
              <p className="text-base font-extrabold text-slate font-numbers truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}