import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';
import { RISK_COLORS, FRAUD_STATUS_COLORS, getStatusColor } from '../../../utils/statusMapping';

export default function FraudReview() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('all');
  const [fraudStatus, setFraudStatus] = useState('pending');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const {
    data: assessmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-fraud', page, search, riskLevel, fraudStatus],
    queryFn: () =>
      adminApi
        .getFraudAssessments({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(riskLevel !== 'all' && { risk_level: riskLevel }),
          ...(fraudStatus !== 'all' && { status: fraudStatus }),
          ...(sortKey && { ordering: sortOrder === 'desc' ? `-${sortKey}` : sortKey }),
        })
        .then((r) => r.data),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }) => adminApi.reviewFraudAssessment(id, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fraud'] });
      toast.success('Assessment reviewed');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Action failed'),
  });

  const assessments = assessmentsData?.results || assessmentsData?.data || [];
  const total = assessmentsData?.pagination?.count ?? assessmentsData?.count ?? assessments.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      sortable: true,
      render: (value) => <span className="font-mono text-xs font-semibold text-slate/75">#{value}</span>,
    },
    {
      key: 'user_name',
      header: 'User',
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate text-sm">{row.user_name || '—'}</p>
          <p className="text-xs text-gray-400">{row.transaction_type || row.type}</p>
        </div>
      ),
    },
    {
      key: 'risk_level',
      header: 'Risk',
      sortable: true,
      render: (value) => (
        <Badge className={`${getStatusColor(value, RISK_COLORS)} border`} variant="outline">
          {value?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      render: (value) => (
        <span className="text-sm font-bold text-slate">{value ? formatKES(value) : '—'}</span>
      ),
    },
    {
      key: 'applied_action',
      header: 'Action',
      sortable: true,
      render: (value) => (
        <Badge className={`${getStatusColor(value, FRAUD_STATUS_COLORS)} border`} variant="outline">
          {value?.toLowerCase() || 'pending'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Detected',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(value)}</span>,
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-2 justify-end">
      {(!row.applied_action || row.applied_action === 'PENDING' || row.applied_action === 'ALLOW') && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success hover:text-success/80 hover:bg-success/5 transition-all rounded-lg font-semibold"
            onClick={() => reviewMutation.mutate({ id: row.id, action: 'approve' })}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:text-danger/80 hover:bg-danger/5 transition-all rounded-lg font-semibold"
            onClick={() => {
              if (window.confirm('Block this transaction?')) {
                reviewMutation.mutate({ id: row.id, action: 'block' });
              }
            }}
          >
            <XCircle className="h-3 w-3 mr-1" /> Block
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Fraud Review</h1>
          <p className="text-sm text-gray-500">{total} assessments</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={fraudStatus}
            onChange={(e) => { setFraudStatus(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="blocked">Blocked</option>
          </select>
          <select
            value={riskLevel}
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All Risks</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
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
        data={assessments}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={15}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        emptyMessage="No fraud assessments"
        rowActions={rowActions}
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