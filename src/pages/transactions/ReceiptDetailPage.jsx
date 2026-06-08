import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ReceiptDetailPage() {
  const { number } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['receipt', number],
    queryFn: async () => {
      const { data } = await api.get(`/receipts/${number}/`);
      return data.data || data;
    },
    enabled: !!number,
  });

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="skeleton h-6 w-32" />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const receipt = data;

  const downloadReceipt = () => {
    const token = localStorage.getItem('access_token');
    window.open(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/receipts/${number}/download/`,
      '_blank'
    );
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-xl p-6 shadow-subtle border-2 border-sand-200">
        <div className="text-center mb-6">
          <h2 className="font-heading font-bold text-slate-800 text-lg">SACCO BRIDGE</h2>
          <p className="text-xs text-slate-500 mt-1">Receipt: {receipt.receipt_number}</p>
          <p className="text-sm font-heading font-semibold text-terracotta-600 mt-3">
            {receipt.receipt_type_display || receipt.receipt_type}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="text-slate-800">{new Date(receipt.generated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount</span>
            <span className="font-numbers font-bold text-slate-800">KSh {parseInt(receipt.amount || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Description</span>
            <span className="text-slate-800 text-right max-w-[60%]">{receipt.description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Party</span>
            <span className="text-slate-800">{receipt.party_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Verification</span>
            <span className="text-xs font-mono text-slate-500">{receipt.verification_code?.slice(0, 16)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={downloadReceipt}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Receipt ${receipt.receipt_number}`,
                text: `Sacco Bridge Receipt: KSh ${parseInt(receipt.amount || 0).toLocaleString()}`,
              });
            }
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-sand-200 text-slate-600 font-medium rounded-xl"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}