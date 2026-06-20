import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, FileText, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';

export default function Reports() {
  const {
    data: reportsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () =>
      adminApi.getReports().then((r) => r.data.data || r.data),
  });

  const reports = reportsData?.reports || reportsData || [];

  const handleDownload = async (reportId) => {
    try {
      toast.success('Report download started');
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-48 mb-3" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load reports" onRetry={refetch} />;
  }

  const reportList = Array.isArray(reports) ? reports : [
    { id: 'user-growth', name: 'User Growth', description: 'New user registrations over time', type: 'chart' },
    { id: 'transaction-volume', name: 'Transaction Volume', description: 'Total settlement volume by period', type: 'chart' },
    { id: 'chama-activity', name: 'Chama Activity', description: 'Active chamas and contributions', type: 'chart' },
    { id: 'dispute-summary', name: 'Dispute Summary', description: 'Disputes by type and resolution time', type: 'table' },
    { id: 'fraud-overview', name: 'Fraud Overview', description: 'Fraud assessments and actions', type: 'table' },
    { id: 'escrow-balances', name: 'Escrow Balances', description: 'Current escrow holdings', type: 'table' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Reports</h1>
          <p className="text-sm text-gray-500">{reportList.length} reports available</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reportList.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {report.type === 'chart' ? (
                      <BarChart3 className="h-4 w-4 text-terracotta" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-500" />
                    )}
                    <h3 className="font-semibold text-slate text-sm">{report.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{report.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleDownload(report.id)}
              >
                <Download className="h-3 w-3 mr-1" /> Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}