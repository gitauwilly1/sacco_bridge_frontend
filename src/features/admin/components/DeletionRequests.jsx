import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';
import { DELETION_REQUEST_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function DeletionRequests() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-deletion-requests', page, search, status],
    queryFn: () =>
      adminApi
        .getDeletionRequests({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
        })
        .then((r) => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }) =>
      adminApi.reviewDeletionRequest(id, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deletion-requests'] });
      toast.success('Request reviewed');
    },
    onError: (error) =>
      toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const requests = requestsData?.results || requestsData?.data || [];
  const total = requestsData?.pagination?.count ?? requestsData?.count ?? requests.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      sortable: true,
      render: (value) => <span className="font-mono text-xs font-semibold text-slate/75">#{value}</span>,
    },
    {
      key: 'user_name',
      header: 'User',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate text-sm">
            {row.user_name || row.user_email}
          </p>
          <p className="text-xs text-gray-400">{row.user_email}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value) => (
        <p className="text-sm font-medium text-slate max-w-[200px] truncate">
          {value || '—'}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge
          className={`${getStatusColor(value, DELETION_REQUEST_COLORS)} border`}
          variant="outline"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'requested_at',
      header: 'Requested',
      sortable: true,
      render: (_, row) => (
        <span className="text-xs text-gray-500 font-medium">
          {formatTimeAgo(row.requested_at || row.created_at)}
        </span>
      ),
    },
    {
      key: 'expires_at',
      header: 'Expires',
      render: (value) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Clock className="h-3.5 w-3.5 text-gray-400" />
          {value ? formatDate(value) : '—'}
        </div>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-2 justify-end">
      {row.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success hover:text-success/80 hover:bg-success/5 transition-all rounded-lg font-semibold"
            onClick={() => {
              if (window.confirm('Approve this deletion request?')) {
                reviewMutation.mutate({ id: row.id, action: 'approve' });
              }
            }}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:text-danger/80 hover:bg-danger/5 transition-all rounded-lg font-semibold"
            onClick={() => {
              if (window.confirm('Reject this deletion request?')) {
                reviewMutation.mutate({ id: row.id, action: 'reject' });
              }
            }}
          >
            <XCircle className="h-3 w-3 mr-1" /> Reject
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Deletion Requests</h1>
          <p className="text-sm text-gray-500">{total} requests</p>
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
        data={requests}
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
        emptyMessage="No deletion requests"
        rowActions={rowActions}
        onRowClick={(row) => navigate({ to: `/admin/deletion-requests/${row.id}` })}
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