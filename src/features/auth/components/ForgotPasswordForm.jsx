import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';
import { getRecaptchaToken } from '@/lib/recaptcha';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

export default function ForgotPasswordForm({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken('password_reset');
      await authApi.requestPasswordReset({
        ...values,
        recaptcha: recaptchaToken,
      });
      setSent(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <CardHeader className="pb-4 pt-6 px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-terracotta transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to login
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand-light">
            <Mail className="h-5 w-5 text-terracotta" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-slate leading-tight">Reset Password</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {sent
                ? 'Check your email inbox'
                : 'We\'ll send a reset link to your email'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-7">
        {sent ? (
          /* Success state */
          <div className="flex flex-col items-center py-6 text-center gap-3 animate-fade-up">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sand-light">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              If an account is linked to that email, you&apos;ll receive a password reset link shortly.
            </p>
            <button
              onClick={onBack}
              className="mt-2 text-sm text-terracotta hover:text-clay hover:underline font-semibold transition-colors"
            >
              Return to login
            </button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate font-medium text-sm">Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@gmail.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                id="forgot-submit-btn"
                disabled={isLoading}
                className="w-full bg-terracotta hover:bg-clay text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Sending…
                  </span>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </div>
  );
}