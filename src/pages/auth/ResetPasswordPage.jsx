import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '@/lib/api.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uidb64 = searchParams.get('uidb64') || '';
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/auth/password/reset/confirm/', {
        uidb64,
        token,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || 'Reset failed. The link may have expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
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
                Password Reset Complete
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Your password has been reset successfully.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!uidb64 || !token) {
    return (
      <div className="min-h-screen bg-auth-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-noise" />
        <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12">
          <div className="max-w-sm mx-auto w-full">
            <div className="glass rounded-2xl p-8 shadow-2xl text-center">
              <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">
                Invalid Link
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                This password reset link is invalid or incomplete.
              </p>
              <Link
                to="/forgot-password"
                className="text-terracotta-600 hover:text-terracotta-700 font-medium text-sm"
              >
                Request a new reset link
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
              Reset Password
            </h1>
            <p className="text-sand-300 text-sm mt-1">
              Enter your new password
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
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300 transition-all"
                    placeholder="Min 12 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300 transition-all"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}