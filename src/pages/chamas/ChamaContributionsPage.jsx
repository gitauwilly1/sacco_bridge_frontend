import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Wallet, Plus } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ChamaContributionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chama-contributions', id],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${id}/contributions/`);
      return data.data || data;
    },
    enabled: !!id,
  });

  const contributions = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">Contributions</h2>
        <Link to="/contribute" className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta">
          <Plus className="w-4 h-4" /> Record
        </Link>
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="space-y-1">
          {contributions.map((c) => (
            <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-subtle">
              <div className={`w-2 h-2 rounded-full ${c.status === 'PAID' ? 'bg-success-500' : c.status === 'PENDING' ? 'bg-alert-500' : 'bg-error-500'}`} />
              <div className="flex-1">
                <p className="text-sm text-slate-700">{c.member_name || 'Member'}</p>
                <p className="text-xs text-slate-500">{c.period_start} - {c.period_end}</p>
              </div>
              <p className="text-sm font-numbers font-semibold text-slate-700">KSh {parseInt(c.amount || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}