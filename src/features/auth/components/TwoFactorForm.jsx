import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import useAuthStore from '../../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';

const schema = z.object({
  totp_code: z.string().length(6, 'Enter the 6-digit authenticator code'),
});

export default function TwoFactorForm({ sessionToken, email, onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const { verify2FA } = useAuthStore();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { totp_code: '' },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await verify2FA(values.totp_code, sessionToken);
      toast.success('Welcome back!');
      navigate({ to: '/' });
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Invalid code. Please try again.';
      toast.error(msg);
      form.setValue('totp_code', '');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <CardHeader className="text-center pb-5 pt-7 px-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-light shadow-subtle">
          <KeyRound className="h-9 w-9 text-terracotta" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate">Two-Factor Auth</h1>
        <div className="mx-auto mt-1 h-0.5 w-8 rounded-full bg-terracotta opacity-60" />
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          Enter the 6-digit code from your{' '}
          <strong className="text-slate font-semibold">authenticator app</strong>
          {email && <> for <strong className="text-slate font-semibold">{email}</strong></>}
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="totp_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Authenticator Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className="text-center text-2xl tracking-[0.5em] font-semibold"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              id="verify-2fa-btn"
              disabled={isLoading}
              className="w-full bg-terracotta hover:bg-clay text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Verifying…
                </span>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify & Sign In
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Back link */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-slate transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </button>
        </div>

        {/* Backup codes hint */}
        <div className="mt-3 rounded-lg bg-sand-light p-3 text-center">
          <p className="text-xs text-gray-400">
            Lost your authenticator?{' '}
            <span className="text-terracotta font-semibold">Contact support</span> to use a backup code.
          </p>
        </div>
      </CardContent>
    </div>
  );
}
