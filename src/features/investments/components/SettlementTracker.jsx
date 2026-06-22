// src/features/investments/components/SettlementTracker.jsx

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle,
  Shield, DollarSign, ArrowRightLeft, FileText,
  XCircle, RefreshCw, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { investmentsApi } from '../api/investmentsApi';
import { formatKES, formatDate, formatDateTime } from '../../../utils/format';

const stateStepOrder = [
  'MATCH_PROPOSED',
  'INTENT_LOCKED',
  'BUYER_DEBIT_INITIATED',
  'BUYER_DEBIT_CONFIRMED',
  'SELLER_CREDIT_INITIATED',
  'SELLER_CREDIT_CONFIRMED',
  'LEDGER_FINALIZED',
];

const stateLabels = {
  MATCH_PROPOSED: 'Match Proposed',
  INTENT_LOCKED: 'Intent Locked',
  BUYER_DEBIT_INITIATED: 'Buyer Debit Initiated',
  BUYER_DEBIT_CONFIRMED: 'Buyer Debit Confirmed',
  SELLER_CREDIT_INITIATED: 'Seller Credit Initiated',
  SELLER_CREDIT_CONFIRMED: 'Seller Credit Confirmed',
  LEDGER_FINALIZED: 'Completed',
};

const stateIcons = {
  MATCH_PROPOSED: ArrowRightLeft,
  INTENT_LOCKED: Shield,
  BUYER_DEBIT_INITIATED: DollarSign,
  BUYER_DEBIT_CONFIRMED: DollarSign,
  SELLER_CREDIT_INITIATED: DollarSign,
  SELLER_CREDIT_CONFIRMED: DollarSign,
  LEDGER_FINALIZED: CheckCircle2,
};

const reversalStates = ['COMPENSATING', 'REVERSED', 'DISPUTED_MANUAL'];

