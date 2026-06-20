import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Users, Shield, CheckCircle2, XCircle, Ban,
  UserPlus, RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const roleColors = {
  PLATFORM_ADMIN: 'bg-danger/10 text-danger',
  SUPPORT_AGENT: 'bg-blue-500/10 text-blue-500',
  MEMBER: 'bg-gray-100 text-gray-600',
};

const statusColors = {
  active: 'bg-success/10 text-success',
  suspended: 'bg-alert/10 text-alert',
  deactivated: 'bg-gray-200 text-gray-600',
};

export default function UserList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

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
        })
        .then((r) => r.data),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, suspend }) =>
      adminApi.manageUser(userId, { action: suspend ? 'suspend' : 'activate' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Action failed'
      );
    },
  });

  const users = usersData?.results || usersData?.data || [];
  const total = usersData?.count || users.length;

  const columns = [
    {
      key: 'full_name',
      header: 'User',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sand-light flex items-center justify-center">
            <span className="text-xs font-bold text-terracotta">
              {row.first_name?.[0]}{row.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate">
              {row.first_name} {row.last_name}
            </p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (value) => (
        <Badge className={roleColors[value] || 'bg-gray-100 text-gray-600'} variant="outline">
          {value?.replace('_', ' ') || 'Member'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge className={statusColors[value] || 'bg-gray-100 text-gray-600'} variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'kyc_status',
      header: 'KYC',
      render: (value) => (
        <Badge
          className={
            value === 'verified'
              ? 'bg-success/10 text-success'
              : value === 'pending'
              ? 'bg-alert/10 text-alert'
              : 'bg-gray-100 text-gray-500'
          }
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
        <span className="text-xs text-gray-500">{formatDate(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => navigate({ to: `/admin/users/${row.id}` })}
      >
        View
      </Button>
      {row.status === 'active' ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert"
          onClick={() => {
            if (window.confirm(`Suspend ${row.first_name} ${row.last_name}?`)) {
              suspendMutation.mutate({ userId: row.id, suspend: true });
            }
          }}
        >
          Suspend
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="text-success"
          onClick={() => {
            suspendMutation.mutate({ userId: row.id, suspend: false });
          }}
        >
          Activate
        </Button>
      )}
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
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
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
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
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
      />
    </div>
  );
}