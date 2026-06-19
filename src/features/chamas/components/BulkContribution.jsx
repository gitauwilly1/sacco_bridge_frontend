// src/features/chamas/components/BulkContribution.jsx

import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Upload, Plus, Trash2, Save, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { chamaApi } from '../api/chamaApi';
import { formatKES } from '../../../utils/format';

const paymentMethodLabels = {
  MPESA: 'M-Pesa',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
  STANDING_ORDER: 'Standing Order',
  OTHER: 'Other',
};

export default function BulkContribution() {
  const { chamaId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MPESA');
  const [entries, setEntries] = useState([
    { member_id: '', amount: '', payment_reference: '', notes: '' },
  ]);
  const [errors, setErrors] = useState({});

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

  const addEntry = () => {
    setEntries([...entries, { member_id: '', amount: '', payment_reference: '', notes: '' }]);
    setErrors({});
  };

  const removeEntry = (index) => {
    if (entries.length <= 1) {
      toast.error('Must have at least one entry');
      return;
    }
    setEntries(entries.filter((_, i) => i !== index));
    setErrors({});
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
    setErrors({});
  };

  const getTotalAmount = () => {
    return entries.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!periodStart) newErrors.periodStart = 'Start date is required';
    if (!periodEnd) newErrors.periodEnd = 'End date is required';
    if (!paymentMethod) newErrors.paymentMethod = 'Payment method is required';

    entries.forEach((entry, index) => {
      if (!entry.member_id) {
        newErrors[`entry_${index}_member`] = 'Select a member';
      }
      if (!entry.amount || parseFloat(entry.amount) <= 0) {
        newErrors[`entry_${index}_amount`] = 'Enter a valid amount';
      }
    });

    // Check for duplicate members
    const memberIds = entries.map((e) => e.member_id).filter(Boolean);
    const duplicates = memberIds.filter((id, index) => memberIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      newErrors.duplicates = 'Each member can only appear once in a bulk entry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        period_start: periodStart,
        period_end: periodEnd,
        payment_method: paymentMethod,
        contributions: entries.map((entry) => ({
          member_id: parseInt(entry.member_id, 10),
          amount: parseFloat(entry.amount),
          payment_reference: entry.payment_reference || undefined,
          notes: entry.notes || undefined,
        })),
      };

      await chamaApi.bulkRecordContributions(chamaId, payload);
      toast.success(`${entries.length} contributions recorded successfully!`);
      navigate({ to: `/chamas/${chamaId}` });
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.error?.details?.[0]?.message ||
        'Failed to record contributions';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast.error('CSV file must have a header row and at least one data row');
          return;
        }

        const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
        const memberIdIndex = headers.findIndex((h) => h === 'member_id' || h === 'member id');
        const amountIndex = headers.findIndex((h) => h === 'amount');
        const refIndex = headers.findIndex((h) => h === 'payment_reference' || h === 'reference');
        const notesIndex = headers.findIndex((h) => h === 'notes');

        if (memberIdIndex === -1 || amountIndex === -1) {
          toast.error('CSV must have "member_id" and "amount" columns');
          return;
        }

        const newEntries = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.trim());
          newEntries.push({
            member_id: values[memberIdIndex] || '',
            amount: values[amountIndex] || '',
            payment_reference: refIndex !== -1 ? values[refIndex] || '' : '',
            notes: notesIndex !== -1 ? values[notesIndex] || '' : '',
          });
        }

        setEntries(newEntries);
        toast.success(`Loaded ${newEntries.length} entries from CSV`);
      } catch (err) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
            <h1 className="text-lg font-bold text-slate">Bulk Contribution</h1>
            <p className="text-xs text-gray-500">Record multiple contributions at once</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Period & Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contribution Period</CardTitle>
            <CardDescription>Set period and payment method for all entries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Period Start</label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                />
                {errors.periodStart && (
                  <p className="text-xs text-danger mt-1">{errors.periodStart}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Period End</label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                />
                {errors.periodEnd && (
                  <p className="text-xs text-danger mt-1">{errors.periodEnd}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentMethodLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* CSV Upload */}
        <Card>
          <CardContent className="p-4">
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-terracotta/50 transition-colors">
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Upload CSV file</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
            </label>
            <p className="text-xs text-gray-400 mt-2 text-center">
              CSV format: member_id, amount, payment_reference, notes
            </p>
          </CardContent>
        </Card>

        {/* Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Contributions</CardTitle>
              <CardDescription>
                {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} · Total: {formatKES(getTotalAmount())}
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addEntry}>
              <Plus className="h-4 w-4 mr-1" /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {errors.duplicates && (
              <p className="text-xs text-danger bg-danger/5 p-2 rounded">{errors.duplicates}</p>
            )}
            
            {entries.map((entry, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Entry {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(index)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>

                <div>
                  <Select
                    value={entry.member_id}
                    onValueChange={(value) => updateEntry(index, 'member_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          {member.user_name || member.user?.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`entry_${index}_member`] && (
                    <p className="text-xs text-danger mt-1">{errors[`entry_${index}_member`]}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Input
                      placeholder="Amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.amount}
                      onChange={(e) => updateEntry(index, 'amount', e.target.value)}
                    />
                    {errors[`entry_${index}_amount`] && (
                      <p className="text-xs text-danger mt-1">{errors[`entry_${index}_amount`]}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Reference (optional)"
                      value={entry.payment_reference}
                      onChange={(e) => updateEntry(index, 'payment_reference', e.target.value)}
                    />
                  </div>
                </div>

                <Input
                  placeholder="Notes (optional)"
                  value={entry.notes}
                  onChange={(e) => updateEntry(index, 'notes', e.target.value)}
                />
              </div>
            ))}
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
            type="button"
            className="flex-1"
            disabled={isLoading || entries.length === 0}
            onClick={handleSubmit}
          >
            {isLoading ? (
              'Recording...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Record {entries.length} Contribution{entries.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}