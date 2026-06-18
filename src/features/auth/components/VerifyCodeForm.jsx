import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-terracotta mb-4" />
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-2xl tracking-[0.5em]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Didn't receive the code?{' '}
          <button onClick={handleResend} className="text-terracotta hover:underline font-medium">
            Resend
          </button>
        </p>
      </CardContent>
    </Card>
  );
}