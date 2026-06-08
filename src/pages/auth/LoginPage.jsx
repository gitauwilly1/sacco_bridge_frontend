import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, verify2FA } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.requires2FA) {
        setSessionToken(result.sessionToken);
        setShow2FA(true);
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const message =
        err.response?.data?.error?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await verify2FA(totpCode, sessionToken);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-auth-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-noise" />

      <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="16" r="8" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="26" cy="24" r="8" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="20" cy="20" r="3" fill="white" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">
              Welcome Back
            </h1>
            <p className="text-sand-300 text-sm mt-1">
              Sign in to your Sacco Bridge account
            </p>
          </div>

          <div className="glass rounded-2xl p-6 shadow-2xl">
            {!show2FA ? (
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300 transition-all"
                      placeholder="Enter your password"
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

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-terracotta-600 hover:text-terracotta-700">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-terracotta-600 hover:text-terracotta-700 font-medium">
                    Sign Up
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handle2FA} className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-heading font-semibold text-slate-800">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter the code from your authenticator app
                  </p>
                </div>

                {error && (
                  <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200">
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-white border border-sand-200 rounded-lg text-center text-2xl font-numbers tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
                  placeholder="000000"
                  maxLength={6}
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting || totpCode.length !== 6}
                  className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}