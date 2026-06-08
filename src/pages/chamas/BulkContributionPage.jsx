import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton, ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';

export default function BulkContributionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedChamaId, setSelectedChamaId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [contributions, setContributions] = useState([]);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const { data: chamasData, isLoading: chamasLoading } = useQuery({
    queryKey: ['chamas-for-bulk'],
    queryFn: async () => {
      const { data } = await api.get('/chamas/');
      return data.data || data;
    },
  });

  const chamas = Array.isArray(chamasData?.data) ? chamasData.data : chamasData?.results || [];

  const { data: membersData } = useQuery({
    queryKey: ['chama-members', selectedChamaId],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${selectedChamaId}/members/`);
      return data.data || data;
    },
    enabled: !!selectedChamaId,
  });

  const members = Array.isArray(membersData) ? membersData : membersData?.results || [];

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/chamas/${selectedChamaId}/contributions/bulk/`, {
        period_start: periodStart,
        period_end: periodEnd,
        contributions: contributions.map((c) => ({
          member_id: c.memberId,
          amount: c.amount,
          payment_method: c.method,
          payment_reference: c.ref || '',
          notes: c.notes || '',
        })),
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chama-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['chama-dashboard'] });
      setResults(data.data || data);
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || 'Failed to record contributions.');
    },
  });

  const addRow = () => {
    setContributions([
      ...contributions,
      { id: Date.now(), memberId: '', amount: '', method: 'CASH', ref: '', notes: '' },
    ]);
  };

  const removeRow = (id) => {
    setContributions(contributions.filter((c) => c.id !== id));
  };

  const updateRow = (id, field, value) => {
    setContributions(
      contributions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = () => {
    setError('');

    if (!selectedChamaId) {
      setError('Please select a chama.');
      return;
    }
    if (!periodStart || !periodEnd) {
      setError('Please set the contribution period.');
      return;
    }
    if (contributions.length === 0) {
      setError('Please add at least one contribution.');
      return;
    }

    const invalid = contributions.find((c) => !c.memberId || !c.amount);
    if (invalid) {
      setError('All contributions must have a member and amount.');
      return;
    }

    bulkMutation.mutate();
  };

  if (results) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-lg font-heading font-bold text-slate-800">Bulk Contribution Complete</h2>
          <p className="text-sm text-slate-500 mt-1">
            {results.success_count} succeeded, {results.failure_count} failed
          </p>
        </div>

        <div className="space-y-2">
          {results.results?.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 bg-white rounded-xl p-3 shadow-subtle border-l-4 ${
                r.status === 'success' ? 'border-l-success-500' : 'border-l-error-500'
              }`}
            >
              {r.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-error-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {r.member_name || r.member_id}
                </p>
                <p className="text-xs text-slate-500">
                  {r.status === 'success' ? `KSh ${r.amount}` : r.error}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/activity')}
            className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600"
          >
            View Activity
          </button>
          <button
            onClick={() => {
              setResults(null);
              setContributions([]);
            }}
            className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta"
          >
            Record More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-lg font-heading font-semibold text-slate-800">Bulk Contributions</h2>

      {error && (
        <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Chama</label>
        {chamasLoading ? (
          <div className="skeleton h-10 rounded-lg" />
        ) : (
          <select
            value={selectedChamaId}
            onChange={(e) => setSelectedChamaId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          >
            <option value="">Select chama...</option>
            {chamas.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Period Start</label>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Period End</label>
          <input
            type="date"
            value={periodEnd}
            onChange={(e) => setPeriodEnd(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
          />
        </div>
      </div>

      {contributions.length > 0 && (
        <div className="space-y-2">
          {contributions.map((c) => (
            <div key={c.id} className="bg-white rounded-xl p-3 shadow-subtle space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Contribution #{contributions.indexOf(c) + 1}
                </span>
                <button
                  onClick={() => removeRow(c.id)}
                  className="text-error-500 hover:text-error-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <select
                value={c.memberId}
                onChange={(e) => updateRow(c.id, 'memberId', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-xs text-slate-800"
              >
                <option value="">Select member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.user_name || 'Member'}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={c.amount}
                  onChange={(e) => updateRow(c.id, 'amount', e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-sand-200 rounded-lg text-sm text-slate-800"
                  placeholder="Amount"
                />
                <select
                  value={c.method}
                  onChange={(e) => updateRow(c.id, 'method', e.target.value)}
                  className="w-20 px-2 py-2 bg-white border border-sand-200 rounded-lg text-xs text-slate-800"
                >
                  <option value="CASH">Cash</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="BANK_TRANSFER">Bank</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={addRow}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-sand-300 rounded-xl text-sm font-medium text-slate-500 hover:border-terracotta-300 hover:text-terracotta-600 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add Contribution Row
      </button>

      <button
        onClick={handleSubmit}
        disabled={bulkMutation.isPending || contributions.length === 0}
        className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
      >
        {bulkMutation.isPending ? 'Saving...' : `Save ${contributions.length} Contributions`}
      </button>
    </div>
  );
}