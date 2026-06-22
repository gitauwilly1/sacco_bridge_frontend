import { useQuery } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorState, EmptyState } from '@/components/feedback';
import { formatKES, formatDate } from '../../../utils/format';
import { Wallet } from 'lucide-react';

const statusColors = {
  PAID: 'bg-success/10 text-success border border-success/20',
  PENDING: 'bg-alert/10 text-alert border border-alert/20',
  LATE: 'bg-danger/10 text-danger border border-danger/20',
  MISSED: 'bg-gray-100 text-gray-400 border border-gray-200',
};

export default function ContributionsList({ chamaId }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-contributions', chamaId],
    queryFn: () => chamaApi.getContributions(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message="Failed to load contributions" onRetry={refetch} />;

  const contributions = data?.data || data?.results || [];

  if (contributions.length === 0) {
    return <EmptyState icon={Wallet} title="No contributions yet" description="Start contributing to your chama." />;
  }

  return (
    <div className="space-y-2.5">
      {contributions.map((c) => (
        <Card key={c.id} className="border-sand shadow-subtle card-lift">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-semibold text-slate truncate">{c.member_name}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {formatDate(c.period_start)} – {formatDate(c.period_end)}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">
                {c.payment_method} &middot; <span className="font-numbers">{c.payment_reference}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <p className="text-sm font-bold font-numbers text-success" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatKES(c.amount)}
              </p>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>
                {c.status?.toLowerCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}