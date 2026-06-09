import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

export default function PhoneEntryScreen() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleaned = phone.replace(/\s+/g, '');
    if (!cleaned.match(/^(?:\+?254|0)?7\d{8}$/)) {
      setError('Enter a valid Kenyan phone number.');
      return;
    }

    navigate('/onboarding/verify', { state: { phone: cleaned } });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-terracotta-50 flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-terracotta-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-800 mb-2">
            What is your phone number?
          </h1>
          <p className="text-sm text-slate-500">
            We will send you a verification code. Standard SMS rates may apply.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2 border-r border-sand-200">
              <span className="text-sm text-slate-600 font-medium">+254</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              className="w-full pl-20 pr-4 py-3.5 bg-white border border-sand-200 rounded-xl text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300 transition-all"
              placeholder="7XX XXX XXX"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-error-600 text-sm">{error}</p>
          )}

          <p className="text-xs text-slate-400 flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1.5A6.5 6.5 0 0114.5 8v.5a2 2 0 01-4 0V8a2.5 2.5 0 00-5 0v.5a2 2 0 01-4 0V8A6.5 6.5 0 018 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Your number is encrypted and never shared.
          </p>

          <button
            type="submit"
            disabled={phone.length < 9}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
          >
            Send Verification Code
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Step 1 of 4
        </p>
      </div>
    </div>
  );
}