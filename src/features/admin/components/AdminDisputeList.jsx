import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const disputeStatusColors = {
  open: 'bg-danger/10 text-danger border-danger/20',
  under_review: 'bg-alert/10 text-alert border-alert/20',
  resolved: 'bg-success/10 text-success border-success/20',
  closed: 'bg-sand text-slate border-sand-dark/20',
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
  const total = disputesData?.pagination?.count ?? disputesData?.count ?? disputes.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (value) => <span className="font-mono text-xs font-semibold text-slate/75">#{value}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (_, row) => (
        <div>
          <p className="text-sm font-semibold text-slate">
            {row.reason_display || row.reason}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[200px]">
            {row.description}
          </p>
        </div>
      ),
    },
    {
      key: 'sacco_name',
      header: 'SACCO',
      render: (value) => <span className="text-sm font-medium text-slate">{value || '—'}</span>,
    },
    {
      key: 'settlement_amount',
      header: 'Amount',
      render: (value) => (
        <span className="text-sm font-bold text-slate">{formatKES(value)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          className={`${disputeStatusColors[value] || 'bg-sand text-slate border-sand-dark/20'} border`}
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
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
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
      />
    </div>
  );
}