import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supportApi } from '../api/supportApi';

const CATEGORIES = [
  { value: 'ACCOUNT', label: 'Account & Login' },
  { value: 'CHAMA', label: 'Chama Management' },
  { value: 'INVESTMENT', label: 'Investments & Trading' },
  { value: 'PAYMENT', label: 'Payments & M-Pesa' },
  { value: 'TECHNICAL', label: 'Technical Issue' },
  { value: 'FEATURE', label: 'Feature Request' },
  { value: 'OTHER', label: 'Other' },
];

export default function CreateTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: (data) => supportApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      toast.success('Ticket created!');
      navigate({ to: '/support' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to create ticket');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!description.trim()) { toast.error('Description is required'); return; }
    mutation.mutate({ title: title.trim(), category, description: description.trim() });
  };

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/support' })} className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold font-heading text-slate leading-tight">New Support Ticket</h1>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <Card className="border-sand bg-white shadow-subtle">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate">Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="border-sand focus-visible:ring-terracotta text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm border border-input rounded-xl px-3 py-2.5 bg-white text-slate font-medium outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="border-sand focus-visible:ring-terracotta text-sm min-h-[140px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-terracotta hover:bg-clay text-white shadow-sm"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  'Submitting...'
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Submit Ticket</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
