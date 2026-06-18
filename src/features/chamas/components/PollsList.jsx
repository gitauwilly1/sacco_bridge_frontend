import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chamaApi } from '../api/chamaApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '../../../components/feedback/ErrorState';
import { formatDate } from '../../../utils/format';
import { Vote, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PollsList({ chamaId }) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['chama-polls', chamaId],
    queryFn: () => chamaApi.getPolls(chamaId).then((r) => r.data),
    enabled: !!chamaId,
  });

  const voteMutation = useMutation({
    mutationFn: ({ pollId, optionId }) =>
      chamaApi.votePoll(chamaId, pollId, { option_id: optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chama-polls', chamaId] });
      toast.success('Vote recorded!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || 'Failed to vote');
    },
  });

  if (isLoading) return <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  if (error) return <ErrorState message="Failed to load polls" />;

  const polls = data?.data || data?.results || [];

  if (polls.length === 0) {
    return (
      <EmptyState
        icon={Vote}
        title="No active polls"
        description="Polls help your chama make decisions together."
      />
    );
  }

  return (
    <div className="space-y-3">
      {polls.map((poll) => (
        <Card key={poll.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate">{poll.title}</h4>
                <p className="text-xs text-gray-500">
                  {poll.total_votes || 0} votes · {poll.voting_method?.replace('_', ' ')}
                </p>
              </div>
              {poll.is_active ? (
                <Badge className="bg-success/10 text-success">Active</Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-500">Closed</Badge>
              )}
            </div>

            {poll.description && (
              <p className="text-sm text-gray-500 mb-3">{poll.description}</p>
            )}

            <div className="space-y-2">
              {poll.options?.map((option) => {
                const totalVotes = poll.total_votes || 1;
                const percentage = Math.round((option.vote_count / totalVotes) * 100) || 0;

                return (
                  <div key={option.id}>
                    {poll.is_active && !poll.has_voted ? (
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-2.5"
                        onClick={() => voteMutation.mutate({
                          pollId: poll.id,
                          optionId: option.id,
                        })}
                        disabled={voteMutation.isPending}
                      >
                        {option.option_text}
                      </Button>
                    ) : (
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate">
                            {option.option_text}
                          </span>
                          <span className="text-xs text-gray-500">
                            {option.vote_count} votes ({percentage}%)
                          </span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-terracotta h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {poll.has_voted && (
              <p className="text-xs text-success mt-3 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> You voted
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}