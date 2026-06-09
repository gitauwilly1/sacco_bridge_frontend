import StatusBadge from '@/components/shared/StatusBadge.jsx';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function MeetingCard({ meeting, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 shadow-subtle ${
        onClick ? 'cursor-pointer hover:shadow-medium transition-all duration-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-semibold text-slate-800 text-sm">{meeting.title}</h3>
        <StatusBadge status={meeting.status} size="xs" />
      </div>

      {meeting.description && (
        <p className="text-xs text-slate-500 mb-3">{meeting.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {meeting.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {meeting.start_time}
        </span>
        {meeting.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {meeting.location}
          </span>
        )}
      </div>

      {meeting.attendee_count !== undefined && (
        <p className="text-xs text-slate-400 mt-2">
          {meeting.attendee_count} attended
        </p>
      )}
    </div>
  );
}