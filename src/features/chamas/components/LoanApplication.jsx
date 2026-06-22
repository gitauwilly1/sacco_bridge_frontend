import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, HandCoins, Calculator, Shield,
  AlertCircle, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { formatKES, formatDate } from '../../../utils/format';

const loanSchema = z.object({
  purpose: z
    .string()
    .min(3, 'Purpose must be at least 3 characters')
    .max(200, 'Purpose must be less than 200 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  term_months: z
    .string()
    .min(1, 'Term is required')
    .refine((val) => /^\d+$/.test(val), 'Enter a valid number of months')
    .refine(
      (val) => parseInt(val) >= 1 && parseInt(val) <= 60,
      'Term must be between 1 and 60 months'
    ),
  repayment_frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY'], {
    errorMap: () => ({ message: 'Select repayment frequency' }),
  }),
  guarantor_id: z.string().optional().or(z.literal('')),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

const frequencyLabels = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
};

export default function LoanApplication() {
  const { chamaId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['chama', chamaId],
    queryFn: () => chamaApi.getChamaDashboard(chamaId).then((r) => r.data.data),
    enabled: !!chamaId,
  });

  const { data: membersData } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  const members = membersData?.data || membersData?.results || [];

  const form = useForm({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      purpose: '',
      amount: '',
      term_months: '',
      repayment_frequency: '',
      guarantor_id: '',
      notes: '',
    },
  });

  const watchedAmount = parseFloat(form.watch('amount') || '0');
  const watchedTerm = parseInt(form.watch('term_months') || '0', 10);

  const availableBalance = dashboard?.available_balance || 0;
  const maxLoanAmount = availableBalance * 3;

  const estimatedInterestRate = useMemo(() => {
    if (!watchedAmount || !watchedTerm) return null;
    const baseRate = 5;
    const termPremium = Math.min(watchedTerm * 0.5, 10);
    return baseRate + termPremium;
  }, [watchedAmount, watchedTerm]);

  const estimatedMonthlyPayment = useMemo(() => {
    if (!watchedAmount || !watchedTerm || !estimatedInterestRate) return null;
    const monthlyRate = estimatedInterestRate / 100 / 12;
    const totalPayments = watchedTerm;
    
    if (monthlyRate === 0) {
      return watchedAmount / totalPayments;
    }

    const payment =
      (watchedAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return payment;
  }, [watchedAmount, watchedTerm, estimatedInterestRate]);

  const totalRepayment = useMemo(() => {
    if (!estimatedMonthlyPayment || !watchedTerm) return null;
    return estimatedMonthlyPayment * watchedTerm;
  }, [estimatedMonthlyPayment, watchedTerm]);

  const isAmountValid = watchedAmount > 0 && watchedAmount <= maxLoanAmount;
  const isAmountExceeded = watchedAmount > maxLoanAmount;

  const onSubmit = async (values) => {
    if (isAmountExceeded) {
      toast.error(`Loan amount cannot exceed ${formatKES(maxLoanAmount)}`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        amount: parseFloat(values.amount),
        term_months: parseInt(values.term_months, 10),
        guarantor_id: values.guarantor_id
          ? parseInt(values.guarantor_id, 10)
          : undefined,
      };

      await chamaApi.applyLoan(chamaId, payload);
      toast.success('Loan application submitted successfully!');
      navigate({ to: `/chamas/${chamaId}` });
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.error?.details?.[0]?.message ||
        'Failed to submit loan application';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (dashboardLoading) return <PageSpinner />;
  if (dashboardError) {
    return <ErrorState message="Failed to load chama details" onRetry={refetchDashboard} />;
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: `/chamas/${chamaId}` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to chama"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Apply for Loan</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Submit a loan application</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Eligibility Card */}
        <Card className="mb-6 bg-sand border border-sand-dark/20 shadow-subtle overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center divide-x divide-sand-dark/25">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Available Balance</p>
                <p className="text-lg font-bold text-success font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(availableBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Max Loan Limit</p>
                <p className="text-lg font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(maxLoanAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Loan Details */}
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Loan Details</CardTitle>
                <CardDescription className="text-xs text-gray-400">Tell us about the loan you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">Purpose</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Business expansion, school fees, emergency..."
                          className="resize-none border-sand bg-white focus-visible:border-terracotta"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] text-gray-400 font-medium">
                        Briefly describe why you need this loan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">Amount (KES)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 50000"
                          type="number"
                          min="0"
                          step="0.01"
                          max={maxLoanAmount}
                          className="font-numbers"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                          {...field}
                        />
                      </FormControl>
                      {isAmountExceeded && (
                        <p className="text-xs text-danger font-semibold flex items-center gap-1 mt-1.5">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Maximum loan amount is {formatKES(maxLoanAmount)}
                        </p>
                      )}
                      {isAmountValid && (
                        <p className="text-xs text-success font-semibold flex items-center gap-1 mt-1.5">
                          Amount is within eligible limit
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="term_months"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Term (Months)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 12"
                            type="number"
                            min="1"
                            max="60"
                            className="font-numbers"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repayment_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Repayment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-sand bg-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-sand bg-white">
                            {Object.entries(frequencyLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value} className="focus:bg-sand-light focus:text-terracotta">
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Loan Preview */}
            {watchedAmount > 0 && watchedTerm > 0 && estimatedInterestRate && (
              <Card className="border-terracotta/30 bg-sand-light/20 shadow-subtle overflow-hidden">
                <CardHeader className="pb-3 border-b border-sand/40 bg-sand-light/40">
                  <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
                    <Calculator className="h-4.5 w-4.5 text-terracotta" />
                    Loan Preview
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">Estimated repayment breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Loan Amount</span>
                    <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatKES(watchedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Interest Rate</span>
                    <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{estimatedInterestRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Term</span>
                    <span className="font-bold text-slate">{watchedTerm} months</span>
                  </div>
                  {estimatedMonthlyPayment && (
                    <div className="flex justify-between text-sm pt-3 border-t border-sand/40 font-medium">
                      <span className="text-gray-500">Monthly Payment</span>
                      <span className="font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {formatKES(estimatedMonthlyPayment)}
                      </span>
                    </div>
                  )}
                  {totalRepayment && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-500">Total Repayment</span>
                      <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatKES(totalRepayment)}</span>
                    </div>
                  )}
                  <div className="bg-sand-light rounded-xl p-3 text-xs text-gray-400 font-medium border border-sand/40 flex items-start gap-2 mt-2">
                    <Info className="h-4.5 w-4.5 flex-shrink-0 text-slate mt-0.5" />
                    <span>
                      This is an estimate. Final terms will be confirmed upon approval.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guarantor */}
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-terracotta" />
                  Guarantor (Optional)
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Select a member to guarantee your loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="guarantor_id"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-sand bg-white">
                            <SelectValue placeholder="Select a guarantor (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-sand bg-white">
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()} className="focus:bg-sand-light focus:text-terracotta">
                              {member.user_name || member.user?.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[10px] text-gray-400 font-medium">
                        A guarantor may be required for larger loan amounts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Additional Notes</CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Any other information you'd like to share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about your loan request..."
                          className="resize-none border-sand bg-white focus-visible:border-terracotta"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] text-gray-400 font-medium">
                        {field.value?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-sand hover:bg-sand-light text-slate transition-all"
                onClick={() => navigate({ to: `/chamas/${chamaId}` })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-terracotta hover:bg-clay text-white shadow-sm transition-all duration-150 active:scale-[0.98]"
                disabled={isLoading || isAmountExceeded}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <>
                    <HandCoins className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}