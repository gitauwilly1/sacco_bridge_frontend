import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SearchInput from '@/components/ui/SearchInput';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { adminApi } from '../api/adminApi';
import { formatKES, formatDate } from '../../../utils/format';
import { toast } from 'sonner';

const statusColors = {
  COMPLETED: 'bg-success/10 text-success',
  PENDING: 'bg-warning/10 text-warning',
  DISPUTED: 'bg-alert/10 text-alert',
  REVERSED: 'bg-gray-100 text-gray-500',
};

export default function AdminSettlementList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [days, setDays] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-settlements', page, search, days],
    queryFn: () => adminApi.getAdminSettlements({ page, search, ...(days !== 'all' && { days }) }).then((r) => r.data),
  });

  const rawData = data?.data || data;
  const settlements = Array.isArray(rawData) ? rawData : rawData?.results || [];
  const totalPages = rawData?.total_pages || 1;
  const totalCount = rawData?.count || settlements.length;

  const handleExport = async () => {
    try {
      const res = await adminApi.getAdminExport({ type: 'settlements' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settlements-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost" size="sm"
            onClick={() => navigate({ to: '/admin' })}
            className="text-xs text-gray-500 hover:text-slate mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <h1 className="text-lg font-bold text-slate">Settlements</h1>
          <p className="text-xs text-gray-400">{totalCount} total</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Review and manage settlement transactions across the platform</p>
        </div>
        <Button
          variant="outline" size="sm"
          onClick={handleExport}
          className="border-sand/40 text-slate text-xs"
        >
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search settlements..." className="flex-1" />
        <div className="flex items-center gap-2">
          <DateRangeFilter value={days} onChange={(v) => { setDays(v); setPage(1); }} />
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-sand hover:bg-sand-light text-slate h-9 w-9 p-0 rounded-xl">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      )}

      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-red-500 mb-2">Failed to load settlements</p>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="border-sand/40 text-xs">Retry</Button>
        </div>
      )}

      {!error && (
        <>
          <div className="space-y-2">
            {settlements.map((s) => (
              <Card
                key={s.id}
                className="border-sand bg-white shadow-subtle rounded-xl cursor-pointer hover:border-terracotta/30 transition-colors"
                onClick={() => s.settlement_id && navigate({ to: `/transactions/${s.settlement_id}` })}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${(statusColors[s.status] || 'bg-gray-100')}`}>
                        <div className={`h-2 w-2 rounded-full ${s.status === 'COMPLETED' ? 'bg-success' : s.status === 'PENDING' ? 'bg-warning' : s.status === 'DISPUTED' ? 'bg-alert' : 'bg-gray-400'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate truncate">{s.sender_name || s.sender || s.from_user || '—'}</p>
                          <span className="text-gray-300 text-xs">&rarr;</span>
                          <p className="text-sm font-semibold text-slate truncate">{s.recipient_name || s.recipient || s.to_user || '—'}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatKES(s.amount || s.total)} {s.fee && `· Fee: ${formatKES(s.fee)}`} · {formatDate(s.created_at || s.date)}
                        </p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] font-semibold rounded-full border-0 flex-shrink-0 ml-2 ${statusColors[s.status] || 'bg-gray-100 text-gray-500'}`}>
                      {s.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoading && settlements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No settlements found</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                    p === page ? 'bg-terracotta text-white' : 'bg-sand-light text-slate hover:bg-sand'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}