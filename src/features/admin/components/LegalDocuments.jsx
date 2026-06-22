import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Plus, CheckCircle2, RefreshCw, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { formatDate } from '../../../utils/format';

const docSchema = z.object({
  type: z.enum(['terms', 'privacy'], { errorMap: () => ({ message: 'Select type' }) }),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  version: z.string().min(1, 'Version is required'),
});

export default function LegalDocuments() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [docType, setDocType] = useState('terms');
  const [viewDoc, setViewDoc] = useState(null);

  const {
    data: docsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-legal', docType],
    queryFn: () =>
      adminApi
        .getLegalDocuments(docType, { page_size: 20 })
        .then((r) => r.data),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => adminApi.publishLegalVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-legal'] });
      toast.success('Version published');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Failed'),
  });

  const docs = docsData?.results || docsData?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Legal Documents</h1>
          <p className="text-sm text-gray-500">{docs.length} versions</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="text-xs border border-sand-dark/30 rounded-xl px-2 py-1.5 bg-white text-slate font-bold cursor-pointer focus:ring-1 focus:ring-terracotta"
          >
            <option value="terms">Terms & Conditions</option>
            <option value="privacy">Privacy Policy</option>
          </select>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="bg-terracotta hover:bg-terracotta-dark text-white rounded-xl shadow-subtle cursor-pointer h-9 text-xs font-semibold px-3.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> New Version
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-8">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p className="text-xs text-gray-400 font-medium text-center py-8">No versions found</p>
      ) : (
        <div className="space-y-2.5">
          {docs.map((doc) => (
            <Card key={doc.id} className="border-sand bg-white shadow-subtle rounded-2xl card-lift">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate text-sm">v{doc.version}</p>
                    {doc.is_published && (
                      <Badge className="bg-success/10 text-success border border-success/20 text-[9px] font-extrabold rounded-full px-2 py-0.5 shadow-none uppercase" variant="outline">
                        Published
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5 font-numbers">
                    {formatDate(doc.created_at)}
                    {doc.published_at && ` · Published ${formatDate(doc.published_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewDoc(doc)}
                    className="text-slate/75 hover:text-terracotta hover:bg-sand-light/50 h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                  {!doc.is_published && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-success hover:bg-success/10 hover:text-success h-8 rounded-lg text-xs font-semibold px-2 cursor-pointer transition-all"
                      onClick={() => publishMutation.mutate(doc.id)}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Publish
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="glass-card rounded-2xl border border-sand/45 max-w-2xl max-h-[80vh] overflow-y-auto shadow-elevated scrollbar-none">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-bold text-slate">
              {viewDoc?.type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} v{viewDoc?.version}
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-slate/90 whitespace-pre-wrap leading-relaxed pt-2">
            {viewDoc?.content}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <CreateLegalDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        docType={docType}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-legal'] });
          setShowCreate(false);
        }}
      />
    </div>
  );
}

function CreateLegalDialog({ open, onClose, docType, onSuccess }) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(docSchema),
    defaultValues: { type: docType, content: '', version: '' },
  });

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      await adminApi.createLegalVersion(values);
      toast.success('Version created');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card rounded-2xl border border-sand/45 max-w-md shadow-elevated">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm font-bold text-slate">New Legal Version</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate">Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-sand shadow-subtle rounded-xl">
                      <SelectItem value="terms" className="cursor-pointer text-xs font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Terms & Conditions</SelectItem>
                      <SelectItem value="privacy" className="cursor-pointer text-xs font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Privacy Policy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-danger font-semibold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate">Version</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2.1" className="border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-semibold" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate">Content</FormLabel>
                  <FormControl>
                    <Textarea rows={10} placeholder="Document content..." className="border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-danger font-semibold" />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-sand hover:bg-sand-light text-slate cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all">Cancel</Button>
              <Button type="submit" disabled={isSaving} className="bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all">
                {isSaving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}