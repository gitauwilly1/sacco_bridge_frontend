import { useQuery } from '@tanstack/react-query';
import {
  ArrowRightLeft, CheckCircle2, Clock, AlertCircle,
  TrendingUp, TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
      value: summary.pending_count || 0,
      icon: Clock,
      color: 'text-alert',
    },
    {
      label: 'Completed',
      value: summary.completed_count || 0,
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      label: 'Disputed',
      value: summary.disputed_count || 0,
      icon: AlertCircle,
      color: 'text-danger',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
              <p className="text-xl font-bold text-slate">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}