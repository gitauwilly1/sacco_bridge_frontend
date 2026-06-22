import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  HandCoins, Calendar, Clock, AlertCircle,
  CheckCircle2, XCircle, ChevronRight, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/feedback';
import { chamaApi } from '../api/chamaApi';
import { formatKES, formatDate, formatTimeAgo } from '../../../utils/format';

const loanStatusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-alert/10 text-alert border-alert/20',
    icon: Clock,
  },
  active: {
    label: 'Active',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
  },
  repaid: {
    label: 'Repaid',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: CheckCircle2,
  },
  defaulted: {
    label: 'Defaulted',
    color: 'bg-danger/10 text-danger border-danger/20',
    icon: AlertCircle,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-gray-100 text-gray-400 border-gray-200',
    icon: XCircle,
  },
};

function LoanCard({ loan, chamaId }) {
  const navigate = useNavigate();
  const status = loanStatusConfig[loan.status] || loanStatusConfig.pending;
  const StatusIcon = status.icon;
  
  const progressPercent = loan.total_repaid
    ? Math.min(Math.round((loan.total_repaid / loan.amount) * 100), 100)
    : 0;

  const leftBorderColor = 
    loan.status === 'active' ? 'border-l-success' :
    loan.status === 'pending' ? 'border-l-alert' :
    loan.status === 'repaid' ? 'border-l-blue-500' :
    loan.status === 'defaulted' ? 'border-l-danger' :
    'border-l-gray-300';

  return (
    <Card
      className={`cursor-pointer border-sand border-l-4 ${leftBorderColor} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
      onClick={() => navigate({ to: `/chamas/${chamaId}/loans/${loan.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate text-sm truncate">
                {loan.purpose || 'Loan'}
              </h3>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              Applied {formatTimeAgo(loan.created_at)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Amount</p>
            <p className="text-sm font-bold text-slate font-numbers mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Balance</p>
            <p className="text-sm font-bold text-slate font-numbers mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(loan.outstanding_balance || loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Interest</p>
            <p className="text-sm font-semibold text-slate font-numbers mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {loan.interest_rate}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Term</p>
            <p className="text-sm font-semibold text-slate mt-0.5">
              {loan.term_months || loan.duration_months || '—'} months
            </p>
          </div>
        </div>

        {/* Repayment Progress */}
        {loan.status === 'active' && (
          <div className="space-y-1.5 mt-4 pt-3 border-t border-sand/40">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Repaid</span>
              <span className="font-bold text-success font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{progressPercent}%</span>
            </div>
            <div className="w-full bg-sand rounded-full h-2">
              <div
                className="bg-success rounded-full h-2 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span>
                {formatKES(loan.total_repaid || 0)}
              </span>
              <span>
                {formatKES(loan.amount)}
              </span>
            </div>
          </div>
        )}

        {/* Next Payment */}
        {loan.next_payment_date && loan.status === 'active' && (
          <div className="mt-3.5 pt-3.5 border-t border-sand/40 flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-terracotta" />
            <span className="text-gray-400 font-medium">
              Next payment: <span className="font-bold text-slate">
                {formatDate(loan.next_payment_date)}
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoansListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-32 rounded-lg" />
                <div className="skeleton-shimmer h-3.5 w-24 rounded-lg" />
              </div>
              <div className="skeleton-shimmer h-4 w-4 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-1">
                  <div className="skeleton-shimmer h-3 w-16 rounded" />
                  <div className="skeleton-shimmer h-4 w-20 rounded" />
                </div>
              ))}
            </div>
            <div className="skeleton-shimmer h-2 w-full rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function LoansList({ chamaId }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');

  const {
    data: loansData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chama-loans', chamaId, page, status],
    queryFn: () =>
      chamaApi
        .getLoans(chamaId, {
          page,
          page_size: 10,
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <LoansListSkeleton />;
  if (error) {
    return (
      <ErrorState
        message="Failed to load loans"
        onRetry={refetch}
      />
    );
  }

  const loans = loansData?.results || loansData?.data || [];
  const total = loansData?.count || loans.length;
  const totalPages = Math.ceil(total / 10);

  if (!loans.length) {
    return (
      <EmptyState
        icon={HandCoins}
        title="No loans yet"
        description="Apply for a loan to get started"
        action={{
          label: 'Apply for Loan',
          onClick: () => {
            window.location.href = `/chamas/${chamaId}/loan`;
          },
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HandCoins className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {total} Loan{total !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-input rounded-lg px-2.5 py-1.5 bg-white text-slate font-medium outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="repaid">Repaid</option>
            <option value="defaulted">Defaulted</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light transition-all px-2.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Loans List */}
      <div className="space-y-3">
        {loans.map((loan) => (
          <LoanCard key={loan.id} loan={loan} chamaId={chamaId} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}