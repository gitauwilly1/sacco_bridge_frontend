import { useQuery } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { getInitials, formatKES } from '../../../utils/format';
import { Users } from 'lucide-react';

const roleColors = {
  CHAIRPERSON: 'bg-blue-100 text-blue-700',
  TREASURER: 'bg-success/10 text-success',
  SECRETARY: 'bg-purple-100 text-purple-700',
  VICE_CHAIRPERSON: 'bg-blue-50 text-blue-600',
  LOAN_OFFICER: 'bg-alert/10 text-alert',
  MEMBER: 'bg-gray-100 text-gray-600',
};

export default function MembersList({ chamaId }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => chamaApi.getMembers(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>;
  if (error) return <ErrorState message="Failed to load members" onRetry={refetch} />;

  const members = data?.data || data?.results || [];

  if (members.length === 0) {
    return <EmptyState icon={Users} title="No members" description="Invite members to your chama." />;
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <Card key={member.id}>
          <CardContent className="p-3 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-sand-light text-terracotta text-sm">
                {getInitials(member.user_name || member.user?.first_name, '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate truncate">
                {member.user_name || member.user?.full_name}
              </p>
              <p className="text-xs text-gray-500">{member.user_email || member.user?.email}</p>
            </div>
            <div className="text-right">
              <Badge className={roleColors[member.role] || 'bg-gray-100'}>
                {member.role?.replace('_', ' ')}
              </Badge>
              {member.total_contributions > 0 && (
                <p className="text-xs text-success mt-1">{formatKES(member.total_contributions)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}