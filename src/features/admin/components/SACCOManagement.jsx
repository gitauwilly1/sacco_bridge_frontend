import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Building2, CheckCircle2, XCircle, Upload, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';
import DataTable from './DataTable';

const tierColors = {
  1: 'bg-success/10 text-success',
  2: 'bg-blue-500/10 text-blue-500',
  3: 'bg-alert/10 text-alert',
};

export default function SACCOManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const {
    data: saccosData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-saccos', page, search, status],
    queryFn: () =>
      adminApi
        .getSACCOsAdmin({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifySACCO(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      toast.success('SACCO verified');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, suspend }) => adminApi.suspendSACCO(id, { suspend }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      toast.success('SACCO updated');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const saccos = saccosData?.results || saccosData?.data || [];
  const total = saccosData?.count || saccos.length;

  const columns = [
    {
      key: 'name',
      header: 'SACCO',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-sand-light flex items-center justify-center">
            <Building2 className="h-4 w-4 text-terracotta" />
          </div>
          <div>
            <p className="font-medium text-slate text-sm">{row.name}</p>
            <p className="text-xs text-gray-500">{row.registration_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'sasra_tier',
      header: 'Tier',
      render: (value) => (
        <Badge className={tierColors[value] || 'bg-gray-100'} variant="outline">
          Tier {value}
        </Badge>
      ),
    },
    {
      key: 'verified',
      header: 'Status',
      render: (value) => (
        <Badge
          className={value ? 'bg-success/10 text-success' : 'bg-alert/10 text-alert'}
          variant="outline"
        >
          {value ? 'Verified' : 'Pending'}
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
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate({ to: `/admin/saccos/${row.id}` })}
      >
        View
      </Button>
      {!row.verified && (
        <Button
          size="sm"
          variant="ghost"
          className="text-success"
          onClick={() => verifyMutation.mutate(row.id)}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">SACCO Management</h1>
          <p className="text-sm text-gray-500">{total} SACCOs</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={saccos}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={15}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        emptyMessage="No SACCOs found"
        rowActions={rowActions}
      />
    </div>
  );
}