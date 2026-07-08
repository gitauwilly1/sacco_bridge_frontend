import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, RefreshCw, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDateTime } from '../../../utils/format';
import DataTable from './DataTable';
import { ACTION_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: auditData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-audit', page, search, actionType, dateRange],
    queryFn: () =>
      adminApi
        .getUnifiedAudit({
          page,
          page_size: 20,
          ...(search && { search }),
          ...(actionType !== 'all' && { action: actionType }),
          ...(dateRange !== 'all' && { date_range: dateRange }),
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
        })
        .then((r) => r.data),
  });

  const handleExportCSV = async () => {
    try {
      const { data } = await adminApi.getUnifiedAudit({ page_size: 1000, format: 'csv' });
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audit log exported');
    } catch (err) {
      toast.error('Failed to export audit log');
    }
  };

  const entries = auditData?.results || auditData?.data || [];
  const total = auditData?.pagination?.count ?? auditData?.count ?? entries.length;

  const columns = [
    {
      key: 'timestamp',
      header: 'Time',
      width: '160px',
      sortable: true,
      render: (_, row) => (
        <span className="text-xs text-gray-500 font-medium">
          {formatDateTime(row.timestamp || row.created_at)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      width: '100px',
      sortable: true,
      render: (value) => (
        <Badge
          className={`${getStatusColor(value, ACTION_COLORS)} border`}
          variant="outline"
        >
          {value}
        </Badge>
      ),
    },
    {
      key: 'user',
      header: 'Actor',
      render: (_, row) => (
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate">
          <User className="h-3.5 w-3.5 text-gray-400" />
          <span>{row.user || row.user_email || 'System'}</span>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (_, row) => (
        <p className="text-sm text-slate font-medium max-w-[300px] truncate">
          {row.description || row.details || '—'}
        </p>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      width: '120px',
      render: (value) => (
        <span className="text-xs text-gray-400 font-mono">{value || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Audit & Compliance</h1>
          <p className="text-sm text-gray-500">{total} audit entries</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleExportCSV}
            className="border-sand hover:bg-sand-light text-slate hover:text-terracotta transition-colors shadow-subtle font-medium"
          >
            <Download className="h-3.5 w-3.5 mr-1 text-slate/75" /> Export CSV
          </Button>
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

      <div className="flex items-center gap-3">
        <select
          value={actionType}
          onChange={(e) => {
            setActionType(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="SUSPEND">Suspend</option>
          <option value="VERIFY">Verify</option>
          <option value="LOGIN">Login</option>
          <option value="FRAUD">Fraud</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => {
            setDateRange(e.target.value);
            setPage(1);
          }}
          className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={entries}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={20}
        searchValue={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        emptyMessage="No audit entries"
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={(key, order) => {
          setSortKey(key);
          setSortOrder(order);
          setPage(1);
        }}
      />
    </div>
  );
}