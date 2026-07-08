import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCw, User, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';
import DataTable from './DataTable';
import { KYC_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function AdminKYCList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('pending');

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () =>
      adminApi
        .getUsers({
          page,
          page_size: 20,
          ...(search && { search }),
        })
        .then((r) => r.data),
  });

  const manageMutation = useMutation({
    mutationFn: ({ userId, action }) => adminApi.manageUser(userId, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('KYC status updated');
    },
    onError: () => toast.error('Action failed'),
  });

  const allUsers = usersData?.results || usersData?.data || [];
  const filteredUsers = kycFilter === 'all'
    ? allUsers
    : allUsers.filter((u) => (u.kyc_status || 'unverified') === kycFilter);
  const total = usersData?.pagination?.count ?? usersData?.count ?? allUsers.length;

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
            <User className="h-4 w-4 text-terracotta/60" />
          </div>
          <div>
            <p className="font-bold text-slate text-xs">
              {row.first_name || ''} {row.last_name || ''}
            </p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{row.email || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'kyc_status',
      header: 'KYC Status',
      render: (value) => (
        <Badge
          className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-none ${getStatusColor(value, KYC_COLORS)}`}
          variant="outline"
        >
          {value || 'unverified'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (value) => (
        <span className="text-[11px] text-gray-405 font-medium font-numbers">{value ? formatDate(value) : '—'}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1.5 justify-end">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate({ to: `/admin/users/${row.id}` })}
        className="text-slate/75 hover:text-terracotta hover:bg-sand-light/50 h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
      >
        <Eye className="h-3.5 w-3.5 mr-1" /> View
      </Button>
      {(row.kyc_status || 'unverified') === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success hover:bg-success/10 hover:text-success h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
            onClick={() => {
              if (window.confirm(`Verify identity for ${row.first_name || row.email}?`)) {
                manageMutation.mutate({ userId: row.id, action: 'verify_identity' });
              }
            }}
            disabled={manageMutation.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verify
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10 hover:text-danger h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
            onClick={() => {
              if (window.confirm(`Reject identity for ${row.first_name || row.email}?`)) {
                manageMutation.mutate({ userId: row.id, action: 'reject_identity' });
              }
            }}
            disabled={manageMutation.isPending}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">KYC Verification</h1>
          <p className="text-sm text-gray-500">{total} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={kycFilter}
            onChange={(e) => {
              setKycFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-sand-dark/30 rounded-xl px-2.5 py-1.5 bg-white text-slate font-bold cursor-pointer focus:ring-1 focus:ring-terracotta"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="all">All</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-sand hover:bg-sand-light text-slate cursor-pointer h-8 w-8 p-0 rounded-lg">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={filteredUsers.length}
        page={page}
        onPageChange={setPage}
        pageSize={20}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        emptyMessage="No users match the filter"
        rowActions={rowActions}
      />
    </div>
  );
}