export default function SettlementTracker({ settlementId }) {
  const navigate = useNavigate();

  const {
    data: settlement,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['settlement', settlementId],
    queryFn: () =>
      investmentsApi.getSettlementDetail(settlementId).then((r) => r.data.data || r.data),
    enabled: !!settlementId,
  });

  const { data: timeline } = useQuery({
    queryKey: ['settlement-timeline', settlementId],
    queryFn: () =>
      investmentsApi.getSettlementTimeline(settlementId).then((r) => r.data.results || r.data.data || []),
    enabled: !!settlementId,
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load settlement" onRetry={refetch} />;
  if (!settlement) return <ErrorState message="Settlement not found" />;

  const currentState = settlement.state || settlement.status;
  const isReversal = reversalStates.includes(currentState);
  const currentStepIndex = stateStepOrder.indexOf(currentState);
  const events = timeline || settlement.events || [];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/investments/settlements' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to settlements"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Settlement</h1>
            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
              {settlement.sacco_name} · {settlement.share_class_name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Badge */}
        <div className="text-center">
          <Badge
            className={
              currentState === 'LEDGER_FINALIZED'
                ? 'bg-success/10 text-success border border-success/20 text-xs px-4 py-1.5 rounded-full shadow-none font-bold'
                : isReversal
                ? 'bg-danger/10 text-danger border border-danger/20 text-xs px-4 py-1.5 rounded-full shadow-none font-bold'
                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs px-4 py-1.5 rounded-full shadow-none font-bold'
            }
            variant="outline"
          >
            {stateLabels[currentState] || currentState}
          </Badge>
        </div>

        {/* Deal Summary */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Quantity</p>
                <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {settlement.quantity?.toLocaleString()} shares
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Price/Share</p>
                <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(settlement.price_per_share)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Total Value</p>
                <p className="text-sm font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(settlement.total_value)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Counterparty</p>
                <p className="text-sm font-bold text-slate truncate">
                  {settlement.counterparty_name || '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2.5">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0.5">
              {stateStepOrder.map((step, index) => {
                const StepIcon = stateIcons[step] || Circle;
                const isCompleted = !isReversal && index < currentStepIndex;
                const isCurrent = step === currentState && !isReversal;
                const isPending = !isReversal && index > currentStepIndex;
                const isSkipped = isReversal && index >= currentStepIndex;

                // Find event for this step
                const event = events.find(
                  (e) => e.state === step || e.event_type === step
                );

                return (
                  <div key={step} className="flex gap-3.5">
                    {/* Line & Icon */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {isCurrent ? (
                        <div className="relative h-8 w-8 flex-shrink-0">
                          <div className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping" />
                          <div className="absolute inset-0.5 rounded-full bg-terracotta flex items-center justify-center text-white ring-2 ring-terracotta/30">
                            <StepIcon className="h-4 w-4" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                            isCompleted
                              ? 'bg-success border-success text-white'
                              : isSkipped
                              ? 'bg-gray-100 border-gray-200 text-gray-400'
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="h-4 w-4 stroke-[3px]" />
                          ) : (
                            <StepIcon className="h-3.5 w-3.5" />
                          )}
                        </div>
                      )}
                      {index < stateStepOrder.length - 1 && (
                        <div
                          className={`w-0 border-l-2 border-dashed min-h-[30px] flex-1 my-1 ${
                            isCompleted
                              ? 'border-success'
                              : isCurrent
                              ? 'border-terracotta'
                              : 'border-gray-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-5 flex-1 pt-1 ${isSkipped ? 'opacity-40' : ''}`}>
                      <p
                        className={`text-xs font-bold ${
                          isCompleted
                            ? 'text-success'
                            : isCurrent
                            ? 'text-terracotta'
                            : 'text-gray-400'
                        }`}
                      >
                        {stateLabels[step]}
                      </p>
                      {event && (
                        <p className="text-[10px] text-gray-400 font-semibold mt-1 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {formatDateTime(event.timestamp || event.created_at)}
                        </p>
                      )}
                      {event?.notes && (
                        <p className="text-xs text-slate mt-1 bg-sand-light/50 border border-sand/40 rounded-lg p-2 leading-relaxed">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reversal Warning */}
        {isReversal && (
          <Card className="border-danger/20 bg-danger/5 text-danger rounded-2xl">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {currentState === 'DISPUTED_MANUAL'
                    ? 'Under Dispute Review'
                    : 'Settlement Reversed'}
                </p>
                <p className="text-xs text-danger/80 mt-1 leading-relaxed">
                  {currentState === 'DISPUTED_MANUAL'
                    ? 'This settlement is under manual review by a trustee.'
                    : 'This settlement has been reversed. Funds are being returned.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Events Log */}
        {events.length > 0 && (
          <Card className="border-sand bg-white shadow-subtle">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <FileText className="h-4 w-4 text-terracotta" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id || index}
                  className="flex items-start justify-between gap-4 text-xs font-medium border-b border-sand/30 pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-slate font-bold truncate">
                      {event.event_type || event.state || 'Event'}
                    </p>
                    {event.notes && (
                      <p className="text-gray-400 text-[11px] mt-1 leading-relaxed">{event.notes}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-[10px] font-semibold flex-shrink-0 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatDateTime(event.timestamp || event.created_at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// SettlementList component for the settlements list page
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRightLeft, CheckCircle2, Clock, AlertCircle,
  ChevronRight, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const settlementStatusBadge = {
  LEDGER_FINALIZED: { label: 'Completed', color: 'bg-success/10 text-success border border-success/20', icon: CheckCircle2 },
  DISPUTED_MANUAL: { label: 'Disputed', color: 'bg-danger/10 text-danger border border-danger/20', icon: AlertCircle },
  REVERSED: { label: 'Reversed', color: 'bg-gray-100 text-gray-500 border border-gray-200', icon: AlertCircle },
  COMPENSATING: { label: 'Reversing', color: 'bg-alert/10 text-alert border border-alert/20', icon: Clock },
};

function SettlementCard({ settlement }) {
  const navigate = useNavigate();
  const status = settlementStatusBadge[settlement.state] || {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    icon: Clock,
  };
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer border-sand shadow-subtle card-lift transition-all duration-200"
      onClick={() => navigate({ to: `/investments/settlements/${settlement.id}` })}
    >
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-slate truncate">
              {settlement.sacco_name || 'Settlement'}
            </h3>
            <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${status.color}`} variant="outline">
              <StatusIcon className="h-3 w-3 mr-0.5" />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 font-medium font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {settlement.quantity?.toLocaleString()} shares ·{' '}
            <span className="font-sans font-medium text-gray-400">
              {formatTimeAgo(settlement.updated_at || settlement.created_at)}
            </span>
          </p>
        </div>
        <div className="text-right flex-shrink-0 flex items-center gap-1.5">
          <p className="text-sm font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatKES(settlement.total_value)}
          </p>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SettlementList() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState('all');

  const {
    data: settlementsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['my-settlements', page, state],
    queryFn: () =>
      investmentsApi
        .getMySettlements({
          page,
          page_size: 10,
          ...(state !== 'all' && { state }),
        })
        .then((r) => r.data),
  });

  const settlements = settlementsData?.results || settlementsData?.data || [];
  const total = settlementsData?.count || settlements.length;
  const totalPages = Math.ceil(total / 10);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-sand">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                  <div className="skeleton-shimmer h-4 w-32 rounded-lg" />
                  <div className="skeleton-shimmer h-4 w-16 rounded-full" />
                </div>
                <div className="skeleton-shimmer h-3 w-40 rounded" />
              </div>
              <div className="skeleton-shimmer h-4 w-16 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load settlements" onRetry={refetch} />;
  }

  if (settlements.length === 0) {
    return (
      <EmptyState
        icon={ArrowRightLeft}
        title="No settlements yet"
        description="Settlements are created when a deal is accepted"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-terracotta" />
          <h2 className="text-sm font-semibold text-slate">
            {total} Settlement{total !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-input rounded-xl px-2.5 py-1.5 bg-white text-slate focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer transition-colors"
          >
            <option value="all">All</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="border-sand hover:bg-sand-light text-slate cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {settlements.map((settlement) => (
          <SettlementCard key={settlement.id} settlement={settlement} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-sand hover:bg-sand-light text-slate cursor-pointer"
          >
            Previous
          </Button>
          <span className="text-xs text-gray-400 font-medium">
            {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-sand hover:bg-sand-light text-slate cursor-pointer"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}