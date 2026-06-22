import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, AlertCircle, Clock, Save, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { transactionApi } from '../api/transactionApi';
import { formatKES } from '../../../utils/format';

const disputeReasons = {
  WRONG_AMOUNT: 'Wrong amount deducted/credited',
  UNAUTHORIZED: 'Unauthorized transaction',
  DELAYED_SETTLEMENT: 'Settlement taking too long',
  DUPLICATE: 'Duplicate transaction',
  COUNTERPARTY_ISSUE: 'Issue with counterparty',
  OTHER: 'Other',
};

const disputeSchema = z.object({
  reason: z.enum(
    ['WRONG_AMOUNT', 'UNAUTHORIZED', 'DELAYED_SETTLEMENT', 'DUPLICATE', 'COUNTERPARTY_ISSUE', 'OTHER'],
    { errorMap: () => ({ message: 'Select a reason' }) }
  ),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
});

export default function RaiseDisputeForm() {
  const { settlementId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: settlement,
    isLoading: settlementLoading,
    error: settlementError,
    refetch: refetchSettlement,
  } = useQuery({
    queryKey: ['settlement', settlementId],
    queryFn: () =>
      transactionApi
        .getSettlementDetail(settlementId)
        .then((r) => r.data.data || r.data),
    enabled: !!settlementId,
  });

  const form = useForm({
    resolver: zodResolver(disputeSchema),
    defaultValues: {
      reason: '',
      description: '',
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await transactionApi.raiseDispute(settlementId, values);
      toast.success('Dispute raised. A trustee will review it.');
      navigate({ to: '/disputes' });
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.error?.details?.[0]?.message ||
        'Failed to raise dispute';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (settlementLoading) return <PageSpinner />;
  if (settlementError) {
    return <ErrorState message="Failed to load settlement" onRetry={refetchSettlement} />;
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: `/transactions/${settlementId}` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to transaction"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Raise Dispute</h1>
            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">Settlement #{settlementId}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Settlement Summary */}
        {settlement && (
          <Card className="mb-4 bg-sand-light/50 border border-sand/40 shadow-none rounded-xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">SACCO</p>
                  <p className="text-sm font-bold text-slate truncate">{settlement.sacco_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Amount</p>
                  <p className="text-sm font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatKES(settlement.total_value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cooling Period Warning */}
        <Card className="mb-6 border-alert/20 bg-alert/5 text-alert rounded-xl shadow-none">
          <CardContent className="p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-alert flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-alert">
                30-Minute Cooling Period
              </p>
              <p className="text-xs text-slate-dark/80 mt-1 leading-relaxed">
                Disputes can only be raised after 30 minutes from settlement creation.
                This allows time for the system to process the transaction normally.
              </p>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate">Dispute Details</CardTitle>
                <CardDescription className="text-xs text-gray-400 font-medium">
                  Explain the issue with this settlement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">Reason</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 cursor-pointer">
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-sand shadow-subtle rounded-xl">
                          {Object.entries(disputeReasons).map(([value, label]) => (
                            <SelectItem key={value} value={value} className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what went wrong with this transaction..."
                          className="resize-none border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] text-gray-400 font-semibold text-right">
                        {field.value?.length || 0}/1000 characters
                      </FormDescription>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5 text-slate rounded-xl shadow-none">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-medium">
                  <p className="font-bold mb-1 text-slate">What happens next?</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-500 leading-relaxed">
                    <li>A trustee will be notified of your dispute</li>
                    <li>They will review the transaction details</li>
                    <li>You may be contacted for additional information</li>
                    <li>A resolution will be provided within 3-5 business days</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-sand hover:bg-sand-light text-slate cursor-pointer h-10 rounded-xl text-xs font-semibold"
                onClick={() => navigate({ to: `/transactions/${settlementId}` })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-10 rounded-xl text-xs font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Submitting...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Dispute
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