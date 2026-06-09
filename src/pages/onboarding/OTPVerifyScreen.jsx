import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function OTPVerifyScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '07XX XXX XXX';
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (code) => {
    if (code.length === 6) {
      navigate('/onboarding/roles');
    }
  };

  const handleResend = () => {
    setCountdown(45);
    setError('');
  };

  const maskedPhone = phone.length > 8
    ? phone.slice(0, 4) + '***' + phone.slice(-3)
    : phone;

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

      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-slate-800 mb-2">
            Verify your number
          </h1>
          <p className="text-sm text-slate-500">
            We sent a 6-digit code to {maskedPhone}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-terracotta-600 hover:text-terracotta-700 font-medium mt-1"
          >
            Edit number
          </button>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 bg-white border-2 rounded-xl text-center text-xl font-numbers font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                digit ? 'border-terracotta-500' : error ? 'border-error-300' : 'border-sand-200'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-error-600 text-sm text-center mb-4">{error}</p>
        )}

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-slate-400">
              Resend code in {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-terracotta-600 hover:text-terracotta-700 font-medium"
            >
              Resend code
            </button>
          )}
        </div>
      </div>

      <div className="px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Step 2 of 4
        </p>
      </div>
    </div>
  );
}