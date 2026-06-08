import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Landmark, Calculator } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';

export default function LoanApplicationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [selectedChamaId, setSelectedChamaId] = useState('');
  const [principal, setPrincipal] = useState('');
  const [duration, setDuration] = useState(3);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const { data: chamasData, isLoading: chamasLoading } = useQuery({
    queryKey: ['chamas-for-loan'],
    queryFn: async () => {
      const { data } = await api.get('/chamas/');
      return data.data || data;
    },
  });

  const chamas = Array.isArray(chamasData?.data) ? chamasData.data : chamasData?.results || [];
  const selectedChama = chamas.find((c) => c.id === selectedChamaId);

  const { data: memberData } = useQuery({
    queryKey: ['my-membership', selectedChamaId],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${selectedChamaId}/members/`);
      const members = data.data || data;
      const list = Array.isArray(members) ? members : members?.results || [];
      return list[0] || null;
    },
    enabled: !!selectedChamaId,
  });

  const loanMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/chamas/${selectedChamaId}/loans/`, {
        chama: selectedChamaId,
        borrower: memberData?.id,
        principal,
        duration_months: duration,
        purpose,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-loans'] });
      queryClient.invalidateQueries({ queryKey: ['chama-dashboard'] });
      setIsComplete(true);
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || 'Loan application failed.');
    },
  });

  const rate = selectedChama?.loan_interest_rate || 10;
  const totalInterest = (parseFloat(principal || 0) * (rate / 100) * duration).toFixed(2);
  const totalRepayable = (parseFloat(principal || 0) + parseFloat(totalInterest)).toFixed(2);
  const monthlyInstallment = duration > 0 ? (parseFloat(totalRepayable) / duration).toFixed(2) : 0;

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-success-600" />
        </div>
        <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">Loan Application Submitted</h2>
        <p className="text-slate-500 text-sm mb-6">Your application will be reviewed by the chama.</p>
        <button
          onClick={() => navigate(`/chamas/${selectedChamaId}/loans`)}
          className="px-6 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta"
        >
          View Loans
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

      {error && (
        <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200">{error}</div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-slate-800">Select Chama</h3>
          {chamasLoading ? <CardSkeleton /> : chamas.map((chama) => (
            <button key={chama.id} onClick={() => setSelectedChamaId(chama.id)}
              className={`w-full text-left bg-white rounded-xl p-4 shadow-subtle border-2 transition-all ${
                selectedChamaId === chama.id ? 'border-terracotta-500 bg-terracotta-50' : 'border-transparent'
              }`}
            >
              <p className="font-heading font-semibold text-slate-800 text-sm">{chama.name}</p>
              <p className="text-xs text-slate-500">Rate: {chama.loan_interest_rate}% · Max: {chama.max_loan_multiple}x contributions</p>
            </button>
          ))}
          <button onClick={() => setStep(2)} disabled={!selectedChamaId}
            className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta disabled:opacity-50">
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800">Loan Details</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount (KSh)</label>
            <div className="flex gap-2 mb-2">
              {[5000, 10000, 20000, 50000].map((p) => (
                <button key={p} onClick={() => setPrincipal(p.toString())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${principal === p.toString() ? 'bg-terracotta-500 text-white' : 'bg-sand-100 text-slate-600'}`}>
                  {p.toLocaleString()}
                </button>
              ))}
            </div>
            <input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-sand-200 rounded-lg text-2xl font-numbers text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Duration (months): {duration}</label>
            <input type="range" min="1" max="12" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-terracotta-500" />
            <div className="flex justify-between text-xs text-slate-400">
              <span>1</span><span>3</span><span>6</span><span>9</span><span>12</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Purpose</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800">
              <option value="">Select purpose...</option>
              <option value="Business expansion">Business expansion</option>
              <option value="School fees">School fees</option>
              <option value="Medical emergency">Medical emergency</option>
              <option value="Home improvement">Home improvement</option>
              <option value="Debt consolidation">Debt consolidation</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600">Back</button>
            <button onClick={() => setStep(3)} disabled={!principal || !purpose}
              className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta disabled:opacity-50">Review</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-slate-800">Review Application</h3>
          <div className="bg-white rounded-xl p-4 shadow-subtle space-y-3">
            <div className="flex justify-between"><span className="text-sm text-slate-500">Chama</span><span className="text-sm font-medium">{selectedChama?.name}</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Principal</span><span className="font-numbers font-semibold">KSh {parseInt(principal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Interest Rate</span><span className="font-numbers">{rate}%</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Duration</span><span className="font-numbers">{duration} months</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Total Interest</span><span className="font-numbers text-alert-600">KSh {parseInt(totalInterest).toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-sand-200 pt-3"><span className="text-sm font-medium text-slate-700">Total Repayable</span><span className="font-numbers font-bold text-slate-800">KSh {parseInt(totalRepayable).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-slate-500">Monthly Installment</span><span className="font-numbers font-semibold text-terracotta-600">KSh {parseInt(monthlyInstallment).toLocaleString()}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-white border border-sand-200 rounded-lg text-sm font-medium text-slate-600">Edit</button>
            <button onClick={() => loanMutation.mutate()} disabled={loanMutation.isPending}
              className="flex-1 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta disabled:opacity-50">
              {loanMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}