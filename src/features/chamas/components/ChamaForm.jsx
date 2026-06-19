import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, Save, Users, Heart, Briefcase,
  Calculator, Plus, Trash2,
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
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { CHAMA_TYPES, CONTRIBUTION_FREQUENCIES } from '../../../utils/constants';

const chamaSchema = z.object({
  chama_name: z
    .string()
    .min(3, 'Chama name must be at least 3 characters')
    .max(100, 'Chama name must be less than 100 characters'),
  chama_type: z.enum(
    ['WELFARE_GROUP', 'INVESTMENT_CLUB', 'MERRY_GO_ROUND', 'TABLE_BANKING', 'FAMILY_GROUP', 'OTHER'],
    { errorMap: () => ({ message: 'Select a chama type' }) }
  ),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  contribution_amount: z
    .string()
    .refine(
      (val) => !val || /^\d+(\.\d{1,2})?$/.test(val),
      'Enter a valid amount'
    )
    .optional()
    .or(z.literal('')),
  contribution_frequency: z
    .enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'PER_MEETING'])
    .optional(),
  max_members: z
    .string()
    .refine(
      (val) => !val || /^\d+$/.test(val),
      'Enter a valid number'
    )
    .optional()
    .or(z.literal('')),
  is_public: z.boolean().optional(),
  initial_members: z
    .array(
      z.object({
        phone_number: z
          .string()
          .regex(/^(?:\+?254|0)?[17]\d{8}$/, 'Enter a valid Kenyan phone number'),
        name: z.string().min(1, 'Name is required'),
      })
    )
    .max(20, 'Maximum 20 initial members')
    .optional(),
});

const chamaTypeIcons = {
  WELFARE_GROUP: Heart,
  INVESTMENT_CLUB: Calculator,
  MERRY_GO_ROUND: Users,
  TABLE_BANKING: Briefcase,
  FAMILY_GROUP: Users,
  OTHER: Briefcase,
};

export default function ChamaForm({ chama, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isEditing = !!chama;

  const form = useForm({
    resolver: zodResolver(chamaSchema),
    defaultValues: {
      chama_name: chama?.chama_name || '',
      chama_type: chama?.chama_type || '',
      description: chama?.description || '',
      contribution_amount: chama?.contribution_amount?.toString() || '',
      contribution_frequency: chama?.contribution_frequency || '',
      max_members: chama?.max_members?.toString() || '',
      is_public: chama?.is_public || false,
      initial_members: [],
    },
  });

  const watchedType = form.watch('chama_type');
  const TypeIcon = chamaTypeIcons[watchedType] || Users;

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const payload = {
        ...values,
        contribution_amount: values.contribution_amount
          ? parseFloat(values.contribution_amount)
          : undefined,
        max_members: values.max_members
          ? parseInt(values.max_members, 10)
          : undefined,
      };

      let result;
      if (isEditing) {
        result = await chamaApi.updateChama(chama.id, payload);
        toast.success('Chama updated successfully!');
      } else {
        result = await chamaApi.createChama(payload);
        toast.success('Chama created successfully!');
      }

      onSuccess?.(result.data.data || result.data);
      navigate({ to: `/chamas/${result.data.data?.id || result.data?.id}` });
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        error.response?.data?.error?.details?.[0]?.message ||
        (isEditing ? 'Failed to update chama' : 'Failed to create chama');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = () => {
    const currentMembers = form.getValues('initial_members') || [];
    if (currentMembers.length >= 20) {
      toast.error('Maximum 20 initial members allowed');
      return;
    }
    form.setValue('initial_members', [
      ...currentMembers,
      { phone_number: '', name: '' },
    ]);
  };

  const removeMember = (index) => {
    const currentMembers = form.getValues('initial_members') || [];
    form.setValue(
      'initial_members',
      currentMembers.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/chamas' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">
              {isEditing ? 'Edit Chama' : 'Create Chama'}
            </h1>
            <p className="text-xs text-gray-500">
              {isEditing ? 'Update your chama details' : 'Start a new savings group'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
                <CardDescription>Tell us about your chama</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="chama_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chama Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mavuno Investment Group" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chama_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chama Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a chama type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CHAMA_TYPES).map(([value, label]) => {
                            const Icon = chamaTypeIcons[value] || Users;
                            return (
                              <SelectItem key={value} value={value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
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
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose of your chama..."
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

            {/* Contribution Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contribution Settings</CardTitle>
                <CardDescription>Set how members will contribute</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contribution_amount"
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

                  <FormField
                    control={form.control}
                    name="contribution_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CONTRIBUTION_FREQUENCIES).map(([value, label]) => (
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

                <FormField
                  control={form.control}
                  name="max_members"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Members (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 50"
                          type="number"
                          min="2"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank for unlimited members
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Initial Members (Create only) */}
            {!isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Invite Members</CardTitle>
                  <CardDescription>
                    Add phone numbers to invite members immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {form.watch('initial_members')?.map((_, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <FormField
                          control={form.control}
                          name={`initial_members.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Member name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`initial_members.${index}.phone_number`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="0712 345 678" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1"
                        onClick={() => removeMember(index)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMember}
                    disabled={(form.watch('initial_members')?.length || 0) >= 20}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Member
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate({ to: '/chamas' })}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Chama' : 'Create Chama'}
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