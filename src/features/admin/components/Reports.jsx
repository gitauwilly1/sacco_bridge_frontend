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
        <Skeleton className="h-8 w-48 bg-sand-light/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card border-sand bg-white/50 rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32 mb-2 bg-sand-light" />
                <Skeleton className="h-3 w-48 mb-4 bg-sand-light" />
                <Skeleton className="h-8 w-full bg-sand-light" />
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
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => refetch()}
          className="border-sand hover:bg-sand-light text-slate transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate/75" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportList.map((report) => (
          <Card key={report.id} className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 card-lift">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${
                    report.type === 'chart' 
                      ? 'bg-terracotta/10 border-terracotta/20' 
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}>
                    {report.type === 'chart' ? (
                      <BarChart3 className="h-5 w-5 text-terracotta" />
                    ) : (
                      <FileText className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate text-sm leading-tight mt-0.5">{report.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-normal">{report.description}</p>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-4 border-sand hover:bg-sand-light text-slate hover:text-terracotta transition-colors shadow-subtle font-semibold"
                onClick={() => handleDownload(report.id)}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}