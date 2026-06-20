import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  BookOpen, TrendingUp, TrendingDown, ArrowRightLeft,
  Building2, ChevronRight, RefreshCw, Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { transactionApi } from '../api/transactionApi';
import { formatKES, formatDate, formatTimeAgo } from '../../../utils/format';

function LedgerCard({ entry }) {
  const navigate = useNavigate();
  const isDebit = entry.entry_type === 'DEBIT' || entry.type === 'DEBIT';

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => {
        if (entry.settlement_id) {
          navigate({ to: `/transactions/${entry.settlement_id}` });
        }
      }}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isDebit ? 'bg-danger/10' : 'bg-success/10'
          }`}
        >
          {isDebit ? (
            <TrendingDown className={`h-5 w-5 text-danger`} />
          ) : (
            <TrendingUp className={`h-5 w-5 text-success`} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-slate truncate">
              {entry.sacco_name || 'Ledger Entry'}
            </h3>
            <Badge
              className={
                isDebit
                  ? 'bg-danger/10 text-danger'
                  : 'bg-success/10 text-success'
              }
              variant="outline"
            >
              {isDebit ? 'Debit' : 'Credit'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {entry.share_class_name && (
              <span>{entry.share_class_name}</span>
            )}
            {entry.quantity && (
              <span>{entry.quantity?.toLocaleString()} shares</span>
            )}
            {entry.counterparty_name && (
              <span className="truncate max-w-[100px]">
                {entry.counterparty_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(entry.created_at)}</span>
            {entry.settlement_id && (
              <span className="text-terracotta">
                Settlement #{entry.settlement_id}
              </span>
            )}
          </div>
        </div>

        {/* Amounts */}
        <div className="text-right flex-shrink-0">
          <p
            className={`text-sm font-semibold ${
              isDebit ? 'text-danger' : 'text-success'
            }`}
          >
            {isDebit ? '-' : '+'}
            {formatKES(entry.amount)}
          </p>
          {entry.balance != null && (
            <p className="text-xs text-gray-400 mt-0.5">
              Balance: {formatKES(entry.balance)}
            </p>
          )}
        </div>

        {entry.settlement_id && (
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </CardContent>
    </Card>
  );
}

function LedgerListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function LedgerList() {
  const [page, setPage] = useState(1);
  const [entryType, setEntryType] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const {
    data: ledgerData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ledger-entries', page, entryType, dateRange],
    queryFn: () =>
      transactionApi
        .getLedgerEntries({
          page,
          page_size: 15,
          ...(entryType !== 'all' && { entry_type: entryType }),
          ...(dateRange !== 'all' && { date_range: dateRange }),
        })
        .then((r) => r.data),
  });

  const entries = ledgerData?.results || ledgerData?.data || [];
  const total = ledgerData?.count || entries.length;
  const totalPages = Math.ceil(total / 15);

  // Calculate summary
  const totalCredits = entries
    .filter((e) => (e.entry_type || e.type) === 'CREDIT')
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalDebits = entries
    .filter((e) => (e.entry_type || e.type) === 'DEBIT')
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const netBalance = totalCredits - totalDebits;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {entries.length > 0 && !isLoading && (
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Credits</p>
              <p className="text-sm font-bold text-success">
                {formatKES(totalCredits)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Debits</p>
              <p className="text-sm font-bold text-danger">
                {formatKES(totalDebits)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-gray-500 mb-0.5">Net</p>
              <p
                className={`text-sm font-bold ${
                  netBalance >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {formatKES(netBalance)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <select
          value={entryType}
          onChange={(e) => {
            setEntryType(e.target.value);
            setPage(1);
          }}
          className="text-xs border rounded-md px-2 py-1.5 bg-white flex-1"
        >
          <option value="all">All Entries</option>
          <option value="CREDIT">Credits Only</option>
          <option value="DEBIT">Debits Only</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
          className="text-xs border rounded-md px-2 py-1.5 bg-white"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
        </select>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LedgerListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load ledger" onRetry={refetch} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No ledger entries"
          description={
            entryType !== 'all' || dateRange !== 'all'
              ? 'No entries match your filters'
              : 'Your transaction ledger will appear here'
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-terracotta" />
              <h2 className="text-sm font-semibold text-slate">
                {total} Entr{total !== 1 ? 'ies' : 'y'}
              </h2>
            </div>
          </div>

          <div className="space-y-2">
            {entries.map((entry) => (
              <LedgerCard key={entry.id} entry={entry} />
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}