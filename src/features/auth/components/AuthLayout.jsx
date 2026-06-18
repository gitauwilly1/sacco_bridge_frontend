import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerifyCodeForm from './VerifyCodeForm';

export default function AuthLayout() {
  const [view, setView] = useState('login');
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleRegisterSuccess = (email) => {
    setVerifyEmail(email);
    setView('verify');
  };

  const handleForgotPassword = () => setView('forgot');
  const handleSwitchToLogin = () => setView('login');
  const handleSwitchToRegister = () => setView('register');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sand-light to-surface px-4 py-12">
      <div className="w-full max-w-md">
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
      </div>
    </div>
  );
}