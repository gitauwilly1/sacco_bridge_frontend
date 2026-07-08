import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState, EmptyState } from '@/components/feedback';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { formatKES, formatDate } from '../../../utils/format';
import { Wallet, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../../../stores/authStore';

const statusColors = {
  PAID: 'bg-success/10 text-success border border-success/20',
  PENDING: 'bg-alert/10 text-alert border border-alert/20',
  LATE: 'bg-danger/10 text-danger border border-danger/20',
  MISSED: 'bg-gray-100 text-gray-400 border border-gray-200',
};

const adminRoles = ['CHAIRPERSON', 'TREASURER', 'SECRETARY', 'VICE_CHAIRPERSON'];

export default function ContributionsList({ chamaId }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [editTarget, setEditTarget] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editPaymentRef, setEditPaymentRef] = useState('');
  const [editMethod, setEditMethod] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: membersData } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });
  const members = membersData?.data || membersData?.results || [];
  const currentMember = members.find((m) => m.user_id === user?.id || m.user?.id === user?.id);
  const isAdmin = currentMember && adminRoles.includes(currentMember.role);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-contributions', chamaId],
    queryFn: () => chamaApi.getContributions(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => chamaApi.updateContribution(chamaId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-contributions', chamaId] });
      setEditTarget(null);
      toast.success('Contribution updated');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => chamaApi.deleteContribution(chamaId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-contributions', chamaId] });
      setDeleteTarget(null);
      toast.success('Contribution deleted');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to delete'),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message="Failed to load contributions" onRetry={refetch} />;

  const contributions = data?.data || data?.results || [];

  if (contributions.length === 0) {
    return <EmptyState icon={Wallet} title="No contributions yet" description="Start contributing to your chama." />;
  }

  return (
    <div className="space-y-2.5">
      {contributions.map((c) => (
        <Card key={c.id} className="border-sand shadow-subtle">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-semibold text-slate truncate">{c.member_name}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {formatDate(c.period_start)} – {formatDate(c.period_end)}
              </p>
              <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">
                {c.payment_method} &middot; <span className="font-numbers">{c.payment_reference}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <p className="text-sm font-bold font-numbers text-success" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {formatKES(c.amount)}
              </p>
              <div className="flex items-center gap-1">
                <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>
                  {c.status?.toLowerCase()}
                </Badge>
                {isAdmin && (
                  <>
                    <Dialog open={editTarget === c.id} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
                      <DialogTrigger asChild>
                        <button onClick={() => { setEditTarget(c.id); setEditAmount(c.amount); setEditPaymentRef(c.payment_reference || ''); setEditMethod(c.payment_method || 'MPESA'); }}
                          className="p-1 rounded text-gray-400 hover:text-terracotta hover:bg-terracotta/5 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Contribution</DialogTitle>
                          <DialogDescription>{c.member_name}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate">Amount</Label>
                            <Input type="number" value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate">Payment Method</Label>
                            <Select value={editMethod} onValueChange={setEditMethod}>
                              <SelectTrigger className="border-sand bg-sand-light/10 text-slate focus:ring-terracotta">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-sand">
                                {['MPESA', 'CASH', 'BANK_TRANSFER', 'OTHER'].map((m) => (
                                  <SelectItem key={m} value={m} className="text-slate">{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate">Payment Reference</Label>
                            <Input value={editPaymentRef}
                              onChange={(e) => setEditPaymentRef(e.target.value)}
                              className="border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10" />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" className="border-sand text-slate">Cancel</Button>
                          </DialogClose>
                          <Button onClick={() => updateMutation.mutate({ id: c.id, data: { amount: editAmount, payment_method: editMethod, payment_reference: editPaymentRef } })}
                            disabled={updateMutation.isPending}
                            className="bg-terracotta hover:bg-clay text-white">
                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={deleteTarget === c.id} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                      <DialogTrigger asChild>
                        <button onClick={() => setDeleteTarget(c.id)}
                          className="p-1 rounded text-gray-400 hover:text-danger hover:bg-danger/5 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Contribution</DialogTitle>
                          <DialogDescription>Delete {formatKES(c.amount)} contribution by {c.member_name}?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" className="border-sand text-slate">Cancel</Button>
                          </DialogClose>
                          <Button onClick={() => deleteMutation.mutate(c.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-danger hover:bg-danger/90 text-white">
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
