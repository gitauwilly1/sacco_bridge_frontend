import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  LifeBuoy, Plus, ChevronRight, Clock, CheckCircle2, AlertCircle,
  Loader2, ArrowLeft,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ErrorState, EmptyState } from '@/components/feedback';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { supportApi } from '../api/supportApi';
import { formatTimeAgo } from '../../../utils/format';

const STATUS_CONFIG = {
  OPEN: { label: 'Open', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-alert/10 text-alert border-alert/20', icon: Clock },
  WAITING_ON_USER: { label: 'Waiting on You', color: 'bg-sand text-slate border-sand-dark/20', icon: AlertCircle },
  RESOLVED: { label: 'Resolved', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-400 border-gray-200', icon: CheckCircle2 },
};

export default function SupportList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['my-tickets', status],
    queryFn: () => supportApi.getMyTickets(status !== 'all' ? { status } : {}).then((r) => r.data),
  });

  const tickets = data?.data || [];

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/help' })} className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Support Tickets</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Track your requests</p>
          </div>
          <Button
            size="sm"
            className="bg-terracotta hover:bg-clay text-white shadow-sm"
            onClick={() => navigate({ to: '/support/new' })}
          >
            <Plus className="h-3 w-3 mr-1" /> New Ticket
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                status === s ? 'bg-terracotta text-white' : 'bg-sand-light text-slate hover:bg-sand'
              }`}
            >
              {s === 'all' ? 'All' : (STATUS_CONFIG[s]?.label || s)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <PageSpinner />
        ) : error ? (
          <ErrorState message="Failed to load tickets" onRetry={refetch} />
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title="No tickets yet"
            description="Create a support ticket and we'll get back to you"
            action={
              <Button className="bg-terracotta hover:bg-clay text-white" onClick={() => navigate({ to: '/support/new' })}>
                <Plus className="h-4 w-4 mr-2" /> Create Ticket
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => {
              const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
              const StatusIcon = cfg.icon;
              return (
                <Card
                  key={ticket.id}
                  className="border-sand shadow-subtle card-lift cursor-pointer transition-all duration-200"
                  onClick={() => navigate({ to: `/support/${ticket.id}` })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate truncate">{ticket.title}</h3>
                          <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 shadow-none capitalize ${cfg.color}`}>
                            <StatusIcon className="h-3 w-3 mr-0.5" /> {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium mt-1">
                          <span>{ticket.category_display}</span>
                          <span>{ticket.message_count || 0} message{(ticket.message_count || 0) !== 1 ? 's' : ''}</span>
                          <span>{formatTimeAgo(ticket.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
