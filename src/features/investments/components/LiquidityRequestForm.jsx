import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
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
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import { URGENCY_LEVELS } from '../../../utils/constants';
import { formatKES } from '../../../utils/format';

const liquiditySchema = z.object({
  sacco_id: z.string().min(1, 'Select a SACCO'),
  share_class_id: z.string().min(1, 'Select a share class'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((val) => /^\d+$/.test(val), 'Enter a whole number')
    .refine((val) => parseInt(val) > 0, 'Quantity must be greater than 0'),
  price_per_share: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid price')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
  urgency: z.enum(['STANDARD', 'PRIORITY', 'URGENT'], {
    errorMap: () => ({ message: 'Select urgency level' }),
  }),
  notes: z.string().max(300, 'Notes must be less than 300 characters').optional().or(z.literal('')),
});

export default function LiquidityRequestForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: holdingsData,
    isLoading: holdingsLoading,
    error: holdingsError,
    refetch: refetchHoldings,
  } = useQuery({
    queryKey: ['my-holdings'],
    queryFn: () =>
      investmentsApi.getMyHoldings({ page_size: 100 }).then((r) => r.data),
  });

  const holdings = holdingsData?.results || holdingsData?.data || [];

  const form = useForm({
    resolver: zodResolver(liquiditySchema),
    defaultValues: {
      sacco_id: '',
      share_class_id: '',
      quantity: '',
      price_per_share: '',
      urgency: '',
      notes: '',
    },
  });

  const watchedSaccoId = form.watch('sacco_id');
  const watchedShareClassId = form.watch('share_class_id');
  const watchedQuantity = parseInt(form.watch('quantity') || '0', 10);
  const watchedPrice = parseFloat(form.watch('price_per_share') || '0');

  const selectedHolding = holdings.find(
    (h) => h.share_class_id?.toString() === watchedShareClassId
  );

  const totalValue = watchedQuantity && watchedPrice ? watchedQuantity * watchedPrice : 0;
  const isValidQuantity = selectedHolding
    ? watchedQuantity <= selectedHolding.available_to_sell
    : true;
  const isQuantityExceeded = selectedHolding
    ? watchedQuantity > selectedHolding.available_to_sell
    : false;

  const onSubmit = async (values) => {
    if (isQuantityExceeded) {
      toast.error(`You only have ${selectedHolding.available_to_sell} shares available`);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...values,
        quantity: parseInt(values.quantity, 10),
        price_per_share: parseFloat(values.price_per_share),
        sacco_id: parseInt(values.sacco_id, 10),
        share_class_id: parseInt(values.share_class_id, 10),
      };
      await investmentsApi.createRequest(payload);
      toast.success('Liquidity request created!');
      navigate({ to: '/investments/requests' });
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.error?.details?.[0]?.message ||
        'Failed to create request';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (holdingsLoading) return <PageSpinner />;
  if (holdingsError) {
    return <ErrorState message="Failed to load holdings" onRetry={refetchHoldings} />;
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/investments/requests' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to requests"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Sell Shares</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Create a liquidity request</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Share Details</CardTitle>
                <CardDescription className="text-xs text-gray-400">Select the shares you want to sell</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="sacco_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">SACCO</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('share_class_id', '');
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-sand bg-white">
                            <SelectValue placeholder="Select SACCO" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-sand bg-white">
                          {[...new Map(holdings.map((h) => [h.sacco_id, h]))].map(
                            ([_, h]) => (
                              <SelectItem key={h.sacco_id} value={h.sacco_id.toString()} className="focus:bg-sand-light focus:text-terracotta">
                                {h.sacco_name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedSaccoId && (
                  <FormField
                    control={form.control}
                    name="share_class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Share Class</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-sand bg-white">
                              <SelectValue placeholder="Select share class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-sand bg-white">
                            {holdings
                              .filter((h) => h.sacco_id?.toString() === watchedSaccoId)
                              .map((h) => (
                                <SelectItem
                                  key={h.share_class_id}
                                  value={h.share_class_id.toString()}
                                  className="focus:bg-sand-light focus:text-terracotta"
                                >
                                  {h.share_class_name} ({h.available_to_sell || 0} available)
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedHolding && (
                  <div className="bg-sand-light rounded-xl p-3.5 text-xs border border-sand/40 font-medium">
                    <span className="text-gray-400">Available to sell: </span>
                    <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {selectedHolding.available_to_sell?.toLocaleString()} shares
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Price & Quantity</CardTitle>
                <CardDescription className="text-xs text-gray-400">Set your terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Quantity</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 100"
                            type="number"
                            min="1"
                            className="font-numbers"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            {...field}
                          />
                        </FormControl>
                        {isQuantityExceeded && (
                          <p className="text-xs text-danger font-semibold flex items-center gap-1 mt-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Maximum {selectedHolding.available_to_sell} shares
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_per_share"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Price/Share (KES)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 280"
                            type="number"
                            min="0"
                            step="0.01"
                            className="font-numbers"
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {totalValue > 0 && (
                  <div className="bg-sand border border-sand-dark/20 rounded-xl p-3.5 flex justify-between items-center shadow-subtle">
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Value</span>
                    <span className="text-lg font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatKES(totalValue)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Urgency</CardTitle>
                <CardDescription className="text-xs text-gray-400">How quickly do you need to sell?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="urgency"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-sand bg-white">
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-sand bg-white">
                          {Object.entries(URGENCY_LEVELS).map(([value, label]) => (
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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Any additional details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-sand hover:bg-sand-light text-slate transition-all"
                onClick={() => navigate({ to: '/investments/requests' })}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-terracotta hover:bg-clay text-white shadow-sm transition-all duration-150 active:scale-[0.98]"
                disabled={isLoading || isQuantityExceeded}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Request
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