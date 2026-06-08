import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, TrendingUp } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';

export default function CreateLiquidityRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [selectedHoldingId, setSelectedHoldingId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [urgency, setUrgency] = useState('STANDARD');
  const [allowInstitutional, setAllowInstitutional] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const { data: holdingsData, isLoading: hLoading } = useQuery({
    queryKey: ['my-holdings-for-sale'],
    queryFn: async () => {
      const { data } = await api.get('/investments/holdings/');
      return data.data || data;
    },
  });

  const holdings = Array.isArray(holdingsData) ? holdingsData : holdingsData?.results || [];
  const selectedHolding = holdings.find((h) => h.id === selectedHoldingId);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/investments/requests/', {
        sacco: selectedHolding?.sacco,
        share_class: selectedHolding?.share_class,
        holding: selectedHoldingId,
        share_quantity: quantity,
        expected_price_per_share: expectedPrice,
        urgency,
        allow_institutional_buyers: allowInstitutional,
        notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-liquidity-requests'] });
      queryClient.invalidateQueries({ queryKey: ['invest-dashboard'] });
      setIsComplete(true);
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || 'Failed to create request.');
    },
  });

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">Request Created</h2>
        <p className="text-slate-500 text-sm mb-6">Buyers will be matched based on your preferences.</p>
        <button onClick={() => navigate('/requests')}
          className="px-6 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta">
          View My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500">
        <ArrowLeft className="w-4 h-4" /> {step > 1 ? 'Back' : 'Cancel'}
      </button>

      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s <= step ? 'bg-terracotta-500 text-white' : 'bg-sand-100 text-slate-400'
            }`}>{s}</div>
            {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-terracotta-500' : 'bg-sand-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Select Shares</span><span>Set Terms</span><span>Review</span>
      </div>

      {error && <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200">{error}</div>}

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-slate-800">Select SACCO Holding</h3>
          {hLoading ? <CardSkeleton /> : holdings.map((h) => (
            <button key={h.id} onClick={() => setSelectedHoldingId(h.id)}
              className={`w-full text-left bg-white rounded-xl p-4 shadow-subtle border-2 transition-all ${
                selectedHoldingId === h.id ? 'border-terracotta-500 bg-terracotta-50' : 'border-transparent'
              }`}>
              <p className="font-heading font-semibold text-slate-800 text-sm">{h.sacco_name}</p>
              <p className="text-xs text-slate-500">Available: {parseFloat(h.available_shares || 0).toFixed(0)} shares</p>
            </button>
          ))}
          <button onClick={() => setStep(2)} disabled={!selectedHoldingId}
            className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta disabled:opacity-50">Continue</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800">Set Terms</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Number of Shares</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-sand-200 rounded-lg text-2xl font-numbers text-center text-slate-800" placeholder="0" />
            <p className="text-xs text-slate-400 mt-1">Available: {parseFloat(selectedHolding?.available_shares || 0).toFixed(0)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Expected Price per Share (KSh)</label>
            <input type="number" value={expectedPrice} onChange={(e) => setExpectedPrice(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-sand-200 rounded-lg text-2xl font-numbers text-center text-slate-800" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Urgency</label>
            <div className="flex gap-2">
              {['STANDARD', 'PRIORITY', 'URGENT'].map((u) => (
                <button key={u} onClick={() => setUrgency(u)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    urgency === u ? 'bg-terracotta-500 text-white' : 'bg-sand-100 text-slate-600'
                  }`}>{u === 'STANDARD' ? 'Standard (1 week)' : u === 'PRIORITY' ? 'Priority (48h)' : 'Urgent (24h)'}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600">Back</button>
            <button onClick={() => setStep(3)} disabled={!quantity || !expectedPrice}
              className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta disabled:opacity-50">Review</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800">Review Request</h3>
          <div className="bg-white rounded-xl p-4 shadow-subtle space-y-3">
            <div className="flex justify-between"><span className="text-sm text-slate-500">SACCO</span><span className="text-sm font-medium">{selectedHolding?.sacco_name}</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Shares</span><span className="font-numbers font-semibold">{quantity}</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Price/Share</span><span className="font-numbers">KSh {parseInt(expectedPrice).toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-sand-200 pt-3"><span className="text-sm font-medium">Total Value</span><span className="font-numbers font-bold text-terracotta-600">KSh {(parseInt(quantity || 0) * parseFloat(expectedPrice || 0)).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Urgency</span><span className="text-sm">{urgency}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600">Edit</button>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
              className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta disabled:opacity-50">
              {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}