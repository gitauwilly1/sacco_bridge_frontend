import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import {
  HandCoins, Calendar, Clock, AlertCircle, TrendingUp,
  CheckCircle2, XCircle, ChevronRight, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingState, EmptyState, ErrorState } from '@/components/feedback';
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
    color: 'bg-gray-200 text-gray-600 border-gray-300',
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

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/chamas/${chamaId}/loans/${loan.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate text-sm">
                {loan.purpose || 'Loan'}
              </h3>
              <Badge className={status.color} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Applied {formatTimeAgo(loan.created_at)}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-sm font-semibold text-slate">
              {formatKES(loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Balance</p>
            <p className="text-sm font-semibold text-slate">
              {formatKES(loan.outstanding_balance || loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Interest</p>
            <p className="text-sm font-medium text-slate">
              {loan.interest_rate}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Term</p>
            <p className="text-sm font-medium text-slate">
              {loan.term_months || loan.duration_months || '—'} months
            </p>
          </div>
        </div>

        {/* Repayment Progress */}
        {loan.status === 'active' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Repaid</span>
              <span className="font-medium text-slate">{progressPercent}%</span>
            </div>
            <div className="w-full bg-sand rounded-full h-1.5">
              <div
                className="bg-success rounded-full h-1.5 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">
                {formatKES(loan.total_repaid || 0)}
              </span>
              <span className="text-gray-500">
                {formatKES(loan.amount)}
              </span>
            </div>
          </div>
        )}

        {/* Next Payment */}
        {loan.next_payment_date && loan.status === 'active' && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3 text-terracotta" />
            <span className="text-gray-500">
              Next payment: <span className="font-medium text-slate">
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
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j}>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
            <Skeleton className="h-1.5 w-full mt-3" />
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
            // Navigate to loan application
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
            className="text-xs border rounded-md px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="repaid">Repaid</option>
            <option value="defaulted">Defaulted</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
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
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
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