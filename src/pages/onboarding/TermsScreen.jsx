import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ArrowLeft, Shield, FileText, AlertTriangle, Clock, Building2 } from 'lucide-react';

export default function TermsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accepted, setAccepted] = useState({
    risks: false,
    terms: false,
    privacy: false,
  });

  const allAccepted = Object.values(accepted).every(Boolean);

  const risks = [
    {
      icon: TrendingUp,
      title: 'Price Risk',
      description: 'Share prices change based on market conditions. You may sell for less than you paid.',
    },
    {
      icon: Clock,
      title: 'Settlement Timing',
      description: 'Trades take 30 seconds to a few hours to complete depending on SACCO systems.',
    },
    {
      icon: Building2,
      title: 'SACCO Risk',
      description: 'Your SACCO\'s financial health affects your shares\' value and dividend payments.',
    },
    {
      icon: AlertTriangle,
      title: 'Disputes',
      description: 'We have a structured resolution process backed by a trustee bank.',
    },
  ];

  const toggle = (key) => {
    setAccepted((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinish = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex-1 px-6 py-4 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-slate-800 mb-2">
            Before you start
          </h1>
          <p className="text-sm text-slate-500">
            Please review and accept these terms to continue.
          </p>
        </div>

        <div className="bg-sand-50 rounded-xl p-4 mb-6">
          <h3 className="font-heading font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-terracotta-600" />
            Key Risks
          </h3>
          <div className="space-y-3">
            {risks.map((risk, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <risk.icon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{risk.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{risk.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { key: 'risks', label: 'I understand the risks explained above' },
            { key: 'terms', label: 'I accept the Terms of Service' },
            { key: 'privacy', label: 'I accept the Privacy Policy' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => toggle(item.key)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-sand-200 hover:border-terracotta-300 transition-all text-left"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                accepted[item.key]
                  ? 'bg-terracotta-500 border-terracotta-500'
                  : 'border-sand-300'
              }`}>
                {accepted[item.key] && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-slate-700">{item.label}</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center">
          You can review these documents anytime from Profile.
        </p>
      </div>

      <div className="px-6 pb-8 pt-4">
        <button
          onClick={handleFinish}
          disabled={!allAccepted}
          className="w-full py-3.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
        >
          Start Trading
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">
          Step 4 of 4
        </p>
      </div>
    </div>
  );
}