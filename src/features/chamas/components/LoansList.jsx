import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '../../../components/feedback/ErrorState';
import { formatKES, formatDate } from '../../../utils/format';
import { HandCoins, ArrowRight } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-alert/10 text-alert',
  APPROVED: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-danger/10 text-danger',
  DISBURSED: 'bg-success/10 text-success',
  PARTIALLY_REPAID: 'bg-blue-50 text-blue-600',
  FULLY_REPAID: 'bg-success/10 text-success',
  DEFAULTED: 'bg-danger/10 text-danger',
};

export default function LoansList({ chamaId }) {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['chama-loans', chamaId],
    queryFn: () => chamaApi.getLoans(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>;
  if (error) return <ErrorState message="Failed to load loans" />;

  const loans = data?.data || data?.results || [];

  if (loans.length === 0) {
    return (
      <EmptyState
        icon={HandCoins}
        title="No loans yet"
        description="Apply for a loan from your chama when you need funds."
        action={
          <Button onClick={() => navigate({ to: `/chamas/${chamaId}/loan` })}>
            Apply for Loan
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {loans.map((loan) => (
        <Card
          key={loan.id}
          className="cursor-pointer hover:shadow-sm"
          onClick={() => navigate({ to: `/chamas/${chamaId}/loans/${loan.id}` })}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className={statusColors[loan.status] || 'bg-gray-100'}>
                {loan.status?.replace('_', ' ')}
              </Badge>
              <ArrowRight className="h-4 w-4 text-gray-300" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-slate">{formatKES(loan.principal)}</p>
                <p className="text-xs text-gray-500">
                  {loan.duration_months} months · {loan.interest_rate}% interest
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate">
                  {formatKES(loan.monthly_installment)}<span className="text-xs text-gray-400">/mo</span>
                </p>
                {loan.outstanding_balance > 0 && (
                  <p className="text-xs text-alert">
                    Outstanding: {formatKES(loan.outstanding_balance)}
                  </p>
                )}
              </div>
            </div>
            {loan.status === 'DISBURSED' && (
              <div className="mt-2 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full"
                  style={{
                    width: `${loan.repayment_progress?.percentage || 0}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}