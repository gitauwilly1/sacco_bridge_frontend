import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatKES, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const riskColors = {
  low: 'bg-success/10 text-success',
  medium: 'bg-alert/10 text-alert',
  high: 'bg-danger/10 text-danger',
  critical: 'bg-danger/10 text-danger border-danger/30',
};

const statusColors = {
  pending: 'bg-alert/10 text-alert',
  approved: 'bg-success/10 text-success',
  blocked: 'bg-danger/10 text-danger',
};

export default function FraudReview() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState('all');

  const {
    data: assessmentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-fraud', page, search, riskLevel],
    queryFn: () =>
      adminApi
        .getFraudAssessments({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(riskLevel !== 'all' && { risk_level: riskLevel }),
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
  const total = assessmentsData?.count || assessments.length;

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      render: (value) => <span className="font-mono text-xs">#{value}</span>,
    },
    {
      key: 'user_name',
      header: 'User',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate text-sm">{row.user_name || '—'}</p>
          <p className="text-xs text-gray-500">{row.transaction_type || row.type}</p>
        </div>
      ),
    },
    {
      key: 'risk_level',
      header: 'Risk',
      render: (value) => (
        <Badge className={riskColors[value] || 'bg-gray-100'} variant="outline">
          {value?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => (
        <span className="text-sm font-semibold">{value ? formatKES(value) : '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={statusColors[value] || 'bg-gray-100'} variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Detected',
      render: (value) => <span className="text-xs text-gray-500">{formatTimeAgo(value)}</span>,
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      {row.status === 'pending' && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-success"
            onClick={() => reviewMutation.mutate({ id: row.id, action: 'approve' })}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-danger"
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
            value={riskLevel}
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All Risks</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
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
      />
    </div>
  );
}