import { useState } from 'react';
import { Download, FileJson } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';

export default function DataExport() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await profileApi.exportData();
      const jsonData = data.data || data;
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sacco-bridge-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="border-sand bg-white shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
          <FileJson className="h-4.5 w-4.5 text-terracotta" />
          Export My Data
        </CardTitle>
        <CardDescription className="text-xs text-gray-400 font-medium leading-relaxed">
          Download all your personal data including profile, chamas, contributions,
          loans, investments, and settlements in JSON format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          id="data-export-btn"
          onClick={handleExport}
          disabled={exporting}
          className="w-full bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-10 rounded-xl text-xs font-semibold"
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
}