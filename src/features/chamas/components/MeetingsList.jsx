import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Calendar, Clock, MapPin, Users, ChevronRight,
  Video, RefreshCw, CheckCircle2, XCircle, ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState, EmptyState } from '@/components/feedback';
import { chamaApi } from '../api/chamaApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';

const meetingStatusConfig = {
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: Calendar,
  },
  ongoing: {
    label: 'Ongoing',
    color: 'bg-success/10 text-success border border-success/20',
    icon: ArrowRight,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-400 border border-gray-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-danger/10 text-danger border border-danger/20',
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
      className="cursor-pointer border-sand shadow-subtle card-lift hover:border-terracotta/20 transition-all duration-200"
      onClick={() => navigate({ to: `/chamas/${chamaId}/meetings/${meeting.id}` })}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate text-sm truncate">
                {meeting.title}
              </h3>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            {meeting.agenda && (
              <p className="text-xs text-gray-400 font-medium line-clamp-1">
                {meeting.agenda}
              </p>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>

        <div className="space-y-2 mt-3 pt-3 border-t border-sand/30">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-terracotta" />
            <span className="text-slate font-semibold">
              {formatDate(meeting.date || meeting.meeting_date)}
            </span>
          </div>
          
          {meeting.start_time && (
            <div className="flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 text-terracotta" />
              <span className="text-slate font-medium">
                {meeting.start_time?.slice(0, 5)}
                {meeting.end_time && ` - ${meeting.end_time.slice(0, 5)}`}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs pt-1">
            {meeting.location && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">
                  {meeting.is_virtual ? 'Virtual' : meeting.location}
                </span>
              </div>
            )}
            
            {meeting.is_virtual && meeting.meeting_link && (
              <div className="flex items-center gap-1.5 text-blue-500 font-semibold">
                <Video className="h-3.5 w-3.5" />
                <span>Join online</span>
              </div>
            )}
          </div>

          {meeting.attendees_count !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium">
                {meeting.attendees_count} attending
                {meeting.rsvp_status && (
                  <span className="ml-1 text-terracotta font-semibold">
                    &middot; {meeting.rsvp_status}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions for Upcoming Meetings */}
        {isUpcoming && (
          <div className="mt-4 pt-3 border-t border-sand/40 flex gap-2.5">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-sand hover:bg-sand-light text-slate text-xs font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                // RSVP action
              }}
            >
              {meeting.rsvp_status === 'attending' ? 'Update RSVP' : 'RSVP'}
            </Button>
            {meeting.is_virtual && meeting.meeting_link && (
              <Button
                size="sm"
                className="flex-1 bg-terracotta hover:bg-clay text-white text-xs font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(meeting.meeting_link, '_blank');
                }}
              >
                <Video className="h-3.5 w-3.5 mr-1" />
                Join Meeting
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
        <Card key={i} className="border-sand">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-40 rounded-lg" />
                <div className="skeleton-shimmer h-3.5 w-56 rounded-lg" />
              </div>
              <div className="skeleton-shimmer h-4 w-4 rounded" />
            </div>
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-4 w-32 rounded" />
              <div className="skeleton-shimmer h-4 w-24 rounded" />
              <div className="skeleton-shimmer h-4 w-40 rounded" />
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
            className="text-xs border border-input rounded-lg px-2.5 py-1.5 bg-white text-slate font-medium outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light transition-all px-2.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3 text-gray-400" />
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
            className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
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