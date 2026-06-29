import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Webhook, Plus, RefreshCw, Eye, RotateCcw, Key, Trash2, X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDateTime, formatTimeAgo } from '../../../utils/format';
import DataTable from './DataTable';

const webhookSchema = z.object({
  url: z.string().url('Enter a valid URL'),
  event_type: z.string().min(1, 'Select an event type'),
  description: z.string().optional().or(z.literal('')),
});

const eventTypes = [
  'settlement.created',
  'settlement.completed',
  'dispute.created',
  'dispute.resolved',
  'user.verified',
  'chama.created',
];

export default function WebhookManagement() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [viewDeliveries, setViewDeliveries] = useState(null);

  const {
    data: webhooksData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-webhooks', page],
    queryFn: () =>
      adminApi.getWebhooks({ page, page_size: 15 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-webhooks'] });
      toast.success('Webhook deleted');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Failed to delete'),
  });

  const regenerateMutation = useMutation({
    mutationFn: (id) => adminApi.regenerateWebhookSecret(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-webhooks'] });
      toast.success('Secret regenerated');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Failed'),
  });

  const webhooks = webhooksData?.results || webhooksData?.data || [];
  const total = webhooksData?.pagination?.count ?? webhooksData?.count ?? webhooks.length;

  const columns = [
    {
      key: 'url',
      header: 'URL',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate text-sm truncate max-w-[250px]">{row.url}</p>
          <p className="text-xs text-gray-500">{row.event_type}</p>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (value) => (
        <Badge
          className={value ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-600'}
          variant="outline"
        >
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'last_delivery_at',
      header: 'Last Delivery',
      render: (value) => (
        <span className="text-xs text-gray-500">
          {value ? formatTimeAgo(value) : 'Never'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => (
        <span className="text-xs text-gray-500">{formatDateTime(value)}</span>
      ),
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1.5 justify-end">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setViewDeliveries(row.id)}
        className="text-slate/75 hover:text-terracotta hover:bg-sand-light/50 h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
      >
        <Eye className="h-3.5 w-3.5 mr-1" /> Deliveries
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => regenerateMutation.mutate(row.id)}
        className="text-slate/75 hover:text-terracotta hover:bg-sand-light/50 h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
      >
        <Key className="h-3.5 w-3.5 mr-1" /> Secret
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="text-danger hover:bg-danger/10 hover:text-danger h-8 w-8 p-0 cursor-pointer rounded-lg transition-all"
        onClick={() => {
          if (window.confirm('Delete this webhook?')) {
            deleteMutation.mutate(row.id);
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Webhooks</h1>
          <p className="text-sm text-gray-500">{total} subscriptions</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
          className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl shadow-subtle cursor-pointer h-9 text-xs font-semibold px-3.5 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Webhook
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={webhooks}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={15}
        searchable={false}
        emptyMessage="No webhooks configured"
        rowActions={rowActions}
      />

      {/* Create/Edit Dialog */}
      <WebhookFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        webhook={editingWebhook}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-webhooks'] });
          setShowCreate(false);
          setEditingWebhook(null);
        }}
      />

      {/* Deliveries Dialog */}
      {viewDeliveries && (
        <DeliveriesDialog
          webhookId={viewDeliveries}
          onClose={() => setViewDeliveries(null)}
        />
      )}
    </div>
  );
}

function WebhookFormDialog({ open, onClose, webhook, onSuccess }) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: webhook?.url || '',
      event_type: webhook?.event_type || '',
      description: webhook?.description || '',
    },
  });

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      if (webhook) {
        await adminApi.updateWebhook(webhook.id, values);
        toast.success('Webhook updated');
      } else {
        await adminApi.createWebhook(values);
        toast.success('Webhook created');
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card rounded-2xl border border-sand/45 max-w-md shadow-elevated">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm font-bold text-slate">{webhook ? 'Edit Webhook' : 'Add Webhook'}</DialogTitle>
          <DialogDescription className="text-xs text-gray-400 font-medium">Configure a new webhook endpoint</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate">Endpoint URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/webhook" className="border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-semibold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate">Event Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 cursor-pointer">
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-sand shadow-subtle rounded-xl">
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type} className="cursor-pointer text-xs font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">
                          {type}
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
                  <FormLabel className="text-xs font-bold text-slate">Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description" className="border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-semibold" />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-sand hover:bg-sand-light text-slate cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all">
                {isSaving ? 'Saving...' : webhook ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeliveriesDialog({ webhookId, onClose }) {
  const [page, setPage] = useState(1);

  const { data: deliveriesData, isLoading } = useQuery({
    queryKey: ['webhook-deliveries', webhookId, page],
    queryFn: () =>
      adminApi
        .getWebhookDeliveries(webhookId, { page, page_size: 20 })
        .then((r) => r.data),
  });

  const deliveries = deliveriesData?.results || deliveriesData?.data || [];

  return (
    <Dialog open={!!webhookId} onOpenChange={onClose}>
      <DialogContent className="glass-card rounded-2xl border border-sand/45 max-w-2xl shadow-elevated">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm font-bold text-slate">Delivery History</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto space-y-2.5 pt-2 pr-1 scrollbar-none">
          {isLoading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-shimmer h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : deliveries.length === 0 ? (
            <p className="text-xs text-gray-450 font-medium text-center py-8">No deliveries yet</p>
          ) : (
            deliveries.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3.5 border border-sand/40 bg-sand-light/10 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-none capitalize ${
                      d.status === 'success'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-danger/10 text-danger border border-danger/20'
                    }`}
                    variant="outline"
                  >
                    {d.status}
                  </Badge>
                  <span className="text-[10px] text-gray-405 font-medium font-numbers">
                    {formatTimeAgo(d.created_at)}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate/85 font-numbers bg-white border border-sand/35 px-2 py-0.5 rounded-md">
                  {d.response_code || d.status_code}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}