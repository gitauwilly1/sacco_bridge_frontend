import { useQuery } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ErrorState, EmptyState } from '@/components/feedback';
import { getInitials, formatKES } from '../../../utils/format';
import { Users } from 'lucide-react';

const roleColors = {
  CHAIRPERSON: 'bg-blue-50 text-blue-600 border border-blue-100',
  TREASURER: 'bg-success/10 text-success border border-success/20',
  SECRETARY: 'bg-purple-50 text-purple-600 border border-purple-100',
  VICE_CHAIRPERSON: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  LOAN_OFFICER: 'bg-alert/10 text-alert border border-alert/20',
  MEMBER: 'bg-sand text-slate border border-sand-dark/20',
};

export default function MembersList({ chamaId }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
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

  const members = data?.data || data?.results || [];

  if (members.length === 0) {
    return <EmptyState icon={Users} title="No members" description="Invite members to your chama." />;
  }

  return (
    <div className="space-y-2.5">
      {members.map((member) => {
        const initials = getInitials(member.user_name || member.user?.first_name || '', '');
        return (
          <Card key={member.id} className="border-sand shadow-subtle card-lift">
            <CardContent className="p-3.5 flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-sand/30">
                <AvatarFallback className="bg-sand-light text-terracotta font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate truncate">
                  {member.user_name || member.user?.full_name}
                </p>
                <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
                  {member.user_email || member.user?.email}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${roleColors[member.role] || 'bg-gray-100 text-gray-600'}`}>
                  {member.role?.replace('_', ' ').toLowerCase()}
                </Badge>
                {member.total_contributions > 0 && (
                  <p className="text-xs text-success font-numbers font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatKES(member.total_contributions)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}