import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Monitor, Smartphone, Tablet, X, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';
import { formatDateTime, formatTimeAgo } from '../../../utils/format';

const deviceIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  laptop: Monitor,
};

function SessionCard({ session, onTerminate }) {
  const DeviceIcon = deviceIcons[session.device_type] || Monitor;
  const isCurrent = session.is_current;

  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-sand/45 bg-sand-light/10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-lg bg-white border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
          <DeviceIcon className="h-4.5 w-4.5 text-terracotta/75" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate truncate">
              {session.device_name || session.browser || 'Unknown Device'}
            </p>
            {isCurrent && (
              <Badge className="bg-success/10 text-success border border-success/20 text-[9px] font-extrabold rounded-full px-2 py-0.5 shadow-none">
                Current
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-400 font-medium mt-0.5">
            {session.location_city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-400" />
                {session.location_city}
                {session.location_country && `, ${session.location_country}`}
              </span>
            )}
            {session.ip_address && (
              <span className="font-numbers text-[10px] text-gray-400/90">{session.ip_address}</span>
            )}
          </div>
          <p className="text-[10px] text-gray-400/90 mt-0.5 flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3 text-gray-400" />
            {isCurrent
              ? 'Active now'
              : `Last active ${formatTimeAgo(session.last_activity || session.login_timestamp)}`}
          </p>
        </div>
      </div>
      {!isCurrent && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-8 w-8 text-danger hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg cursor-pointer transition-all"
          onClick={() => onTerminate(session.session_id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

function SessionListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 border border-sand/40 bg-white rounded-xl shadow-subtle">
          <div className="skeleton-shimmer h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-3.5 w-32 rounded" />
            <div className="skeleton-shimmer h-3 w-48 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SessionManager() {
  const queryClient = useQueryClient();

  const {
    data: sessionsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: () =>
      profileApi.getSessions().then((r) => r.data.data || r.data),
  });

  const terminateMutation = useMutation({
    mutationFn: (sessionId) => profileApi.terminateSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session terminated');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to terminate session'
      );
    },
  });

  const rawSessions = sessionsData?.sessions || sessionsData?.results || [];
  const seen = new Set();
  const sessions = rawSessions.filter((s) => {
    const key = s.device_id || s.session_id || s.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const activeCount = sessions.filter((s) => !s.is_current).length;

  if (isLoading) return <SessionListSkeleton />;
  if (error) {
    return <ErrorState message="Failed to load sessions" onRetry={refetch} />;
  }

  return (
    <Card className="border-sand bg-white shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate">Active Sessions</CardTitle>
        <CardDescription className="text-xs text-gray-400 font-medium">
          {activeCount > 0
            ? `${activeCount} other session${activeCount !== 1 ? 's' : ''} active`
            : 'Only this session is active'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <EmptyState
            icon={Monitor}
            title="No sessions"
            description="Your active sessions will appear here"
          />
        ) : (
          <div className="space-y-2.5">
            {sessions.map((session) => (
              <SessionCard
                key={session.session_id || session.id}
                session={session}
                onTerminate={(id) => terminateMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}