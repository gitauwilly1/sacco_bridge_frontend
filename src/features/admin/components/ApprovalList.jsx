import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const STATUS_COLORS = {
  PENDING: 'bg-amber/10 text-amber border-amber/20',
  APPROVED: 'bg-success/10 text-success border-success/20',
  REJECTED: 'bg-alert/10 text-alert border-alert/20',
};

export default function ApprovalList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('PENDING');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-approvals', page, status],
    queryFn: () =>
      adminApi.getApprovals({ page, status }).then((r) => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, notes }) => adminApi.reviewApproval(id, action, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      toast.success('Review recorded');
    },
    onError: (error) => toast.error(error.response?.data?.error || 'Review failed'),
  });

  const approvals = data?.results || [];
  const total = data?.count ?? approvals.length;

  const columns = [
    {
      key: 'action_display',
      header: 'Action',
      render: (value, row) => (
        <div>
          <p className="text-sm font-bold text-slate">{value}</p>
          <p className="text-xs text-gray-400">{row.target_repr}</p>
        </div>
      ),
    },
    {
      key: 'requested_by_name',
      header: 'Requested By',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={`${STATUS_COLORS[value] || 'bg-gray-100 text-gray-600'} text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-none border`} variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Requested',
      render: (value) => (
        <span className="text-xs text-gray-500">{value ? formatTimeAgo(value) : '—'}</span>
      ),
    },
  ];

  const rowActions = (row) => {
    if (row.status !== 'PENDING') return null;
    return (
      <div className="flex items-center gap-1.5 justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="text-success hover:bg-success/10 h-8 rounded-lg text-xs font-semibold cursor-pointer"
          onClick={() => {
            if (window.confirm(`Approve this ${row.action_display}?`)) {
              reviewMutation.mutate({ id: row.id, action: 'approve' });
            }
          }}
          disabled={reviewMutation.isPending}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-alert hover:bg-alert/10 h-8 rounded-lg text-xs font-semibold cursor-pointer"
          onClick={() => {
            const notes = window.prompt('Reason for rejection (optional):');
            reviewMutation.mutate({ id: row.id, action: 'reject', notes: notes || '' });
          }}
          disabled={reviewMutation.isPending}
        >
          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Approvals</h1>
          <p className="text-sm text-gray-500">{total} pending</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium cursor-pointer"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-sand hover:bg-sand-light cursor-pointer h-8 w-8 p-0 rounded-lg">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={approvals}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        emptyMessage="No approval requests"
        rowActions={rowActions}
      />
    </div>
  );
}
