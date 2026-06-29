import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Building2, CheckCircle2, RefreshCw, MoreVertical, Ban, Trash2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';
import DataTable from './DataTable';

const tierColors = {
  1: 'bg-success/10 text-success border-success/20',
  2: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  3: 'bg-alert/10 text-alert border-alert/20',
};

const statusColors = {
  ACTIVE: 'bg-success/10 text-success border-success/20',
  SUSPENDED: 'bg-alert/10 text-alert border-alert/20',
  UNDER_REVIEW: 'bg-alert/10 text-alert border-alert/20',
  HALTED: 'bg-danger/10 text-danger border-danger/20',
};

function ActionsDropdown({ row, onVerify, onSuspend, onReactivate, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="h-8 w-8 p-0 rounded-lg hover:bg-sand-light cursor-pointer"
      >
        <MoreVertical className="h-4 w-4 text-slate/60" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white rounded-xl border border-sand/30 shadow-elevated py-1.5">
          {row.status === 'UNDER_REVIEW' && (
            <button
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-success hover:bg-success/5 transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => { setOpen(false); onVerify(row.id); }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Verify
            </button>
          )}
          {row.status !== 'SUSPENDED' ? (
            <button
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-alert hover:bg-alert/5 transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => { setOpen(false); if (window.confirm(`Suspend ${row.name}?`)) onSuspend(row.id); }}
            >
              <Ban className="h-3.5 w-3.5" /> Suspend
            </button>
          ) : (
            <button
              className="w-full text-left px-3.5 py-2 text-xs font-semibold text-success hover:bg-success/5 transition-colors flex items-center gap-2 cursor-pointer"
              onClick={() => { setOpen(false); if (window.confirm(`Reactivate ${row.name}?`)) onReactivate(row.id); }}
            >
              <Play className="h-3.5 w-3.5" /> Reactivate
            </button>
          )}
          <div className="border-t border-sand/30 my-1" />
          <button
            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-danger hover:bg-danger/5 transition-colors flex items-center gap-2 cursor-pointer"
            onClick={() => { setOpen(false); if (window.confirm(`Soft-delete ${row.name}? This can be undone.`)) onDelete(row.id); }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Soft Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function SACCOManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [tier, setTier] = useState('all');

  const {
    data: saccosData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-saccos', page, search, status, tier],
    queryFn: () =>
      adminApi
        .getSACCOsAdmin({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
          ...(tier !== 'all' && { sasra_tier: tier }),
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
    mutationFn: (id) => adminApi.suspendSACCO(id, { suspend: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      toast.success('SACCO suspended');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => adminApi.reactivateSACCO(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      toast.success('SACCO reactivated');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.softDeleteSACCO(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      toast.success('SACCO soft-deleted');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const saccos = saccosData?.results || saccosData?.data || [];
  const total = saccosData?.pagination?.count ?? saccosData?.count ?? saccos.length;

  const columns = [
    {
      key: 'name',
      header: 'SACCO',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sand-light flex items-center justify-center border border-sand">
            <Building2 className="h-4 w-4 text-terracotta" />
          </div>
          <div>
            <p className="font-semibold text-slate text-sm">{row.name}</p>
            <p className="text-xs text-gray-400">{row.registration_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'sasra_tier',
      header: 'Tier',
      render: (value) => (
        <Badge className={`${tierColors[value] || 'bg-sand text-slate border-sand-dark/20'} border`} variant="outline">
          Tier {value}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={`${statusColors[value] || 'bg-sand text-slate border-sand-dark/20'} border`} variant="outline">
          {value === 'ACTIVE' ? 'Verified' : value === 'UNDER_REVIEW' ? 'Pending' : value}
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
      <Button
        size="sm"
        variant="ghost"
        className="text-terracotta hover:text-clay hover:bg-sand-light transition-all rounded-lg cursor-pointer"
        onClick={() => navigate({ to: `/admin/saccos/${row.id}` })}
      >
        View
      </Button>
      <ActionsDropdown
        row={row}
        onVerify={(id) => verifyMutation.mutate(id)}
        onSuspend={(id) => suspendMutation.mutate(id)}
        onReactivate={(id) => reactivateMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
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
            value={tier}
            onChange={(e) => { setTier(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All Tiers</option>
            <option value={1}>Tier 1</option>
            <option value={2}>Tier 2</option>
            <option value={3}>Tier 3</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Verified</option>
            <option value="UNDER_REVIEW">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="HALTED">Halted</option>
          </select>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => refetch()}
            className="border-sand hover:bg-sand-light text-slate transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate/75" />
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
