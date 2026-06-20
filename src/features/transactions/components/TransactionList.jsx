import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ArrowRightLeft, SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorState, EmptyState } from '@/components/feedback';
import { transactionApi } from '../api/transactionApi';
import SettlementSummary from './SettlementSummary';
import TransactionCard from './TransactionCard';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'disputed', label: 'Disputed' },
  { value: 'reversed', label: 'Reversed' },
];

const sortOptions = [
  { value: '-created_at', label: 'Newest' },
  { value: 'created_at', label: 'Oldest' },
  { value: '-total_value', label: 'Highest Value' },
  { value: 'total_value', label: 'Lowest Value' },
];

function TransactionListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TransactionList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('-created_at');
  const [page, setPage] = useState(1);

  const {
    data: settlementsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-settlements', page, status, sort, search],
    queryFn: () =>
      transactionApi
        .getMySettlements({
          page,
          page_size: 10,
          ...(status !== 'all' && { state: status }),
          ordering: sort,
          ...(search && { search }),
        })
        .then((r) => r.data),
  });

  const settlements = settlementsData?.results || settlementsData?.data || [];
  const total = settlementsData?.count || settlements.length;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <SettlementSummary />

      {/* Search & Sort */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="text-xs border rounded-md px-2 py-2 bg-white"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
              status === tab.value
                ? 'bg-terracotta text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <TransactionListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load transactions" onRetry={refetch} />
      ) : settlements.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No transactions yet"
          description={
            status !== 'all'
              ? `No ${status} settlements found`
              : 'Your settlement transactions will appear here'
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-terracotta" />
              <h2 className="text-sm font-semibold text-slate">
                {total} Transaction{total !== 1 ? 's' : ''}
              </h2>
            </div>
          </div>

          <div className="space-y-2">
            {settlements.map((settlement) => (
              <TransactionCard key={settlement.id} settlement={settlement} />
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