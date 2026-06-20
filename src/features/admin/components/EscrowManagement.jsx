import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lock, CheckCircle2, RefreshCw, Undo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatDate } from '../../../utils/format';
import DataTable from './DataTable';

export default function EscrowManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const {
    data: escrowData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-escrow', page, search, status],
    queryFn: () =>
      adminApi
        .getEscrowAccounts({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
  });

  const releaseMutation = useMutation({
    mutationFn: ({ id, action, amount }) =>
      adminApi.releaseEscrow(id, { action, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-escrow'] });
      toast.success('Escrow updated');
    },
    onError: (error) =>
      toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const escrows = escrowData?.results || escrowData?.data || [];
  const total = escrowData?.count || escrows.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (value) => <span className="font-mono text-xs">#{value}</span>,
    },
    {
      key: 'sacco_name',
      header: 'SACCO',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate text-sm">{row.sacco_name || '—'}</p>
          <p className="text-xs text-gray-500">{row.share_class_name}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Held',
      render: (value) => (
        <span className="text-sm font-semibold text-terracotta">
          {formatKES(value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          className={
            value === 'held'
              ? 'bg-blue-500/10 text-blue-500'
              : value === 'released'
              ? 'bg-success/10 text-success'
              : 'bg-gray-200 text-gray-600'
          }
          variant="outline"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => (
        <span className="text-xs text-gray-500">{formatDate(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      {row.status === 'held' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success"
            onClick={() => {
              if (window.confirm(`Release full amount ${formatKES(row.amount)}?`)) {
                releaseMutation.mutate({ id: row.id, action: 'release' });
              }
            }}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Release
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-alert"
            onClick={() => {
              if (window.confirm(`Refund ${formatKES(row.amount)} to buyer?`)) {
                releaseMutation.mutate({ id: row.id, action: 'refund' });
              }
            }}
          >
            <Undo className="h-3 w-3 mr-1" /> Refund
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Escrow Management</h1>
          <p className="text-sm text-gray-500">{total} escrow accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="held">Held</option>
            <option value="released">Released</option>
            <option value="refunded">Refunded</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={escrows}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={15}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        emptyMessage="No escrow accounts found"
        rowActions={rowActions}
      />
    </div>
  );
}