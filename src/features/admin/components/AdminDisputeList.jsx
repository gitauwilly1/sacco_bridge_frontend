import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';
import { DISPUTE_STATUS_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function AdminDisputeList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: disputesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-disputes', page, search, status],
    queryFn: () =>
      adminApi
        .getDisputesAdmin({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
        })
        .then((r) => r.data),
  });

  const disputes = disputesData?.results || disputesData?.data || [];
  const total = disputesData?.pagination?.count ?? disputesData?.count ?? disputes.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      sortable: true,
      render: (value) => <span className="font-mono text-xs font-semibold text-slate/75">#{value}</span>,
    },
    {
      key: 'buyer_sacco_name',
      header: 'Parties',
      render: (_, row) => (
        <div>
          <p className="text-sm font-semibold text-slate">
            {row.buyer_name || '—'} → {row.seller_name || '—'}
          </p>
          <p className="text-xs text-gray-400">
            {row.buyer_sacco_name || '—'} / {row.seller_sacco_name || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-slate">{formatKES(value)}</span>
      ),
    },
    {
      key: 'state',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          className={`${getStatusColor(value, DISPUTE_STATUS_COLORS)} border`}
          variant="outline"
        >
          {value?.replace(/_/g, ' ')?.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Filed',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-gray-500">{formatTimeAgo(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <Button
      size="sm"
      variant="ghost"
      className="text-terracotta hover:text-clay hover:bg-sand-light transition-all rounded-lg font-medium"
      onClick={() => navigate({ to: `/admin/disputes/${row.id}` })}
    >
      Review
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Dispute Resolution</h1>
          <p className="text-sm text-gray-500">{total} disputes</p>
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
            <option value="DISPUTED_MANUAL">Disputed</option>
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
        data={disputes}
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
        emptyMessage="No disputes found"
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