import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Wallet, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { getInitials, formatKES } from '../../../utils/format';

const contributionSchema = z.object({
  member_id: z.string().min(1, 'Select a member'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount')
    .refine((val) => parseFloat(val) > 0, 'Amount must be greater than 0'),
  period_start: z.string().min(1, 'Start date is required'),
  period_end: z.string().min(1, 'End date is required'),
  payment_method: z.enum(['MPESA', 'BANK_TRANSFER', 'CASH', 'STANDING_ORDER', 'OTHER'], {
    errorMap: () => ({ message: 'Select payment method' }),
  }),
  payment_reference: z.string().optional().or(z.literal('')),
  notes: z.string().max(200, 'Notes must be less than 200 characters').optional().or(z.literal('')),
});

const paymentMethodLabels = {
  MPESA: 'M-Pesa',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
  STANDING_ORDER: 'Standing Order',
  OTHER: 'Other',
};

export default function RecordContribution() {
  const { chamaId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  const members = membersData?.data || membersData?.results || [];

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        (m.user_name || m.user?.full_name || '').toLowerCase().includes(query) ||
        (m.user_email || m.user?.email || '').toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  const form = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      member_id: '',
      amount: '',
      period_start: '',
      period_end: '',
      payment_method: '',
      payment_reference: '',
      notes: '',
    },
  });

  const selectedMemberId = form.watch('member_id');
  const selectedMember = members.find((m) => m.id?.toString() === selectedMemberId);

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      await chamaApi.recordContribution(chamaId, {
        ...values,
        amount: parseFloat(values.amount),
      });
      toast.success('Contribution recorded successfully!');
      navigate({ to: `/chamas/${chamaId}` });
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.error?.details?.[0]?.message ||
        'Failed to record contribution';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (membersLoading) return <PageSpinner />;
  if (membersError) return <ErrorState message="Failed to load members" onRetry={refetchMembers} />;

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
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Record Contribution</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Record a member contribution</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Member Selection */}
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Select Member</CardTitle>
                <CardDescription className="text-xs text-gray-400">Choose the contributing member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search members..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="member_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {filteredMembers.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => field.onChange(member.id.toString())}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                                field.value === member.id.toString()
                                  ? 'border-terracotta bg-terracotta/5'
                                  : 'border-sand hover:border-terracotta/40 bg-white'
                              }`}
                            >
                              <Avatar className="h-10 w-10 ring-2 ring-sand/30 flex-shrink-0">
                                <AvatarFallback className="bg-sand-light text-terracotta font-semibold text-sm">
                                  {getInitials(
                                    member.user_name || member.user?.first_name,
                                    ''
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-semibold text-slate truncate">
                                  {member.user_name || member.user?.full_name}
                                </p>
                                <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                                  {member.user_email || member.user?.email}
                                </p>
                              </div>
                              {member.total_contributions > 0 && (
                                <span className="text-xs text-success font-bold font-numbers flex-shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                  {formatKES(member.total_contributions)}
                                </span>
                              )}
                            </button>
                          ))}
                          {filteredMembers.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4 font-medium">
                              No members found
                            </p>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedMember && (
                  <div className="bg-sand-light rounded-lg p-3 text-xs border border-sand/40">
                    <span className="text-gray-400 font-medium">Selected: </span>
                    <span className="font-semibold text-slate">
                      {selectedMember.user_name || selectedMember.user?.full_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contribution Details */}
            <Card className="border-sand bg-white shadow-subtle">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate">Contribution Details</CardTitle>
                <CardDescription className="text-xs text-gray-400">Enter the contribution information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">Amount (KES)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1000"
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="period_start"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Period Start</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period_end"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate font-medium text-xs">Period End</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-sand bg-white">
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-sand bg-white">
                          {Object.entries(paymentMethodLabels).map(([value, label]) => (
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
                  name="payment_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate font-medium text-xs">Payment Reference (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., M-Pesa transaction code" {...field} />
                      </FormControl>
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
                        <Input placeholder="Any additional notes..." {...field} />
                      </FormControl>
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Recording...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Record Contribution
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