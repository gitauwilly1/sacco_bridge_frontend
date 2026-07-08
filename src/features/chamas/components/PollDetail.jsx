import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Vote, BarChart3, CheckCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { chamaApi } from '../api/chamaApi';
import { formatDate } from '../../../utils/format';

const statusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border border-success/20' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

export default function PollDetail() {
  const { chamaId, pollId } = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOption, setSelectedOption] = useState(null);

  const { data: poll, isLoading, error, refetch } = useQuery({
    queryKey: ['chama-poll', chamaId, pollId],
    queryFn: () => chamaApi.getPoll(chamaId, pollId).then((r) => r.data.data || r.data),
    enabled: !!chamaId && !!pollId,
  });

  const voteMutation = useMutation({
    mutationFn: (optionId) => chamaApi.votePoll(chamaId, pollId, { option_id: optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-poll', chamaId, pollId] });
      queryClient.invalidateQueries({ queryKey: ['chama-polls', chamaId] });
      setSelectedOption(null);
      toast.success('Vote recorded');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to cast vote');
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load poll" onRetry={refetch} />;
  if (!poll) return <ErrorState message="Poll not found" />;

  const statusStyle = statusConfig[poll.status] || statusConfig.active;
  const totalVotes = poll.options?.reduce((sum, o) => sum + (o.vote_count || 0), 0) || 0;
  const hasVoted = poll.user_voted_option_id || poll.options?.some((o) => o.is_user_vote);

  return (
    <div className="pb-4 max-w-2xl mx-auto">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: `/chamas/${chamaId}/polls` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold font-heading text-slate line-clamp-1">{poll.question}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className={`rounded-xl border p-4 flex items-center gap-3 ${statusStyle.color}`}>
          <Vote className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">{statusStyle.label}</p>
            <p className="text-xs opacity-75 mt-0.5">
              {poll.is_anonymous ? 'Anonymous poll' : 'Public poll'} &middot; {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            </p>
          </div>
          {hasVoted && (
            <Badge className="bg-success/10 text-success border-0 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <CheckCircle className="h-3 w-3 mr-1" /> Voted
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <Card className="border-sand bg-white shadow-subtle">
            <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
              <CardTitle className="text-sm font-semibold text-slate">
                {hasVoted ? 'Results' : 'Cast Your Vote'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {poll.options?.map((option) => {
                const voteCount = option.vote_count || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                const isUserVote = option.id === poll.user_voted_option_id || option.is_user_vote;
                const isSelected = selectedOption === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={hasVoted || voteMutation.isPending}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isUserVote
                        ? 'border-terracotta bg-terracotta/5'
                        : isSelected
                          ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                          : hasVoted
                            ? 'border-sand bg-white cursor-default'
                            : 'border-sand bg-white hover:border-terracotta/50 hover:bg-sand-light/30 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate">{option.text || option.label}</span>
                      {hasVoted && (
                        <span className="text-xs font-bold text-gray-400 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {voteCount} ({percentage}%)
                        </span>
                      )}
                      {isSelected && !hasVoted && (
                        <CheckCircle className="h-4 w-4 text-terracotta" />
                      )}
                      {isUserVote && (
                        <Badge className="bg-terracotta/10 text-terracotta border-0 text-[9px] font-bold px-1.5 py-0 rounded-full">You</Badge>
                      )}
                    </div>
                    {hasVoted && (
                      <div className="h-1.5 bg-sand rounded-full overflow-hidden">
                        <div className="h-full bg-terracotta rounded-full transition-all duration-500"
                             style={{ width: `${percentage}%` }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {!hasVoted && poll.status === 'active' && selectedOption && (
            <Button
              onClick={() => voteMutation.mutate(selectedOption)}
              disabled={voteMutation.isPending}
              className="w-full bg-terracotta hover:bg-clay text-white shadow-sm transition-all"
            >
              {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
            </Button>
          )}

          {poll.expires_at && (
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium justify-center">
              <Calendar className="h-3.5 w-3.5" />
              {poll.status === 'closed' ? 'Closed' : 'Expires'} on {formatDate(poll.expires_at)}
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full border-sand text-slate hover:bg-sand-light"
            onClick={() => navigate({ to: `/chamas/${chamaId}/polls` })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Polls
          </Button>
        </div>
      </div>
    </div>
  );
}
