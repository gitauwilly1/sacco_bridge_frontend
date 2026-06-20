import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, HandCoins, Calculator, Shield, Save,
  AlertCircle, TrendingUp, Wallet, Info,
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
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { formatKES } from '../../../utils/format';

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
  const maxLoanAmount = availableBalance * 3; // Example: 3x available balance

  const estimatedInterestRate = useMemo(() => {
    if (!watchedAmount || !watchedTerm) return null;
    // Simple interest rate calculation based on term
    const baseRate = 5; // 5% base rate
    const termPremium = Math.min(watchedTerm * 0.5, 10); // 0.5% per month, max 10%
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
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}` })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">Apply for Loan</h1>
            <p className="text-xs text-gray-500">Submit a loan application</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Eligibility Card */}
        <Card className="mb-6 bg-sand-light border-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 mb-1">Available Balance</p>
                <p className="text-lg font-bold text-success">
                  {formatKES(availableBalance)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Max Loan</p>
                <p className="text-lg font-bold text-terracotta">
                  {formatKES(maxLoanAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loan Details</CardTitle>
                <CardDescription>Tell us about the loan you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Business expansion, school fees, emergency..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
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
                      <FormLabel>Amount (KES)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 50000"
                          type="number"
                          min="0"
                          step="0.01"
                          max={maxLoanAmount}
                          {...field}
                        />
                      </FormControl>
                      {isAmountExceeded && (
                        <p className="text-xs text-danger mt-1">
                          Maximum loan amount is {formatKES(maxLoanAmount)}
                        </p>
                      )}
                      {isAmountValid && (
                        <p className="text-xs text-success mt-1">
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
                        <FormLabel>Term (Months)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 12"
                            type="number"
                            min="1"
                            max="60"
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
                        <FormLabel>Repayment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(frequencyLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
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
              <Card className="border-terracotta/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-terracotta" />
                    Loan Preview
                  </CardTitle>
                  <CardDescription>Estimated repayment breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Loan Amount</span>
                    <span className="font-semibold text-slate">{formatKES(watchedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Interest Rate</span>
                    <span className="font-semibold text-slate">{estimatedInterestRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Term</span>
                    <span className="font-semibold text-slate">{watchedTerm} months</span>
                  </div>
                  {estimatedMonthlyPayment && (
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-500">Monthly Payment</span>
                      <span className="font-semibold text-terracotta">
                        {formatKES(estimatedMonthlyPayment)}
                      </span>
                    </div>
                  )}
                  {totalRepayment && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Repayment</span>
                      <span className="font-semibold text-slate">{formatKES(totalRepayment)}</span>
                    </div>
                  )}
                  <div className="bg-sand-light rounded-lg p-3 text-xs text-gray-500 flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      This is an estimate. Final terms will be confirmed upon approval.
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Guarantor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-terracotta" />
                  Guarantor (Optional)
                </CardTitle>
                <CardDescription>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Select a guarantor (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {members.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.user_name || member.user?.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        A guarantor may be required for larger loan amounts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Additional Notes</CardTitle>
                <CardDescription>
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
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: `/chamas/${chamaId}` })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || isAmountExceeded}
              >
                {isLoading ? (
                  'Submitting...'
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