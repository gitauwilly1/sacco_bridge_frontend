import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import useAuthStore from '../../../stores/authStore';
import { toast } from 'sonner';
import BridgeLogo from '../../../components/brand/BridgeLogo';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginForm({ onSuccess, onSwitchToRegister, onForgotPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, googleLogin } = useAuthStore();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const result = await login(values.email, values.password);

      if (result.requires2FA) {
        navigate({
          to: '/verify-2fa',
          search: { session_token: result.sessionToken, email: values.email },
        });
        return;
      }

      toast.success('Welcome back!');
      onSuccess?.();
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setIsLoading(true);
    try {
      await googleLogin(response.credential);
      toast.success('Welcome back!');
      onSuccess?.();
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Google Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;
    
    const initGoogleBtn = () => {
      if (window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '134711840304-ockr8g82imvcnfhk387oodp1uikno8pc.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
          });
          
          const container = document.getElementById("google-signin-btn-container");
          if (container) {
            window.google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              width: 350,
              text: "continue_with",
            });
          }
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error("Google Client SDK init failed:", err);
        }
      }
    };

    initGoogleBtn();
    if (!window.google) {
      intervalId = setInterval(initGoogleBtn, 300);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="w-full">
      <CardHeader className="text-center pb-5 pt-7 px-6">
        {/* Bridge SVG logo mark */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-light shadow-subtle">
          <BridgeLogo size={38} />
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate">Welcome Back</h1>
        {/* Terracotta accent underline */}
        <div className="mx-auto mt-1 h-0.5 w-8 rounded-full bg-terracotta opacity-60" />
        <p className="text-sm text-gray-400 mt-2">Sign in to your Sacco Bridge account</p>
      </CardHeader>

      <CardContent className="px-6 pb-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe@gmail.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-terracotta hover:text-clay hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full bg-terracotta hover:bg-clay text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-sand" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-medium">or continue with</span>
          </div>
        </div>

        <div className="relative">
          <Button
            variant="outline"
            id="login-google-btn"
            className="w-full border-sand hover:bg-sand-light hover:border-terracotta/40 transition-all flex items-center justify-center"
            type="button"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>
          <div
            id="google-signin-btn-container"
            className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer"
          />
        </div>

        <p className="mt-5 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            id="switch-to-register-btn"
            onClick={onSwitchToRegister}
            className="text-terracotta hover:text-clay hover:underline font-semibold transition-colors"
          >
            Sign up
          </button>
        </p>
      </CardContent>
    </div>
  );
}