import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Vote, Clock, CheckCircle2, Users, ChevronRight,
  BarChart3, RefreshCw, Timer, AlertCircle, Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';

const pollStatusConfig = {
  active: {
    label: 'Active',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-200 text-gray-600 border-gray-300',
    icon: Lock,
  },
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    color: 'bg-alert/10 text-alert border-alert/20',
    icon: AlertCircle,
  },
};

function PollCard({ poll, chamaId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const status = pollStatusConfig[poll.status] || pollStatusConfig.active;
  const StatusIcon = status.icon;
  const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  const hasVoted = poll.user_vote !== undefined && poll.user_vote !== null;
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();

  const voteMutation = useMutation({
    mutationFn: (optionId) =>
      chamaApi.votePoll(chamaId, poll.id, { option_id: optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-polls', chamaId] });
      toast.success('Vote recorded successfully');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to submit vote'
      );
    },
  });

  const handleVote = (optionId) => {
    if (hasVoted) {
      toast.info('You have already voted on this poll');
      return;
    }
    if (isExpired || poll.status === 'closed') {
      toast.error('This poll is closed');
      return;
    }
    voteMutation.mutate(optionId);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate text-sm">
                {poll.question || poll.title}
              </h3>
              <Badge className={status.color} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </span>
              {poll.expires_at && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {isExpired ? 'Closed' : `Ends ${formatTimeAgo(poll.expires_at)}`}
                </span>
              )}
              {hasVoted && (
                <Badge className="bg-terracotta/10 text-terracotta text-[10px]">
                  Voted
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate({ to: `/chamas/${chamaId}/polls/${poll.id}` })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Poll Options */}
        <div className="space-y-2">
          {poll.options?.map((option) => {
            const percentage = totalVotes > 0
              ? Math.round(((option.votes || 0) / totalVotes) * 100)
              : 0;
            const isSelected = poll.user_vote === option.id;

            return (
              <div key={option.id} className="space-y-1">
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={
                    hasVoted ||
                    isExpired ||
                    poll.status === 'closed' ||
                    voteMutation.isPending
                  }
                  className={`w-full text-left p-2 rounded-md border transition-all ${
                    isSelected
                      ? 'border-terracotta bg-terracotta/5'
                      : hasVoted
                      ? 'border-gray-200 bg-gray-50 cursor-default'
                      : 'border-gray-200 hover:border-terracotta/50 hover:bg-terracotta/5 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate">
                      {option.text || option.option_text}
                    </span>
                    {(hasVoted || poll.status === 'closed') && (
                      <span className="text-xs font-semibold text-slate">
                        {percentage}%
                      </span>
                    )}
                  </div>
                  
                  {/* Vote Progress Bar (shown after voting or for closed polls) */}
                  {(hasVoted || poll.status === 'closed') && (
                    <div className="w-full bg-sand rounded-full h-1.5">
                      <div
                        className={`rounded-full h-1.5 transition-all ${
                          isSelected ? 'bg-terracotta' : 'bg-gray-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
          <span>
            Created {formatTimeAgo(poll.created_at)}
            {poll.created_by_name && ` by ${poll.created_by_name}`}
          </span>
          {poll.is_anonymous && (
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Anonymous
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PollsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PollsList({ chamaId }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');

  const {
    data: pollsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chama-polls', chamaId, page, status],
    queryFn: () =>
      chamaApi
        .getPolls(chamaId, {
          page,
          page_size: 10,
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
    enabled: !!chamaId,
  });

  if (isLoading) return <PollsListSkeleton />;
  if (error) {
    return (
      <ErrorState
        message="Failed to load polls"
        onRetry={refetch}
      />
    );
  }

  const polls = pollsData?.results || pollsData?.data || [];
  const total = pollsData?.count || polls.length;
  const totalPages = Math.ceil(total / 10);

  if (!polls.length) {
    return (
      <EmptyState
        icon={Vote}
        title="No polls yet"
        description="Create a poll to gather opinions from members"
        action={{
          label: 'Create Poll',
          onClick: () => {
            window.location.href = `/chamas/${chamaId}/polls/new`;
          },
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Vote className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {total} Poll{total !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-md px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Polls List */}
      <div className="space-y-3">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} chamaId={chamaId} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-500">
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}