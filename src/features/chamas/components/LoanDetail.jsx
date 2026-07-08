import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, DollarSign, Percent, BadgeCheck, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { chamaApi } from '../api/chamaApi';
import { formatKES, formatDate } from '../../../utils/format';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-alert/10 text-alert border border-alert/20' },
  active: { label: 'Active', color: 'bg-success/10 text-success border border-success/20' },
  repaid: { label: 'Repaid', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
  defaulted: { label: 'Defaulted', color: 'bg-danger/10 text-danger border border-danger/20' },
  rejected: { label: 'Rejected', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

export default function LoanDetail() {
  const { chamaId, loanId } = useParams({ strict: false });
  const navigate = useNavigate();

  const { data: loan, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-loan', chamaId, loanId],
    queryFn: () => chamaApi.getLoan(chamaId, loanId).then((r) => r.data.data || r.data),
    enabled: !!chamaId && !!loanId,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load loan details" onRetry={refetch} />;
  if (!loan) return <ErrorState message="Loan not found" onRetry={() => navigate({ to: `/chamas/${chamaId}/loans` })} />;

  const statusStyle = statusConfig[loan.status] || statusConfig.pending;
  const progress = loan.principal > 0 ? Math.round(((loan.principal - (loan.outstanding_balance || 0)) / loan.principal) * 100) : 0;

  return (
    <div className="pb-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}/loans` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold font-heading text-slate">Loan Details</h1>
            <p className="text-xs text-gray-400">#{loan.id}</p>
          </div>
        </div>
      </div>

      {/* Status + Amount hero */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-slate to-slate-dark text-white rounded-2xl p-5 text-center shadow-subtle">
          <Badge className={`mb-2 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none ${statusStyle.color}`}>
            {statusStyle.label}
          </Badge>
          <p className="text-3xl font-extrabold font-numbers mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatKES(loan.amount || loan.principal)}
          </p>
          <p className="text-white/50 text-[11px] font-medium">Loan Amount</p>
        </div>
      </div>

      {/* Repayment Progress */}
      <div className="px-4 mt-4">
        <Card className="border-sand bg-white shadow-subtle">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 font-medium">Repayment Progress</span>
              <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{progress}%</span>
            </div>
            <div className="h-2 bg-sand rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-success' : 'bg-terracotta'}`}
                   style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
              <span>Paid: {formatKES(loan.total_repaid || 0)}</span>
              <span>Balance: {formatKES(loan.outstanding_balance || loan.amount || loan.principal)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="px-4 mt-4 space-y-3">
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
            <CardTitle className="text-sm font-semibold text-slate">Loan Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 divide-y divide-sand/40 *:pt-3 first:*:pt-0">
            {loan.purpose && (
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Purpose</span>
                <span className="font-semibold text-slate text-right max-w-[60%]">{loan.purpose}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">Interest Rate</span>
              <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{loan.interest_rate}%</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">Term</span>
              <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{loan.term_months || loan.duration_months} months</span>
            </div>
            {loan.next_payment_date && (
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-400">Next Payment</span>
                <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatDate(loan.next_payment_date)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">Created</span>
              <span className="font-semibold text-slate">{formatDate(loan.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back button */}
      <div className="px-4 mt-6">
        <Button variant="outline" className="w-full border-sand text-slate hover:bg-sand-light"
          onClick={() => navigate({ to: `/chamas/${chamaId}/loans` })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Loans
        </Button>
      </div>
    </div>
  );
}
