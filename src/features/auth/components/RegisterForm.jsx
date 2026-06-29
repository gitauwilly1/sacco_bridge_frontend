import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { authApi } from '../api/authApi';
import { toast } from 'sonner';
import { getRecaptchaToken } from '@/lib/recaptcha';
import BridgeLogo from '../../../components/brand/BridgeLogo';

const registerSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  phone_number: z.string().regex(/^(?:\+?254|0)?[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  password: z.string().min(12, 'Password must be at least 12 characters'),
  password_confirm: z.string(),
  accepted_terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  accepted_privacy: z.boolean().refine((v) => v === true, 'You must accept the privacy policy'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
});

export default function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      phone_number: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
      accepted_terms: false,
      accepted_privacy: false,
    },
  });

  const watchPassword = form.watch('password');

  const updatePasswordChecks = (password) => {
    setPasswordChecks({
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?/~`]/.test(password),
    });
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const recaptchaToken = await getRecaptchaToken('register');
      await authApi.register({
        ...values,
        recaptcha: recaptchaToken,
      });
      toast.success('Account created! Please verify your email and phone.');
      onSuccess?.(values.email);
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const CheckItem = ({ passed, text }) => (
    <div className="flex items-center gap-2 text-xs">
      {passed ? (
        <Check className="h-3 w-3 text-success flex-shrink-0" />
      ) : (
        <X className="h-3 w-3 text-gray-300 flex-shrink-0" />
      )}
      <span className={passed ? 'text-success' : 'text-gray-400'}>{text}</span>
    </div>
  );

  return (
    <div className="w-full">
      <CardHeader className="text-center pb-4 pt-7 px-6">
        {/* Bridge SVG logo mark */}
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-light shadow-subtle">
          <BridgeLogo size={34} />
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate">Create Account</h1>
        <div className="mx-auto mt-1 h-0.5 w-8 rounded-full bg-terracotta opacity-60" />
        <p className="text-sm text-gray-400 mt-2">Join Sacco Bridge and start your cooperative journey</p>
      </CardHeader>

      <CardContent className="px-6 pb-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate font-medium text-sm">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate font-medium text-sm">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="janedoe@gmail.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0712 345 678" {...field} />
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
                        placeholder="Min. 12 characters"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          updatePasswordChecks(e.target.value);
                        }}
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
                  {watchPassword && (
                    <div className="mt-2 grid grid-cols-2 gap-1 p-2.5 rounded-lg bg-sand-light">
                      <CheckItem passed={passwordChecks.length} text="12+ characters" />
                      <CheckItem passed={passwordChecks.uppercase} text="Uppercase letter" />
                      <CheckItem passed={passwordChecks.lowercase} text="Lowercase letter" />
                      <CheckItem passed={passwordChecks.number} text="Number" />
                      <CheckItem passed={passwordChecks.special} text="Special character" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate font-medium text-sm">Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Re-enter your password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms checkboxes */}
            <div className="space-y-2.5 rounded-lg border border-sand bg-sand-light/50 p-3">
              <FormField
                control={form.control}
                name="accepted_terms"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-2.5">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                    </FormControl>
                    <label className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                      I accept the{' '}
                      <a href="/legal/terms" className="text-terracotta hover:underline font-medium">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/legal/privacy" className="text-terracotta hover:underline font-medium">Privacy Policy</a>
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accepted_privacy"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-2.5">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                    </FormControl>
                    <label className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                      I consent to the processing of my personal data
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              id="register-submit-btn"
              disabled={isLoading}
              className="w-full bg-terracotta hover:bg-clay text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-5 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            id="switch-to-login-btn"
            onClick={onSwitchToLogin}
            className="text-terracotta hover:text-clay hover:underline font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </CardContent>
    </div>
  );
}