import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';

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
      await authApi.requestPasswordReset(values);
      setSent(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-slate mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to login
        </button>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {sent
            ? 'Check your email for the reset link.'
            : 'Enter your email and we will send you a reset link.'}
        </CardDescription>
      </CardHeader>
      {!sent && (
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@gmail.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </Form>
        </CardContent>
      )}
    </Card>
  );
}