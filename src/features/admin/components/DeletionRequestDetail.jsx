import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Trash2, AlertCircle, CheckCircle2, XCircle,
  User, Calendar, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { formatDate, formatTimeAgo } from '../../../utils/format';
import { toast } from 'sonner';

export default function DeletionRequestDetail() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['deletion-request', id],
    queryFn: () =>
      adminApi.getDeletionRequestDetail(id).then((r) => r.data.data || r.data),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ action, notes }) =>
      adminApi.reviewDeletionRequest(id, { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deletion-request', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-deletion-requests'] });
      toast.success('Review submitted');
    },
    onError: () => toast.error('Failed to submit review'),
  });

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;
  if (error) return <ErrorState message="Failed to load deletion request" onRetry={refetch} />;
  if (!data) return <ErrorState message="Request not found" />;

  const isPending = data.status === 'PENDING';

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/admin/deletion-requests' })}
        className="text-xs text-gray-500 hover:text-slate"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to deletion requests
      </Button>

      <Card className="border-sand bg-white shadow-subtle rounded-2xl">
        <CardHeader className="pb-3 border-b border-sand/40">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-danger" />
              Deletion Request Detail
            </CardTitle>
            <Badge className={`text-xs font-semibold px-3 py-1 rounded-full border-0 ${
              data.status === 'PENDING' ? 'bg-alert/10 text-alert' :
              data.status === 'APPROVED' ? 'bg-success/10 text-success' :
              'bg-danger/10 text-danger'
            }`}>
              {data.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sand-light/50">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase">Requested By</p>
                <p className="text-sm font-semibold text-slate">{data.requested_by}</p>
                <p className="text-xs text-gray-400">{data.requested_by_email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sand-light/50">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase">Requested At</p>
                <p className="text-sm font-semibold text-slate">{formatTimeAgo(data.requested_at)}</p>
                <p className="text-xs text-gray-400">{new Date(data.requested_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sand-light/50">
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-gray-400" />
              <p className="text-[10px] text-gray-400 font-medium uppercase">Object</p>
            </div>
            <p className="text-sm font-semibold text-slate">{data.object_repr}</p>
          </div>

          <div className="p-3 rounded-xl bg-sand-light/50">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-alert" />
              <p className="text-[10px] text-gray-400 font-medium uppercase">Reason</p>
            </div>
            <p className="text-sm text-slate">{data.reason}</p>
          </div>

          {data.reviewed_by && (
            <div className="p-3 rounded-xl bg-sand-light/50">
              <p className="text-[10px] text-gray-400 font-medium uppercase mb-1">Review</p>
              <p className="text-sm text-slate">Reviewed by <strong>{data.reviewed_by}</strong></p>
              {data.review_notes && <p className="text-xs text-gray-500 mt-1">Notes: {data.review_notes}</p>}
              {data.reviewed_at && <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(data.reviewed_at)}</p>}
            </div>
          )}

          {isPending && (
            <ReviewForm
              onReview={(action, notes) => reviewMutation.mutate({ action, notes })}
              isPending={reviewMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewForm({ onReview, isPending }) {
  const [notes, setNotes] = useState('');

  return (
    <div className="border-t border-sand/40 pt-4 space-y-3">
      <p className="text-xs font-bold text-slate uppercase tracking-wider">Review Request</p>
      <textarea
        placeholder="Review notes (optional)..."
        className="w-full text-sm border border-sand/40 rounded-xl p-3 bg-white resize-none h-20 outline-none focus:border-terracotta/50 transition-colors"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-3">
        <Button
          onClick={() => onReview('approve', notes)}
          disabled={isPending}
          className="flex-1 bg-success text-white hover:bg-success/90 rounded-xl text-xs font-semibold"
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Delete
        </Button>
        <Button
          onClick={() => onReview('reject', notes)}
          disabled={isPending}
          variant="outline"
          className="flex-1 border-danger/30 text-danger hover:bg-danger/5 rounded-xl text-xs font-semibold"
        >
          <XCircle className="h-4 w-4 mr-1.5" /> Reject
        </Button>
      </div>
    </div>
  );
}