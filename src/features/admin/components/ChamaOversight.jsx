import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, RefreshCw } from 'lucide-react';
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
  const total = chamasData?.pagination?.count ?? chamasData?.count ?? chamas.length;

  const columns = [
    {
      key: 'chama_name',
      header: 'Chama',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate text-sm">{row.chama_name}</p>
          <p className="text-xs text-gray-400">{row.chama_type}</p>
        </div>
      ),
    },
    {
      key: 'total_members',
      header: 'Members',
      render: (value) => <span className="text-sm font-medium text-slate">{value?.toLocaleString() || '0'}</span>,
    },
    {
      key: 'total_savings',
      header: 'Savings',
      render: (value) => <span className="text-sm font-bold text-slate">{formatKES(value)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge
          className={
            value === 'active'
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-danger/10 text-danger border border-danger/20'
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
    <div className="flex items-center gap-2 justify-end">
      {row.status === 'active' ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert hover:text-alert/80 hover:bg-alert/5 transition-all rounded-lg font-medium"
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
          className="text-success hover:text-success/80 hover:bg-success/5 transition-all rounded-lg font-medium"
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
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
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