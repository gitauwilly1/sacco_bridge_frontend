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
      className="cursor-pointer border-sand shadow-subtle card-lift transition-all duration-200"
      onClick={() => {
        if (entry.settlement_id) {
          navigate({ to: `/transactions/${entry.settlement_id}` });
        }
      }}
    >
      <CardContent className="p-4 flex items-center gap-3.5">
        {/* Icon */}
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ring-2 ${
            isDebit
              ? 'bg-danger/10 text-danger border border-danger/25 ring-danger/10'
              : 'bg-success/10 text-success border border-success/25 ring-success/10'
          }`}
        >
          {isDebit ? (
            <TrendingDown className="h-5 w-5" />
          ) : (
            <TrendingUp className="h-5 w-5" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate truncate">
              {entry.sacco_name || 'Ledger Entry'}
            </h3>
            <Badge
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${
                isDebit
                  ? 'bg-danger/10 text-danger border border-danger/20'
                  : 'bg-success/10 text-success border border-success/20'
              }`}
              variant="outline"
            >
              {isDebit ? 'Debit' : 'Credit'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            {entry.share_class_name && (
              <span>{entry.share_class_name}</span>
            )}
            {entry.quantity && (
              <span className="font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{entry.quantity?.toLocaleString()} shares</span>
            )}
            {entry.counterparty_name && (
              <span className="truncate max-w-[100px]">
                {entry.counterparty_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 font-medium">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>{formatDate(entry.created_at)}</span>
            {entry.settlement_id && (
              <span className="text-terracotta font-semibold">
                Settlement #{entry.settlement_id}
              </span>
            )}
          </div>
        </div>

        {/* Amounts */}
        <div className="text-right flex-shrink-0">
          <p
            className={`text-sm font-extrabold font-numbers ${
              isDebit ? 'text-danger' : 'text-success'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {isDebit ? '-' : '+'}
            {formatKES(entry.amount)}
          </p>
          {entry.balance != null && (
            <p className="text-[10px] text-gray-450 font-semibold uppercase tracking-wider mt-0.5 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Bal: {formatKES(entry.balance)}
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
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-shimmer h-4 w-32 rounded-lg" />
              <div className="skeleton-shimmer h-3 w-24 rounded" />
            </div>
            <div className="skeleton-shimmer h-4 w-20 rounded" />
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
        <div className="grid grid-cols-3 gap-2.5">
          <Card className="border-sand bg-white shadow-subtle">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Credits</p>
              <p className="text-xs font-bold text-success font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatKES(totalCredits)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-sand bg-white shadow-subtle">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Debits</p>
              <p className="text-xs font-bold text-danger font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatKES(totalDebits)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-sand bg-white shadow-subtle">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Net Balance</p>
              <p
                className={`text-xs font-bold font-numbers ${
                  netBalance >= 0 ? 'text-success' : 'text-danger'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
          className="text-xs border border-input rounded-xl px-2.5 py-2.5 bg-white text-slate focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer transition-colors flex-1"
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
          className="text-xs border border-input rounded-xl px-2.5 py-2.5 bg-white text-slate focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer transition-colors flex-1"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
        </select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="border-sand hover:bg-sand-light text-slate cursor-pointer h-10 w-10 p-0 flex items-center justify-center rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
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

          <div className="space-y-3">
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
                className="border-sand hover:bg-sand-light text-slate cursor-pointer"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-400 font-medium">
                {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-sand hover:bg-sand-light text-slate cursor-pointer"
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