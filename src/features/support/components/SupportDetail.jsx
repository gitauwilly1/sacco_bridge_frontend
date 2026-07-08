import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Send, LifeBuoy, Clock, CheckCircle2, AlertCircle,
  User, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { supportApi } from '../api/supportApi';
import { formatTimeAgo } from '../../../utils/format';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-alert/10 text-alert border-alert/20', icon: Clock },
  WAITING_ON_USER: { label: 'Waiting on You', color: 'bg-sand text-slate border-sand-dark/20', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-400 border-gray-200', icon: CheckCircle2 },
};

export default function SupportDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => supportApi.getTicket(ticketId).then((r) => r.data?.data),
  });

  const sendMutation = useMutation({
    mutationFn: (msg) => supportApi.sendMessage(ticketId, { message: msg }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      setNewMessage('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to send message');
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error || !data) return <ErrorState message="Failed to load ticket" onRetry={refetch} />;

  const cfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.OPEN;
  const StatusIcon = cfg.icon;
  const messages = data.messages || [];
  const isClosed = data.status === 'CLOSED' || data.status === 'RESOLVED';

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/support' })} className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-heading text-slate truncate">{data.title}</h1>
              <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none shrink-0 ${cfg.color}`}>
                <StatusIcon className="h-3 w-3 mr-0.5" /> {cfg.label}
              </Badge>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{data.category_display}</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.is_staff ? '' : 'flex-row-reverse'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.is_staff ? 'bg-terracotta/10 text-terracotta border border-terracotta/20' : 'bg-sand-light text-slate border border-sand'
            }`}>
              {msg.is_staff ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`flex-1 max-w-[80%] ${msg.is_staff ? '' : 'items-end flex flex-col'}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.is_staff
                  ? 'bg-sand-light border border-sand text-slate'
                  : 'bg-terracotta text-white'
              }`}>
                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
              </div>
              <div className={`flex items-center gap-2 mt-1 ${msg.is_staff ? '' : 'flex-row-reverse'}`}>
                <span className="text-[10px] text-gray-400 font-medium">
                  {msg.author_name}
                </span>
                <span className="text-[10px] text-gray-300">·</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {formatTimeAgo(msg.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {!isClosed && (
          <Card className="border-sand bg-white shadow-subtle">
            <CardContent className="p-4">
              <Textarea
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="border-sand focus-visible:ring-terracotta text-sm min-h-[80px] mb-3"
              />
              <Button
                className="w-full bg-terracotta hover:bg-clay text-white shadow-sm"
                disabled={sendMutation.isPending || !newMessage.trim()}
                onClick={() => sendMutation.mutate(newMessage.trim())}
              >
                {sendMutation.isPending ? (
                  'Sending...'
                ) : (
                  <><Send className="h-4 w-4 mr-2" /> Send Message</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
