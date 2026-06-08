import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff, Phone, User } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    accepted_terms: false,
    accepted_privacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.phone_number) errors.phone_number = 'Phone number is required';
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.password.length < 12) errors.password = 'Password must be at least 12 characters';
    if (formData.password !== formData.password_confirm) errors.password_confirm = 'Passwords do not match';
    if (!formData.accepted_terms) errors.accepted_terms = 'You must accept the Terms of Service';
    if (!formData.accepted_privacy) errors.accepted_privacy = 'You must accept the Privacy Policy';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      setIsSuccess(true);
    } catch (err) {
      const serverErrors = err.response?.data?.error?.details || [];
      if (serverErrors.length > 0) {
        const mappedErrors = {};
        serverErrors.forEach((item) => {
          mappedErrors[item.field] = item.message;
        });
        setFieldErrors(mappedErrors);
      } else {
        setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-auth-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-noise" />
        <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-12">
          <div className="max-w-sm mx-auto w-full text-center">
            <div className="glass rounded-2xl p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-heading font-bold text-slate-800 mb-2">
                Registration Successful
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Please verify your email and phone number to activate your account.
                We have sent verification codes to both.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 transition-all duration-200"
              >
                Proceed to Login
              </button>
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
              Create Account
            </h1>
            <p className="text-sand-300 text-sm mt-1">
              Join Sacco Bridge today
            </p>
          </div>

          <div className="glass rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="bg-error-50 text-error-700 text-sm px-4 py-3 rounded-lg border border-error-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                        fieldErrors.first_name ? 'border-error-300' : 'border-sand-200'
                      }`}
                      placeholder="Jane"
                    />
                  </div>
                  {fieldErrors.first_name && (
                    <p className="text-error-600 text-xs mt-0.5">{fieldErrors.first_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                        fieldErrors.last_name ? 'border-error-300' : 'border-sand-200'
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                  {fieldErrors.last_name && (
                    <p className="text-error-600 text-xs mt-0.5">{fieldErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                      fieldErrors.email ? 'border-error-300' : 'border-sand-200'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-error-600 text-xs mt-0.5">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                      fieldErrors.phone_number ? 'border-error-300' : 'border-sand-200'
                    }`}
                    placeholder="0712345678"
                  />
                </div>
                {fieldErrors.phone_number && (
                  <p className="text-error-600 text-xs mt-0.5">{fieldErrors.phone_number}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-9 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                      fieldErrors.password ? 'border-error-300' : 'border-sand-200'
                    }`}
                    placeholder="Min 12 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-error-600 text-xs mt-0.5">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all ${
                      fieldErrors.password_confirm ? 'border-error-300' : 'border-sand-200'
                    }`}
                    placeholder="Re-enter password"
                  />
                </div>
                {fieldErrors.password_confirm && (
                  <p className="text-error-600 text-xs mt-0.5">{fieldErrors.password_confirm}</p>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accepted_terms"
                    checked={formData.accepted_terms}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-sand-300 text-terracotta-500 focus:ring-terracotta-300"
                  />
                  <span className="text-xs text-slate-600">
                    I accept the{' '}
                    <Link to="/terms" className="text-terracotta-600 hover:text-terracotta-700 underline">
                      Terms of Service
                    </Link>
                  </span>
                </label>
                {fieldErrors.accepted_terms && (
                  <p className="text-error-600 text-xs">{fieldErrors.accepted_terms}</p>
                )}

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="accepted_privacy"
                    checked={formData.accepted_privacy}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded border-sand-300 text-terracotta-500 focus:ring-terracotta-300"
                  />
                  <span className="text-xs text-slate-600">
                    I accept the{' '}
                    <Link to="/privacy" className="text-terracotta-600 hover:text-terracotta-700 underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {fieldErrors.accepted_privacy && (
                  <p className="text-error-600 text-xs">{fieldErrors.accepted_privacy}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-terracotta-600 hover:text-terracotta-700 font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}