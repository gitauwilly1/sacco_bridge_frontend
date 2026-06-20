import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const disputeStatusColors = {
  open: 'bg-danger/10 text-danger',
  under_review: 'bg-alert/10 text-alert',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-gray-200 text-gray-600',
};

export default function AdminDisputeList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

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
        })
        .then((r) => r.data),
  });

  const disputes = disputesData?.results || disputesData?.data || [];
  const total = disputesData?.count || disputes.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (value) => <span className="font-mono text-xs">#{value}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-slate">
            {row.reason_display || row.reason}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: 'sacco_name',
      header: 'SACCO',
      render: (value) => <span className="text-sm">{value || '—'}</span>,
    },
    {
      key: 'settlement_amount',
      header: 'Amount',
      render: (value) => (
        <span className="text-sm font-semibold">{formatKES(value)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          className={disputeStatusColors[value] || 'bg-gray-100 text-gray-600'}
          variant="outline"
        >
          {value?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Filed',
      render: (value) => (
        <span className="text-xs text-gray-500">{formatTimeAgo(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <Button
      size="sm"
      variant="ghost"
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
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
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
      />
    </div>
  );
}