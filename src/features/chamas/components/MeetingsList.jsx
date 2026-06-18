// src/features/chamas/components/MeetingsList.jsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Calendar, Clock, MapPin, Users, ChevronRight,
  Video, RefreshCw, CheckCircle2, XCircle,
  AlertCircle, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { chamaApi } from '../api/chamaApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';

const meetingStatusConfig = {
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Calendar,
  },
  ongoing: {
    label: 'Ongoing',
    color: 'bg-success/10 text-success border-success/20',
    icon: ArrowRight,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-200 text-gray-600 border-gray-300',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-danger/10 text-danger border-danger/20',
    icon: XCircle,
  },
};

function MeetingCard({ meeting, chamaId }) {
  const navigate = useNavigate();
  const status = meetingStatusConfig[meeting.status] || meetingStatusConfig.upcoming;
  const StatusIcon = status.icon;
  const isUpcoming = meeting.status === 'upcoming' || meeting.status === 'ongoing';

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/chamas/${chamaId}/meetings/${meeting.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate text-sm">
                {meeting.title}
              </h3>
              <Badge className={status.color} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            {meeting.agenda && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {meeting.agenda}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-terracotta" />
            <span className="text-gray-600 font-medium">
              {formatDate(meeting.date || meeting.meeting_date)}
            </span>
          </div>
          
          {meeting.start_time && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-terracotta" />
              <span className="text-gray-600">
                {meeting.start_time?.slice(0, 5)}
                {meeting.end_time && ` - ${meeting.end_time.slice(0, 5)}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            {meeting.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-500">
                  {meeting.is_virtual ? 'Virtual' : meeting.location}
                </span>
              </div>
            )}
            
            {meeting.is_virtual && meeting.meeting_link && (
              <div className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-blue-500">Join online</span>
              </div>
            )}
          </div>

          {meeting.attendees_count !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">
                {meeting.attendees_count} attending
                {meeting.rsvp_status && (
                  <span className="ml-1 text-terracotta font-medium">
                    · {meeting.rsvp_status}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions for Upcoming Meetings */}
        {isUpcoming && (
          <div className="mt-3 pt-3 border-t flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              {meeting.rsvp_status === 'attending' ? 'Update RSVP' : 'RSVP'}
            </Button>
            {meeting.is_virtual && meeting.meeting_link && (
              <Button size="sm" className="flex-1 text-xs">
                <Video className="h-3 w-3 mr-1" />
                Join
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MeetingsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MeetingsList({ chamaId }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');

  const {
    data: meetingsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chama-meetings', chamaId, page, status],
    queryFn: () =>
      chamaApi
        .getMeetings(chamaId, {
          page,
          page_size: 10,
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <MeetingsListSkeleton />;
  if (error) {
    return (
      <ErrorState
        message="Failed to load meetings"
        onRetry={refetch}
      />
    );
  }

  const meetings = meetingsData?.results || meetingsData?.data || [];
  const total = meetingsData?.count || meetings.length;
  const totalPages = Math.ceil(total / 10);

  if (!meetings.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No meetings scheduled"
        description="Schedule a meeting to get started"
        action={{
          label: 'Schedule Meeting',
          onClick: () => {
            window.location.href = `/chamas/${chamaId}/meetings/new`;
          },
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {total} Meeting{total !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-md px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            chamaId={chamaId}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}