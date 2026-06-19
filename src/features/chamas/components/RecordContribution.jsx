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
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}` })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">Record Contribution</h1>
            <p className="text-xs text-gray-500">Record a member contribution</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Member Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Member</CardTitle>
                <CardDescription>Choose the contributing member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
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
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {filteredMembers.map((member) => (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => field.onChange(member.id.toString())}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                field.value === member.id.toString()
                                  ? 'border-terracotta bg-terracotta/5'
                                  : 'border-gray-200 hover:border-terracotta/50'
                              }`}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-sand-light text-terracotta text-sm">
                                  {getInitials(
                                    member.user_name || member.user?.first_name,
                                    ''
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-slate">
                                  {member.user_name || member.user?.full_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {member.user_email || member.user?.email}
                                </p>
                              </div>
                              {member.total_contributions > 0 && (
                                <span className="text-xs text-success font-medium">
                                  {formatKES(member.total_contributions)}
                                </span>
                              )}
                            </button>
                          ))}
                          {filteredMembers.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
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
                  <div className="bg-sand-light rounded-lg p-3 text-sm">
                    <span className="text-gray-500">Selected: </span>
                    <span className="font-medium text-slate">
                      {selectedMember.user_name || selectedMember.user?.full_name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contribution Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contribution Details</CardTitle>
                <CardDescription>Enter the contribution information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (KES)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1000"
                          type="number"
                          min="0"
                          step="0.01"
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
                        <FormLabel>Period Start</FormLabel>
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
                        <FormLabel>Period End</FormLabel>
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
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(paymentMethodLabels).map(([value, label]) => (
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
                  name="payment_reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Reference (Optional)</FormLabel>
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
                      <FormLabel>Notes (Optional)</FormLabel>
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
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: `/chamas/${chamaId}` })}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  'Recording...'
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