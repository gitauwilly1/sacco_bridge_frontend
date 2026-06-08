import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Download, ChevronRight } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function ReceiptsPage() {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-receipts'],
    queryFn: async () => {
      const { data } = await api.get('/receipts/');
      return data.data || data;
    },
  });

  const receipts = Array.isArray(data) ? data : data?.results || [];

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-heading font-semibold text-slate-800">Receipts</h2>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && receipts.length === 0 && (
        <EmptyState
          icon={<FileText className="w-10 h-10 text-terracotta-500" />}
          title="No receipts yet"
          description="Receipts are generated automatically when transactions complete."
        />
      )}

      {!isLoading && !isError && receipts.length > 0 && (
        <div className="space-y-2">
          {receipts.map((receipt) => (
            <Link
              key={receipt.id}
              to={`/receipts/${receipt.receipt_number}`}
              className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-terracotta-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-terracotta-600" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-slate-800 text-sm">
                    {receipt.receipt_type_display || receipt.receipt_type}
                  </p>
                  <p className="text-xs text-slate-500">
                    {receipt.receipt_number} · {new Date(receipt.generated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-numbers font-semibold text-slate-700 text-sm">
                  KSh {parseInt(receipt.amount || 0).toLocaleString()}
                </p>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}