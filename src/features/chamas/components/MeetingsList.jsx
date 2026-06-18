import { useQuery } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '../../../components/feedback/ErrorState';
import { formatDate } from '../../../utils/format';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const statusColors = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-success/10 text-success',
  COMPLETED: 'bg-gray-100 text-gray-500',
  CANCELLED: 'bg-danger/10 text-danger',
};

export default function MeetingsList({ chamaId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['chama-meetings', chamaId],
    queryFn: () => chamaApi.getMeetings(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  if (error) return <ErrorState message="Failed to load meetings" />;

  const meetings = data?.data || data?.results || [];

  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No meetings scheduled"
        description="Meetings help your chama stay organized."
      />
    );
  }

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => (
        <Card key={meeting.id}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate">{meeting.title}</h4>
              <Badge className={statusColors[meeting.status] || 'bg-gray-100'}>
                {meeting.status}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(meeting.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{meeting.start_time?.slice(0, 5)} – {meeting.end_time?.slice(0, 5)}</span>
              </div>
              {meeting.location && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>{meeting.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>{meeting.attendee_count || 0} attended</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}