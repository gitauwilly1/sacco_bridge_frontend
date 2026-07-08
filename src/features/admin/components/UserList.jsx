import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { RefreshCw, User, Ban, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';
import { ROLE_COLORS } from '../../../utils/permissions';
import { USER_STATUS_COLORS, KYC_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function UserList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-users', page, search, role, status],
    queryFn: () =>
      adminApi
        .getUsers({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(role !== 'all' && { role }),
          ...(status !== 'all' && { status }),
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
        })
        .then((r) => r.data),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, action }) => adminApi.bulkManageUsers(Array.from(ids), action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedIds(new Set());
      toast.success('Users updated');
    },
    onError: () => toast.error('Bulk action failed'),
  });

  const users = usersData?.results || usersData?.data || [];
  const total = usersData?.pagination?.count ?? usersData?.count ?? users.length;

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      sortable: true,
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
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value, row) => {
        const displayRole = row.roles?.[0] || value;
        return (
          <Badge className={`${ROLE_COLORS[displayRole] || 'bg-gray-100 text-gray-600 border-gray-200'} text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-none`} variant="outline">
            {displayRole?.replace('_', ' ') || 'Member'}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge className={`${getStatusColor(value, USER_STATUS_COLORS)} text-[10px] font-extrabold rounded-full px-2 py-0.5 shadow-none`} variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'kyc_status',
      header: 'KYC',
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
      sortable: true,
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
        View
      </Button>
      {row.status === 'active' ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert hover:bg-alert/10 hover:text-alert h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
          onClick={() => {
            if (window.confirm(`Suspend ${row.first_name} ${row.last_name}?`)) {
              bulkMutation.mutate({ ids: new Set([row.id]), action: 'suspend' });
            }
          }}
        >
          Suspend
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="text-success hover:bg-success/10 hover:text-success h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
          onClick={() => {
            bulkMutation.mutate({ ids: new Set([row.id]), action: 'activate' });
          }}
        >
          Activate
        </Button>
      )}
    </div>
  );

  const bulkActionBar = (ids) => (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="text-success bg-success/10 hover:bg-success/20 border-0 text-xs font-semibold cursor-pointer h-8 rounded-lg"
        onClick={() => bulkMutation.mutate({ ids, action: 'activate' })}
        disabled={bulkMutation.isPending}
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Activate
      </Button>
      <Button
        size="sm"
        className="text-alert bg-alert/10 hover:bg-alert/20 border-0 text-xs font-semibold cursor-pointer h-8 rounded-lg"
        onClick={() => {
          if (window.confirm(`Suspend ${ids.size} users?`)) {
            bulkMutation.mutate({ ids, action: 'suspend' });
          }
        }}
        disabled={bulkMutation.isPending}
      >
        <Ban className="h-3.5 w-3.5 mr-1" /> Suspend
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">User Management</h1>
          <p className="text-sm text-gray-500">{total} total users</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-sand-dark/30 rounded-xl px-2.5 py-1.5 bg-white text-slate font-bold cursor-pointer focus:ring-1 focus:ring-terracotta"
          >
            <option value="all">All Roles</option>
            <option value="PLATFORM_ADMIN">Admin</option>
            <option value="SUPPORT_AGENT">Support</option>
            <option value="MEMBER">Member</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-sand-dark/30 rounded-xl px-2.5 py-1.5 bg-white text-slate font-bold cursor-pointer focus:ring-1 focus:ring-terracotta"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-sand hover:bg-sand-light text-slate cursor-pointer h-8 w-8 p-0 rounded-lg">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
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
        emptyMessage="No users found"
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