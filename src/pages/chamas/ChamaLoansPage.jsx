import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Landmark, Plus } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ChamaLoansPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chama-loans', id],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${id}/loans/`);
      return data.data || data;
    },
    enabled: !!id,
  });

  const loans = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">Loans</h2>
        <Link to="/loans/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta">
          <Plus className="w-4 h-4" /> Request
        </Link>
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-xl p-4 shadow-subtle">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-800">{loan.borrower_name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  loan.status === 'FULLY_REPAID' ? 'bg-success-50 text-success-700' :
                  loan.status === 'PENDING' ? 'bg-alert-50 text-alert-700' :
                  'bg-slate-100 text-slate-600'
                }`}>{loan.status_display || loan.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Principal</p>
                  <p className="text-sm font-numbers font-semibold text-slate-700">KSh {parseInt(loan.principal || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Outstanding</p>
                  <p className="text-sm font-numbers font-semibold text-slate-700">KSh {parseInt(loan.outstanding_balance || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
