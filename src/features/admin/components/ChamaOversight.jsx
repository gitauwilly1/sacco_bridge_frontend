import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatDate } from '../../../utils/format';
import DataTable from './DataTable';
import { CHAMA_STATUS_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function ChamaOversight() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());

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
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
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

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }) => adminApi.bulkManageChamas(Array.from(ids), action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chamas'] });
      setSelectedIds(new Set());
      toast.success('Chamas updated');
    },
    onError: () => toast.error('Bulk action failed'),
  });

  const chamas = chamasData?.results || chamasData?.data || [];
  const total = chamasData?.pagination?.count ?? chamasData?.count ?? chamas.length;

  const columns = [
    {
      key: 'name',
      header: 'Chama',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate text-sm">{row.name}</p>
          <p className="text-xs text-gray-400">{row.chama_type}</p>
        </div>
      ),
    },
    {
      key: 'member_count',
      header: 'Members',
      render: (value) => <span className="text-sm font-medium text-slate">{value?.toLocaleString() || '0'}</span>,
    },
    {
      key: 'total_savings',
      header: 'Savings',
      render: (value) => <span className="text-sm font-bold text-slate">{formatKES(value ?? 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={`${getStatusColor(value, CHAMA_STATUS_COLORS)} border`} variant="outline">
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
      {(row.status === 'active' || row.status === 'ACTIVE') ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert hover:text-alert/80 hover:bg-alert/5 transition-all rounded-lg font-medium"
          onClick={() => {
            if (window.confirm(`Suspend ${row.name}?`)) {
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

  const bulkActionBar = (ids) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="text-alert bg-alert/10 hover:bg-alert/20 border-0 text-xs font-semibold cursor-pointer h-8 rounded-lg"
        onClick={() => {
          if (window.confirm(`Suspend ${ids.size} chamas?`)) bulkMutation.mutate({ ids, action: 'suspend' });
        }}
        disabled={bulkMutation.isPending}
      >
        <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
      </Button>
      <Button
        size="sm"
        className="text-success bg-success/10 hover:bg-success/20 border-0 text-xs font-semibold cursor-pointer h-8 rounded-lg"
        onClick={() => {
          if (window.confirm(`Reactivate ${ids.size} chamas?`)) bulkMutation.mutate({ ids, action: 'reactivate' });
        }}
        disabled={bulkMutation.isPending}
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Reactivate
      </Button>
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
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
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
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(key, order) => {
          setSortKey(key);
          setSortOrder(order);
          setPage(1);
        }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActionBar={bulkActionBar}
      />
    </div>
  );
}