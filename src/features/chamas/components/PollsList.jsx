import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Vote, Clock, CheckCircle2, Users, ChevronRight,
  RefreshCw, Timer, AlertCircle, Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState, EmptyState } from '@/components/feedback';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';

const pollStatusConfig = {
  active: {
    label: 'Active',
    color: 'bg-success/10 text-success border border-success/20',
    icon: CheckCircle2,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-400 border border-gray-200',
    icon: Lock,
  },
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-50 text-blue-600 border border-blue-100',
    icon: Clock,
  },
  draft: {
    label: 'Draft',
    color: 'bg-alert/10 text-alert border border-alert/20',
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
    <Card className="border-sand shadow-subtle hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate text-sm leading-snug">
                {poll.question || poll.title}
              </h3>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
              <span className="flex items-center gap-1 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <Users className="h-3.5 w-3.5" />
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </span>
              {poll.expires_at && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {isExpired ? 'Closed' : `Ends ${formatTimeAgo(poll.expires_at)}`}
                </span>
              )}
              {hasVoted && (
                <Badge className="bg-terracotta/10 text-terracotta border-0 text-[10px] font-semibold">
                  Voted
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-slate rounded-lg p-2"
            onClick={() => navigate({ to: `/chamas/${chamaId}/polls/${poll.id}` })}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Poll Options */}
        <div className="space-y-2.5">
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
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-terracotta bg-terracotta/5'
                      : hasVoted
                      ? 'border-sand bg-sand-light/35 cursor-default'
                      : 'border-sand hover:border-terracotta/40 hover:bg-sand-light/45 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate">
                      {option.text || option.option_text}
                    </span>
                    {(hasVoted || poll.status === 'closed') && (
                      <span className="text-xs font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {percentage}%
                      </span>
                    )}
                  </div>
                  
                  {/* Vote Progress Bar (shown after voting or for closed polls) */}
                  {(hasVoted || poll.status === 'closed') && (
                    <div className="w-full bg-sand rounded-full h-2">
                      <div
                        className={`rounded-full h-2 transition-all duration-300 ${
                          isSelected ? 'bg-terracotta' : 'bg-slate/30'
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
        <div className="mt-4 pt-3.5 border-t border-sand/40 flex items-center justify-between text-xs text-gray-400 font-medium">
          <span>
            Created {formatTimeAgo(poll.created_at)}
            {poll.created_by_name && ` by ${poll.created_by_name}`}
          </span>
          {poll.is_anonymous && (
            <span className="flex items-center gap-1 text-slate">
              <Lock className="h-3.5 w-3.5" />
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
        <Card key={i} className="border-sand">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-48 rounded-lg" />
                <div className="skeleton-shimmer h-3.5 w-32 rounded-lg" />
              </div>
              <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((j) => (
                <div key={j} className="skeleton-shimmer h-12 w-full rounded-xl" />
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
            className="text-xs border border-input rounded-lg px-2.5 py-1.5 bg-white text-slate font-medium outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="upcoming">Upcoming</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light transition-all px-2.5"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3 w-3 text-gray-400" />
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
            className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-sand hover:bg-sand-light text-slate text-xs font-semibold"
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