import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerifyCodeForm from './VerifyCodeForm';
import TwoFactorForm from './TwoFactorForm';
import BridgeLogo from '../../../components/brand/BridgeLogo';

export default function AuthLayout({ initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const [verifyEmail, setVerifyEmail] = useState('');
  const searchParams = useSearch({ strict: false }) || {};

  const handleRegisterSuccess = (email) => {
    setVerifyEmail(email);
    setView('verify');
  };

  const handleForgotPassword = () => setView('forgot');
  const handleSwitchToLogin = () => setView('login');
  const handleSwitchToRegister = () => setView('register');

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden bg-surface">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #FFF8F0 0%, #F5E6D3 40%, #FAFAF8 100%)',
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(#C67B5C 0.8px, transparent 0.8px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Orbs */}
      <div className="auth-orb w-96 h-96 bg-terracotta" style={{ top: '-8rem', right: '-6rem', animationDelay: '0s' }} />
      <div className="auth-orb w-72 h-72 bg-sand" style={{ bottom: '-4rem', left: '-4rem', animationDelay: '2s' }} />
      <div className="auth-orb w-48 h-48 bg-clay" style={{ top: '40%', left: '5%', animationDelay: '4s', opacity: 0.15 }} />

      {/* Card area */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5 animate-fade-up">
        {/* Brand */}
        <div className="flex flex-col items-center gap-1 select-none">
          <div className="flex items-center gap-2.5">
            <BridgeLogo size={32} />
            <span className="font-heading font-bold text-2xl text-slate tracking-tight">
              Sacco<span className="text-terracotta">Bridge</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 tracking-wide">Cooperative Finance Platform</p>
        </div>

        {/* Glass card */}
        <div className="w-full glass-card rounded-2xl shadow-elevated overflow-hidden">
          {view === 'login' && (
            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onForgotPassword={handleForgotPassword}
            />
          )}
          {view === 'register' && (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
          {view === 'forgot' && (
            <ForgotPasswordForm onBack={handleSwitchToLogin} />
          )}
          {view === 'verify' && (
            <VerifyCodeForm email={verifyEmail} onSuccess={handleSwitchToLogin} />
          )}
          {view === 'verify-2fa' && (
            <TwoFactorForm
              sessionToken={searchParams.session_token}
              email={searchParams.email}
              onBack={handleSwitchToLogin}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">
          Secured by end-to-end encryption &middot; Kenya Co-operative Law compliant
        </p>
      </div>
    </div>
  );
}