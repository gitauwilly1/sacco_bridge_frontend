import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';

const schema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
});

export default function VerifyCodeForm({ email, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { otp: '' } });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await authApi.verifyEmail({ email, otp: values.otp });
      toast.success('Email verified! You can now sign in.');
      onSuccess?.();
    } catch (error) {
      toast.error('Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendCode({ contact: email, method: 'email' });
      toast.success('New code sent!');
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Please wait before requesting another code.';
      toast.error(msg);
    }
  };

  return (
    <div className="w-full">
      <CardHeader className="text-center pb-5 pt-7 px-6">
        {/* Shield icon in sand bubble */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sand-light shadow-subtle">
          <ShieldCheck className="h-9 w-9 text-terracotta" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate">Verify Your Email</h1>
        <div className="mx-auto mt-1 h-0.5 w-8 rounded-full bg-terracotta opacity-60" />
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          We sent a 6-digit code to{' '}
          <strong className="text-slate font-semibold">{email}</strong>
        </p>
      </CardHeader>

      <CardContent className="px-6 pb-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000000"
                      maxLength={6}
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
              id="verify-submit-btn"
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
                  Verify Email
                </>
              )}
            </Button>
          </form>
        </Form>

        {/* Resend link */}
        <div className="mt-5 text-center rounded-lg bg-sand-light p-3">
          <p className="text-xs text-gray-400">
            Didn&apos;t receive the code?{' '}
            <button
              id="resend-code-btn"
              onClick={handleResend}
              className="text-terracotta hover:text-clay hover:underline font-semibold transition-colors"
            >
              Resend code
            </button>
          </p>
        </div>
      </CardContent>
    </div>
  );
}