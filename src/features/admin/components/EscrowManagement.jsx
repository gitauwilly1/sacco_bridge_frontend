import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, RefreshCw, Undo } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatDate } from '../../../utils/format';
import DataTable from './DataTable';
import { ESCROW_STATUS_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function EscrowManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

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
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
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
  const total = escrowData?.pagination?.count ?? escrowData?.count ?? escrows.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      sortable: true,
      render: (value) => <span className="font-mono text-xs font-semibold text-slate/75">#{value}</span>,
    },
    {
      key: 'buyer_name',
      header: 'Parties',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate text-sm">{row.buyer_name || '—'} → {row.seller_name || '—'}</p>
          <p className="text-xs text-gray-400">{row.buyer_sacco_name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount Held',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-terracotta">
          {formatKES(value)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge className={`${getStatusColor(value, ESCROW_STATUS_COLORS)} border`} variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-gray-500 font-medium">{value ? formatDate(value) : '—'}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-2 justify-end">
      {(row.status === 'held' || row.status === 'HELD') && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success hover:text-success/80 hover:bg-success/5 transition-all rounded-lg font-semibold"
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
            className="text-alert hover:text-alert/80 hover:bg-alert/5 transition-all rounded-lg font-semibold"
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
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All</option>
            <option value="HELD">Held</option>
            <option value="RELEASED">Released</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => refetch()}
            className="border-sand hover:bg-sand-light text-slate transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate/75" />
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
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(key, order) => {
          setSortKey(key);
          setSortOrder(order);
          setPage(1);
        }}
      />
    </div>
  );
}