import { useQuery } from '@tanstack/react-query';
import { Shield, Smartphone, Monitor, Globe, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '../../dashboard/api/dashboardApi';
import { formatTimeAgo } from '../../../utils/format';

export default function LoginHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['login-history'],
    queryFn: () =>
      dashboardApi.getLoginHistory({ limit: 20 }).then((r) => {
        const d = r.data.data || r.data;
        return Array.isArray(d) ? d : d.results || d.logins || [];
      }),
  });

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer h-16 w-full rounded-xl" />)}</div>;
  if (error) return <p className="text-sm text-gray-400 text-center py-8">Login history unavailable</p>;
  if (!data?.length) return <p className="text-sm text-gray-400 text-center py-8">No login history recorded yet</p>;

  const getDeviceIcon = (device) => {
    const ua = String(device || '').toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return Smartphone;
    return Monitor;
  };

  return (
    <Card className="border-sand bg-white shadow-subtle rounded-2xl">
      <CardHeader className="pb-3 border-b border-sand/40">
        <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
          <Shield className="h-4 w-4 text-terracotta" />
          Login History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-sand">
        {data.slice(0, 20).map((entry, i) => {
          const Icon = getDeviceIcon(entry.device);
          const isCurrent = entry.is_current || (i === 0);
          return (
            <div key={entry.id || i} className="flex items-start gap-3 px-4 py-3 hover:bg-sand-light/25 transition-colors">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCurrent ? 'bg-success/10' : 'bg-sand-light'}`}>
                <Icon className={`h-4 w-4 ${isCurrent ? 'text-success' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate truncate">
                    {entry.browser || entry.device || 'Unknown device'}
                  </p>
                  {isCurrent && (
                    <Badge className="text-[9px] font-bold px-1.5 py-0 bg-success/10 text-success border-0 rounded-full">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {entry.ip_address && (
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {entry.ip_address}
                    </span>
                  )}
                  {entry.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {entry.timestamp ? formatTimeAgo(entry.timestamp) : entry.logged_in_at ? formatTimeAgo(entry.logged_in_at) : ''}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}