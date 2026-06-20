import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HandCoins, Ban, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatDate } from '../../../utils/format';
import DataTable from './DataTable';

export default function ChamaOversight() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const {
    data: chamasData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-chamas', page, search, status],
    queryFn: () =>
      adminApi
        .getChamasAdmin({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
  });

  const manageMutation = useMutation({
    mutationFn: ({ chamaId, action }) => adminApi.manageChama(chamaId, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chamas'] });
      toast.success('Chama updated');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const chamas = chamasData?.results || chamasData?.data || [];
  const total = chamasData?.count || chamas.length;

  const columns = [
    {
      key: 'chama_name',
      header: 'Chama',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate text-sm">{row.chama_name}</p>
          <p className="text-xs text-gray-500">{row.chama_type}</p>
        </div>
      ),
    },
    {
      key: 'total_members',
      header: 'Members',
      render: (value) => <span className="text-sm">{value?.toLocaleString() || '0'}</span>,
    },
    {
      key: 'total_savings',
      header: 'Savings',
      render: (value) => <span className="text-sm font-semibold">{formatKES(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          className={
            value === 'active'
              ? 'bg-success/10 text-success'
              : 'bg-danger/10 text-danger'
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
      sortable: true,
      render: (value) => <span className="text-xs text-gray-500">{formatDate(value)}</span>,
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      {row.status === 'active' ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert"
          onClick={() => {
            if (window.confirm(`Suspend ${row.chama_name}?`)) {
              manageMutation.mutate({ chamaId: row.id, action: 'suspend' });
            }
          }}
        >
          <Ban className="h-3 w-3 mr-1" /> Suspend
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="text-success"
          onClick={() => manageMutation.mutate({ chamaId: row.id, action: 'reactivate' })}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" /> Reactivate
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Chama Oversight</h1>
          <p className="text-sm text-gray-500">{total} chamas</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={chamas}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={15}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        emptyMessage="No chamas found"
        rowActions={rowActions}
      />
    </div>
  );
}