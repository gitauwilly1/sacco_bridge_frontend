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
      toast.loading('Preparing report...');
      const response = await adminApi.getReports();
      const reports = response.data.data || response.data;
      // Find report metadata; if download URL available, use it
      const reportList = Array.isArray(reports) ? reports : [];
      const report = reportList.find((r) => r.id === reportId);
      if (report?.download_url || report?.file || report?.url) {
        const url = report.download_url || report.file || report.url;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss();
        toast.success('Report download started');
      } else {
        // Fallback: export as JSON
        const blob = new Blob([JSON.stringify(report || response.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'report-' + reportId + '-' + Date.now() + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success('Report exported');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to download report');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-sand-light/60 animate-pulse" />
      {hasError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/5 border border-danger/20 text-xs text-danger">
          <span className="font-semibold">Failed to load reports from server.</span>
          <button onClick={() => refetch()} className="ml-auto underline hover:no-underline">Retry</button>
        </div>
      )}
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

  const hasError = !!error;
  const reportList = hasError ? fallbackReports : (Array.isArray(reports) ? reports : fallbackReports);

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

      {hasError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-danger/5 border border-danger/20 text-xs text-danger">
          <span className="font-semibold">Failed to load reports from server.</span>
          <button onClick={() => refetch()} className="ml-auto underline hover:no-underline">Retry</button>
        </div>
      )}

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
