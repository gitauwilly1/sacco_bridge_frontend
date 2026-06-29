import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ChartWrapper from '../../../components/charts/ChartWrapper';

export default function SACCOMarketChart({ saccoId }) {
  const { data: analyticsResponse, isLoading } = useQuery({
    queryKey: ['sacco-analytics', saccoId],
    queryFn: () => investmentsApi.getSACCOAnalytics(saccoId).then((r) => r.data.data || r.data),
    enabled: !!saccoId,
  });

  if (isLoading) {
    return (
      <Card className="border-sand bg-white shadow-subtle p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </Card>
    );
  }

  const hasBackendData = Array.isArray(analyticsResponse) && analyticsResponse.length >= 2;
  const rawData = hasBackendData 
    ? analyticsResponse 
    : [
        { metric_date: '2026-06-01', average_price_per_share: 100.0, total_volume_shares: 5000 },
        { metric_date: '2026-06-05', average_price_per_share: 105.5, total_volume_shares: 6200 },
        { metric_date: '2026-06-10', average_price_per_share: 102.0, total_volume_shares: 4800 },
        { metric_date: '2026-06-15', average_price_per_share: 112.3, total_volume_shares: 8000 },
        { metric_date: '2026-06-20', average_price_per_share: 118.0, total_volume_shares: 9500 },
        { metric_date: '2026-06-25', average_price_per_share: 124.5, total_volume_shares: 11000 },
      ];

  const chartData = rawData.map((d) => ({
    date: new Date(d.metric_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    price: parseFloat(d.average_price_per_share || 0),
    volume: parseInt(d.total_volume_shares || 0, 10),
  }));

  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const percentageChange = firstPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
  const totalVolume = chartData.reduce((acc, curr) => acc + curr.volume, 0);

  return (
    <Card className="border-sand bg-white shadow-subtle overflow-hidden">
      <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-bold text-slate flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-terracotta" />
            Market Activity
          </CardTitle>
          <CardDescription className="text-[10px] text-gray-400">
            {hasBackendData ? 'Real-time share value history' : 'Simulated historical share value history'}
          </CardDescription>
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${percentageChange >= 0 ? 'text-success' : 'text-danger'}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate border-b border-sand-light pb-3">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">Average Price</span>
            <span className="text-sm font-extrabold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {formatKES(lastPrice)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-medium block">Total Vol. (30d)</span>
            <span className="text-sm font-extrabold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {totalVolume.toLocaleString()} shares
            </span>
          </div>
        </div>

        <ChartWrapper height={200}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C67B5C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C67B5C" stopOpacity="0.00" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 3" stroke="#E2D4C9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(v) => Math.round(v)} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8DCCC' }}
              formatter={(value, name) => [name === 'price' ? `KES ${formatKES(value)}` : value.toLocaleString(), name === 'price' ? 'Price' : 'Volume']} />
            <Area type="monotone" dataKey="price" stroke="#C67B5C" strokeWidth={2.5} fill="url(#chartAreaGrad)" dot={{ r: 3.5, fill: '#C67B5C', stroke: '#FFFFFF', strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ChartWrapper>
      </CardContent>
    </Card>
  );
}
