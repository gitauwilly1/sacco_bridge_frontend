import { useQuery } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { formatKES, formatDate } from '../../../utils/format';
import { Wallet } from 'lucide-react';

export default function ContributionsList({ chamaId }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-contributions', chamaId],
    queryFn: () => chamaApi.getContributions(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (error) return <ErrorState message="Failed to load contributions" onRetry={refetch} />;

  const contributions = data?.data || data?.results || [];

  if (contributions.length === 0) {
    return <EmptyState icon={Wallet} title="No contributions yet" description="Start contributing to your chama." />;
  }

  const statusColors = {
    PAID: 'bg-success/10 text-success',
    PENDING: 'bg-alert/10 text-alert',
    LATE: 'bg-danger/10 text-danger',
    MISSED: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-2">
      {contributions.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate">{c.member_name}</p>
              <p className="text-xs text-gray-500">
                {formatDate(c.period_start)} – {formatDate(c.period_end)}
              </p>
              <p className="text-xs text-gray-400">{c.payment_method} · {c.payment_reference}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-success">{formatKES(c.amount)}</p>
              <Badge className={statusColors[c.status] || 'bg-gray-100'}>
                {c.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}