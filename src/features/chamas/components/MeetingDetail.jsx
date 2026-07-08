import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, MapPin, Globe, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { chamaApi } from '../api/chamaApi';
import { formatDate } from '../../../utils/format';

const statusConfig = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20' },
  ongoing: { label: 'Ongoing', color: 'bg-success/10 text-success border border-success/20' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger border border-danger/20' },
};

export default function MeetingDetail() {
  const { chamaId, meetingId } = useParams({ strict: false });
  const navigate = useNavigate();

  const { data: meeting, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-meeting', chamaId, meetingId],
    queryFn: () => chamaApi.getMeeting(chamaId, meetingId).then((r) => r.data.data || r.data),
    enabled: !!chamaId && !!meetingId,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load meeting" onRetry={refetch} />;
  if (!meeting) return <ErrorState message="Meeting not found" />;

  const statusStyle = statusConfig[meeting.status] || statusConfig.scheduled;
  const formattedDateTime = meeting.date && meeting.time
    ? `${formatDate(meeting.date)} at ${meeting.time}`
    : meeting.date ? formatDate(meeting.date) : '—';

  return (
    <div className="pb-4 max-w-2xl mx-auto">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}/meetings` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold font-heading text-slate line-clamp-1">{meeting.title}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className={`rounded-xl border p-5 flex items-center gap-3 ${statusStyle.color}`}>
          <Calendar className="h-6 w-6 shrink-0" />
          <div>
            <p className="font-bold text-sm">{statusStyle.label}</p>
            <p className="text-xs opacity-75 mt-0.5">{formattedDateTime}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Card className="border-sand bg-white shadow-subtle">
            <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
              <CardTitle className="text-sm font-semibold text-slate">Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {meeting.location && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400 text-xs font-medium">Location</span>
                    <p className="font-semibold text-slate">{meeting.location}</p>
                  </div>
                </div>
              )}
              {meeting.virtual_link && (
                <div className="flex items-start gap-3 text-sm">
                  <Globe className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400 text-xs font-medium">Virtual Link</span>
                    <a href={meeting.virtual_link} target="_blank" rel="noopener noreferrer"
                      className="font-semibold text-terracotta hover:underline break-all">
                      {meeting.virtual_link}
                    </a>
                  </div>
                </div>
              )}
              {meeting.rsvp_count !== undefined && (
                <div className="flex items-start gap-3 text-sm">
                  <Users className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-gray-400 text-xs font-medium">Attendees</span>
                    <p className="font-semibold text-slate">{meeting.rsvp_count} confirmed</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {meeting.agenda && (
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
                <CardTitle className="text-sm font-semibold text-slate flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate/60" /> Agenda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate whitespace-pre-line leading-relaxed">{meeting.agenda}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full border-sand text-slate hover:bg-sand-light"
            onClick={() => navigate({ to: `/chamas/${chamaId}/meetings` })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Meetings
          </Button>
        </div>
      </div>
    </div>
  );
}
