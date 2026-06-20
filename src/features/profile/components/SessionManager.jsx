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
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3">
        <DeviceIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate truncate">
              {session.device_name || session.browser || 'Unknown Device'}
            </p>
            {isCurrent && (
              <Badge className="bg-success/10 text-success text-[10px]">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
            {session.location_city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {session.location_city}
                {session.location_country && `, ${session.location_country}`}
              </span>
            )}
            {session.ip_address && (
              <span className="font-mono">{session.ip_address}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
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
          className="flex-shrink-0"
          onClick={() => onTerminate(session.session_id)}
        >
          <X className="h-4 w-4 text-danger" />
        </Button>
      )}
    </div>
  );
}

function SessionListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
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

  const sessions = sessionsData?.sessions || sessionsData?.results || [];
  const activeCount = sessions.filter((s) => !s.is_current).length;

  if (isLoading) return <SessionListSkeleton />;
  if (error) {
    return <ErrorState message="Failed to load sessions" onRetry={refetch} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Sessions</CardTitle>
        <CardDescription>
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
          <div className="space-y-2">
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