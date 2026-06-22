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
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-alert/10 text-alert border-alert/20',
  high: 'bg-danger/10 text-danger border-danger/20',
  critical: 'bg-danger/10 text-danger border border-danger/30',
};

const statusColors = {
  pending: 'bg-alert/10 text-alert border-alert/20',
  approved: 'bg-success/10 text-success border-success/20',
  blocked: 'bg-danger/10 text-danger border-danger/20',
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
      render: (value) => (
        <Badge className={`${riskColors[value] || 'bg-sand text-slate border-sand-dark/20'} border`} variant="outline">
          {value?.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => (
        <span className="text-sm font-bold text-slate">{value ? formatKES(value) : '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <Badge className={`${statusColors[value] || 'bg-sand text-slate border-sand-dark/20'} border`} variant="outline">
          {value}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Detected',
      render: (value) => <span className="text-xs text-gray-500 font-medium">{formatTimeAgo(value)}</span>,
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-2 justify-end">
      {row.status === 'pending' && (
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
            value={riskLevel}
            onChange={(e) => { setRiskLevel(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All Risks</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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
      />
    </div>
  );
}