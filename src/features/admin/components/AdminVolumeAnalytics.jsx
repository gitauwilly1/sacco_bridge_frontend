import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { formatKES } from '../../../utils/format';

function VolumeBarChart({ data, width = 300, height = 160 }) {
  if (!data?.length) return null;
  const values = data.map((d) => Number(d.volume));
  const max = Math.max(...values, 1);
  const barWidth = Math.max(8, (width / values.length) * 0.65);
  const gap = (width / values.length) * 0.35;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      {values.map((v, i) => {
        const barH = ((v / max) * (height - 20));
        const x = i * (barWidth + gap) + gap / 2;
        const y = height - barH;
        return (
          <rect key={i} x={x.toFixed(1)} y={y.toFixed(1)} width={barWidth.toFixed(1)}
            height={barH.toFixed(1)} rx="3" fill="#C67B5C" className="animate-fade-up"
            style={{ animationDelay: `${i * 0.03}s` }}>
            <title>{`${data[i].date}: KES ${formatKES(v)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}

export default function AdminVolumeAnalytics() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-volume', days],
    queryFn: () =>
      adminApi.getAdminVolume({ days }).then((r) => {
        const d = r.data.data || r.data;
        return Array.isArray(d) ? d : [];
      }),
  });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>;
  if (error) return <ErrorState message="Failed to load volume analytics" onRetry={refetch} />;

  const totals = (data || []).reduce(
    (acc, item) => ({
      volume: acc.volume + Number(item.volume || 0),
      fees: acc.fees + Number(item.fees || 0),
      count: acc.count + (item.count || 0),
    }),
    { volume: 0, fees: 0, count: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Transaction Volume</h1>
          <p className="text-sm text-gray-500">Daily settlement volume trends</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(d)}
              className={`text-xs ${days === d ? 'bg-terracotta text-white' : 'border-sand/40'}`}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-terracotta" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Volume</p>
            </div>
            <p className="text-xl font-extrabold text-slate font-numbers">{formatKES(totals.volume)}</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-success" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Transactions</p>
            </div>
            <p className="text-xl font-extrabold text-slate font-numbers">{totals.count.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Fees</p>
            </div>
            <p className="text-xl font-extrabold text-slate font-numbers">{formatKES(totals.fees)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume chart */}
      <Card className="border-sand bg-white shadow-subtle rounded-2xl">
        <CardHeader className="pb-2 border-b border-sand/40">
          <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-terracotta" />
            Daily Volume ({days} days)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {data?.length > 0 ? (
            <VolumeBarChart data={data} />
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-gray-400">No volume data</div>
          )}
        </CardContent>
      </Card>

      {/* Volume table */}
      {data?.length > 0 && (
        <Card className="border-sand bg-white shadow-subtle rounded-2xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-sand max-h-80 overflow-y-auto">
              {data.slice().reverse().map((item) => (
                <div key={item.date} className="flex items-center justify-between px-4 py-2.5 hover:bg-sand-light/25">
                  <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="font-semibold text-slate w-24 text-right">{formatKES(item.volume)}</span>
                    <span className="text-gray-400 w-16 text-right">{item.count} txns</span>
                    <span className="text-gray-400 w-20 text-right">{formatKES(item.fees)} fees</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}