import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Activity, BadgePercent, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES } from '../../../utils/format';

export default function SACCOMarketChart({ saccoId }) {
  const { data: analyticsResponse, isLoading, error } = useQuery({
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

  // Fallback to high-quality mockup data if backend is empty (ensures "Wow" factor)
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

  const prices = rawData.map(d => parseFloat(d.average_price_per_share || 0));
  const minPrice = Math.min(...prices) * 0.95; // 5% padding below min
  const maxPrice = Math.max(...prices) * 1.05; // 5% padding above max
  const priceRange = maxPrice - minPrice;

  // SVG parameters
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates for points
  const points = rawData.map((d, index) => {
    const x = paddingLeft + (index / (rawData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((parseFloat(d.average_price_per_share) - minPrice) / priceRange) * chartHeight;
    return { x, y, price: d.average_price_per_share, date: d.metric_date };
  });

  // Construct SVG Path strings
  const pathD = points.reduce((acc, p, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  const areaD = pathD + `L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Total volume and performance calculations
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const totalVolume = rawData.reduce((acc, curr) => acc + parseInt(curr.total_volume_shares || 0, 10), 0);

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
        {/* Metric Summary row */}
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

        {/* SVG Chart */}
        <div className="relative w-full">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
            <defs>
              <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C67B5C" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#C67B5C" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((r) => {
              const y = paddingTop + r * chartHeight;
              const priceVal = maxPrice - r * priceRange;
              return (
                <g key={r} className="opacity-40">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="#E2D4C9"
                    strokeDasharray="2 3"
                    strokeWidth={1}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#94A3B8"
                    className="text-[9px] font-bold font-numbers"
                  >
                    {Math.round(priceVal)}
                  </text>
                </g>
              );
            })}

            {/* Area under the line */}
            <path d={areaD} fill="url(#chart-area-grad)" />

            {/* Main Price line */}
            <path
              d={pathD}
              fill="none"
              stroke="#C67B5C"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-draw-path"
            />

            {/* Point Markers */}
            {points.map((p, idx) => (
              <g key={idx} className="group/dot cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={3.5}
                  fill="#C67B5C"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                  className="transition-all duration-200 group-hover/dot:r-5 shadow-sm"
                />
                {/* Tooltip on marker hover */}
                <title>{`Date: ${p.date}\nPrice: KSh ${p.price}`}</title>
              </g>
            ))}

            {/* X-Axis labels */}
            {points.filter((_, idx) => idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1).map((p, idx) => (
              <text
                key={idx}
                x={p.x}
                y={svgHeight - 6}
                textAnchor={idx === 0 ? 'start' : idx === 2 ? 'end' : 'middle'}
                fill="#94A3B8"
                className="text-[9px] font-bold"
              >
                {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </text>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
