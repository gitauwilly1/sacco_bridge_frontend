import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Copy, Wallet, Users, Banknote } from 'lucide-react';
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';

export default function ContributionFlowPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedChamaId, setSelectedChamaId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const { data: chamasData, isLoading: chamasLoading } = useQuery({
    queryKey: ['chamas-for-contribution'],
    queryFn: async () => {
      const { data } = await api.get('/chamas/');
      return data.data || data;
    },
  });

  const chamas = Array.isArray(chamasData?.data) ? chamasData.data : chamasData?.results || [];

  const selectedChama = chamas.find((c) => c.id === selectedChamaId);

  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['chama-members', selectedChamaId],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${selectedChamaId}/members/`);
      return data.data || data;
    },
    enabled: !!selectedChamaId,
  });

  const members = Array.isArray(membersData) ? membersData : membersData?.results || [];

  const contributionMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(`/chamas/${selectedChamaId}/contributions/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['chama-dashboard'] });
      setIsComplete(true);
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || 'Failed to record contribution.');
    },
  });

  const handleSubmit = () => {
    setError('');

    if (!selectedChamaId || !selectedMemberId || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    const today = new Date();
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - today.getDay() + 1);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + 6);

    contributionMutation.mutate({
      chama: selectedChamaId,
      member: selectedMemberId,
      amount: amount,
      payment_method: paymentMethod,
      payment_reference: paymentRef,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      notes: notes,
    });
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">
          Contribution Recorded
        </h2>
        <p className="text-slate-500 text-sm mb-2">
          KSh {parseInt(amount).toLocaleString()} has been recorded successfully.
        </p>
        <p className="text-slate-400 text-xs mb-6">
          A receipt has been generated for this transaction.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/activity')}
            className="px-6 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-sand-50 transition-colors"
          >
            View Activity
          </button>
          <button
            onClick={() => {
              setStep(1);
              setAmount('');
              setPaymentRef('');
              setNotes('');
              setIsComplete(false);
              setError('');
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta"
          >
            Record Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => (step > 1 ? setStep(step - 1) : navigate(-1))}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {step > 1 ? 'Back' : 'Cancel'}
      </button>

      <div>
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s <= step
                    ? 'bg-terracotta-500 text-white'
                    : 'bg-sand-100 text-slate-400'
                }`}
              >
                {s < step ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-0.5 ${
                    s < step ? 'bg-terracotta-500' : 'bg-sand-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>Select Chama</span>
          <span>Enter Details</span>
          <span>Confirm</span>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-slate-800">Select Chama</h3>
          {chamasLoading ? (
            <CardSkeleton />
          ) : (
            chamas.map((chama) => (
              <button
                key={chama.id}
                onClick={() => {
                  setSelectedChamaId(chama.id);
                  setSelectedMemberId('');
                }}
                className={`w-full text-left bg-white rounded-xl p-4 shadow-subtle border-2 transition-all duration-200 ${
                  selectedChamaId === chama.id
                    ? 'border-terracotta-500 bg-terracotta-50'
                    : 'border-transparent hover:border-sand-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-sm">
                      {chama.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-slate-800 text-sm">{chama.name}</p>
                    <p className="text-xs text-slate-500">
                      {chama.contribution_amount ? `KSh ${chama.contribution_amount} / ${chama.contribution_frequency}` : `${chama.member_count || 0} members`}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!selectedChamaId}
            className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800">Contribution Details</h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Member</label>
            {membersLoading ? (
              <div className="skeleton h-10 rounded-lg" />
            ) : (
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              >
                <option value="">Select member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.user_name || m.user?.name || 'Member'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount (KSh)</label>
            <div className="flex gap-2">
              {['500', '1000', '2000', '5000'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    amount === preset
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-sand-100 text-slate-600 hover:bg-sand-200'
                  }`}
                >
                  {parseInt(preset).toLocaleString()}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-2 px-4 py-3 bg-white border border-sand-200 rounded-lg text-2xl font-numbers text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Method</label>
            <div className="flex gap-2">
              {['MPESA', 'CASH', 'BANK_TRANSFER'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    paymentMethod === method
                      ? 'bg-terracotta-500 text-white'
                      : 'bg-sand-100 text-slate-600 hover:bg-sand-200'
                  }`}
                >
                  {method === 'MPESA' ? 'M-Pesa' : method === 'BANK_TRANSFER' ? 'Bank' : 'Cash'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment Reference (optional)</label>
            <input
              type="text"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              placeholder="M-Pesa transaction ID"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300 resize-none"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-sand-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedMemberId || !amount}
              className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800">Confirm Contribution</h3>

          <div className="bg-white rounded-xl p-4 shadow-subtle space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Chama</span>
              <span className="text-sm font-medium text-slate-800">
                {selectedChama?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Member</span>
              <span className="text-sm font-medium text-slate-800">
                {members.find((m) => m.id === selectedMemberId)?.user_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Amount</span>
              <span className="text-sm font-numbers font-semibold text-slate-800">
                KSh {parseInt(amount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Method</span>
              <span className="text-sm font-medium text-slate-800">
                {paymentMethod === 'MPESA' ? 'M-Pesa' : paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash'}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-sand-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={contributionMutation.isPending}
              className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
            >
              {contributionMutation.isPending ? 'Recording...' : 'Confirm Contribution'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}