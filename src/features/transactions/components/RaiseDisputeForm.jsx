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
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/transactions/${settlementId}` })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">Raise Dispute</h1>
            <p className="text-xs text-gray-500">Settlement #{settlementId}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Settlement Summary */}
        {settlement && (
          <Card className="mb-4 bg-sand-light border-0">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500">SACCO</p>
                  <p className="font-semibold text-slate">{settlement.sacco_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-semibold text-terracotta">
                    {formatKES(settlement.total_value)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cooling Period Warning */}
        <Card className="mb-6 border-alert/30 bg-alert/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-alert flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-alert">
                30-Minute Cooling Period
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Disputes can only be raised after 30 minutes from settlement creation.
                This allows time for the system to process the transaction normally.
              </p>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dispute Details</CardTitle>
                <CardDescription>
                  Explain the issue with this settlement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a reason" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(disputeReasons).map(([value, label]) => (
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what went wrong with this transaction..."
                          className="resize-none"
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/1000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">What happens next?</p>
                  <ol className="list-decimal list-inside space-y-1">
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
                className="flex-1"
                onClick={() => navigate({ to: `/transactions/${settlementId}` })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
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