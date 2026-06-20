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
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="terms">Terms & Conditions</option>
            <option value="privacy">Privacy Policy</option>
          </select>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-3 w-3 mr-1" /> New Version
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No versions found</p>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate text-sm">v{doc.version}</p>
                    {doc.is_published && (
                      <Badge className="bg-success/10 text-success">Published</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(doc.created_at)}
                    {doc.published_at && ` · Published ${formatDate(doc.published_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewDoc(doc)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  {!doc.is_published && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-success"
                      onClick={() => publishMutation.mutate(doc.id)}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Publish
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewDoc?.type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} v{viewDoc?.version}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate whitespace-pre-wrap">
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Legal Version</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="terms">Terms & Conditions</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea rows={10} placeholder="Document content..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}