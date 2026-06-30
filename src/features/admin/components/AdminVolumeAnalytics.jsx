import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { formatKES } from '../../../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartWrapper from '../../../components/charts/ChartWrapper';

function VolumeBarChart({ data }) {
  if (!data?.length) return null;
  const chartData = data.map((d) => ({ ...d, volume: Number(d.volume) }));
  return (
    <ChartWrapper height={180}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCCC" />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#A18E7B' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#A18E7B' }} tickLine={false} axisLine={false}
          tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8DCCC' }}
          formatter={(value) => [`KES ${formatKES(value)}`, 'Volume']} />
        <Bar dataKey="volume" fill="#C67B5C" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartWrapper>
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
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">No volume data</div>
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
                  <span className="text-xs text-gray-500">{item.date ? new Date(item.date).toLocaleDateString() : '—'}</span>
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