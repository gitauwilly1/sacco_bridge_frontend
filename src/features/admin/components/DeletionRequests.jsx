import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const statusColors = {
  pending: 'bg-alert/10 text-alert',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-gray-200 text-gray-600',
};

export default function DeletionRequests() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

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
  const total = requestsData?.count || requests.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (value) => <span className="font-mono text-xs">#{value}</span>,
    },
    {
      key: 'user_name',
      header: 'User',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate text-sm">
            {row.user_name || row.user_email}
          </p>
          <p className="text-xs text-gray-500">{row.user_email}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value) => (
        <p className="text-sm text-slate max-w-[200px] truncate">
          {value || '—'}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          className={statusColors[value] || 'bg-gray-100 text-gray-600'}
          variant="outline"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'requested_at',
      header: 'Requested',
      render: (_, row) => (
        <span className="text-xs text-gray-500">
          {formatTimeAgo(row.requested_at || row.created_at)}
        </span>
      ),
    },
    {
      key: 'expires_at',
      header: 'Expires',
      render: (value) => (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {value ? formatDate(value) : '—'}
        </div>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      {row.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success"
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
            className="text-danger"
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
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
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
      />
    </div>
  );
}