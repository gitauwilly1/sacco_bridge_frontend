import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Plus, MapPin, Clock } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ChamaMeetingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chama-meetings', id],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${id}/meetings/`);
      return data.data || data;
    },
    enabled: !!id,
  });

  const meetings = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">Meetings</h2>
        <Link to={`/chamas/${id}/meetings/new`} className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta">
          <Plus className="w-4 h-4" /> Schedule
        </Link>
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-xl p-4 shadow-subtle">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold text-slate-800 text-sm">{meeting.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  meeting.status === 'SCHEDULED' ? 'bg-alert-50 text-alert-700' :
                  meeting.status === 'COMPLETED' ? 'bg-success-50 text-success-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{meeting.status}</span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{meeting.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{meeting.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.start_time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{meeting.location || 'TBA'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
