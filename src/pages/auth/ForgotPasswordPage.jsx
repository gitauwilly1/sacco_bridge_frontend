import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/auth/password/reset/', { email });
      setIsSent(true);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Failed to send reset link. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-auth-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-noise" />
        <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12">
          <div className="max-w-sm mx-auto w-full">
            <div className="glass rounded-2xl p-8 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">
                Check Your Email
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                If an account exists with that email, we have sent a password reset link.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-medium text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-auth-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="16" r="8" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="26" cy="24" r="8" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="20" cy="20" r="3" fill="white" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">
              Forgot Password
            </h1>
            <p className="text-sand-300 text-sm mt-1">
              Enter your email to receive a reset link
            </p>
          </div>

          <div className="glass rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-terracotta-600 hover:text-terracotta-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}