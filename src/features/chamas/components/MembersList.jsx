import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorState, EmptyState } from '@/components/feedback';
import { getInitials, formatKES } from '../../../utils/format';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Users, UserPlus, Trash2, ChevronDown, X } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';
import { toast } from 'sonner';

const adminRoles = ['CHAIRPERSON', 'TREASURER', 'SECRETARY', 'VICE_CHAIRPERSON'];
const allRoles = ['CHAIRPERSON', 'TREASURER', 'SECRETARY', 'VICE_CHAIRPERSON', 'LOAN_OFFICER', 'MEMBER'];

const roleColors = {
  CHAIRPERSON: 'bg-blue-50 text-blue-600 border border-blue-100',
  TREASURER: 'bg-success/10 text-success border border-success/20',
  SECRETARY: 'bg-purple-50 text-purple-600 border border-purple-100',
  VICE_CHAIRPERSON: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  LOAN_OFFICER: 'bg-alert/10 text-alert border border-alert/20',
  MEMBER: 'bg-sand text-slate border border-sand-dark/20',
};

export default function MembersList({ chamaId }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  const members = data?.data || data?.results || [];
  const currentMember = members.find(
    (m) => m.user_id === user?.id || m.user?.id === user?.id
  );
  const isAdmin = currentMember && adminRoles.includes(currentMember.role);

  const addMutation = useMutation({
    mutationFn: (email) => chamaApi.addMember(chamaId, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      setShowAddDialog(false);
      setNewMemberEmail('');
      toast.success('Member added');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to add member'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ memberId, role }) => chamaApi.updateMemberRole(chamaId, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      toast.success('Role updated');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to update role'),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId) => chamaApi.removeMember(chamaId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      setShowRemoveConfirm(null);
      toast.success('Member removed');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to remove member'),
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

  if (error) return <ErrorState message="Failed to load members" onRetry={refetch} />;

  if (members.length === 0) {
    return <EmptyState icon={Users} title="No members" description="Invite members to your chama." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        {isAdmin && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-terracotta hover:bg-clay text-white text-xs h-8 px-3">
                <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Member</DialogTitle>
                <DialogDescription>Enter the email address of the user to add.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-slate">Email</Label>
                <Input id="email" type="email" value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="border-sand text-slate">Cancel</Button>
                </DialogClose>
                <Button onClick={() => addMutation.mutate(newMemberEmail)}
                  disabled={!newMemberEmail.trim() || addMutation.isPending}
                  className="bg-terracotta hover:bg-clay text-white">
                  {addMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const initials = getInitials(member.user_name || member.user?.first_name || '', '');
          const isSelf = member.user_id === user?.id || member.user?.id === user?.id;
          const canManage = isAdmin && !isSelf;

          return (
            <Card key={member.id} className="border-sand shadow-subtle">
              <CardContent className="p-3.5 flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-sand/30 shrink-0">
                  <AvatarFallback className="bg-sand-light text-terracotta font-semibold text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate truncate">
                    {member.user_name || member.user?.full_name}
                    {isSelf && <span className="text-[10px] text-gray-400 font-normal ml-1">(you)</span>}
                  </p>
                  <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                    {member.user_email || member.user?.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {canManage ? (
                    <Select
                      value={member.role}
                      onValueChange={(role) => roleMutation.mutate({ memberId: member.id, role })}
                    >
                      <SelectTrigger className="h-7 border-sand bg-white text-[10px] font-semibold px-2 py-0 gap-1 rounded-full shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-sand">
                        {allRoles.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs text-slate">
                            {r.replace('_', ' ').toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>
                      {member.role?.replace('_', ' ').toLowerCase()}
                    </Badge>
                  )}

                  {canManage && (
                    <Dialog open={showRemoveConfirm === member.id} onOpenChange={(o) => !o && setShowRemoveConfirm(null)}>
                      <DialogTrigger asChild>
                        <button onClick={() => setShowRemoveConfirm(member.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/5 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove Member</DialogTitle>
                          <DialogDescription>
                            Remove {member.user_name || member.user?.full_name} from this chama?
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline" className="border-sand text-slate">Cancel</Button>
                          </DialogClose>
                          <Button onClick={() => removeMutation.mutate(member.id)}
                            disabled={removeMutation.isPending}
                            className="bg-danger hover:bg-danger/90 text-white">
                            {removeMutation.isPending ? 'Removing...' : 'Remove'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                {member.total_contributions > 0 && (
                  <p className="text-xs text-success font-numbers font-semibold shrink-0 ml-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatKES(member.total_contributions)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
