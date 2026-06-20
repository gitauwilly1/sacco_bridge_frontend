// src/features/investments/components/SettlementTracker.jsx

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, CheckCircle2, Circle, Clock, AlertCircle,
  Shield, DollarSign, ArrowRightLeft, FileText,
  XCircle, RefreshCw,
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
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/investments/settlements' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">Settlement</h1>
            <p className="text-xs text-gray-500">
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
                ? 'bg-success/10 text-success text-sm px-4 py-1.5'
                : isReversal
                ? 'bg-danger/10 text-danger text-sm px-4 py-1.5'
                : 'bg-blue-500/10 text-blue-500 text-sm px-4 py-1.5'
            }
          >
            {stateLabels[currentState] || currentState}
          </Badge>
        </div>

        {/* Deal Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Deal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-semibold text-slate">
                  {settlement.quantity?.toLocaleString()} shares
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price/Share</p>
                <p className="font-semibold text-slate">
                  {formatKES(settlement.price_per_share)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="font-semibold text-terracotta">
                  {formatKES(settlement.total_value)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Counterparty</p>
                <p className="font-semibold text-slate text-sm truncate">
                  {settlement.counterparty_name || '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
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
                  <div key={step} className="flex gap-3">
                    {/* Line & Icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-success text-white'
                            : isCurrent
                            ? 'bg-terracotta text-white ring-2 ring-terracotta/30'
                            : isSkipped
                            ? 'bg-gray-200 text-gray-400'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                      {index < stateStepOrder.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 min-h-[24px] ${
                            isCompleted ? 'bg-success' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-4 flex-1 ${isSkipped ? 'opacity-50' : ''}`}>
                      <p
                        className={`text-sm font-medium ${
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
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatDateTime(event.timestamp || event.created_at)}
                        </p>
                      )}
                      {event?.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">
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
          <Card className="border-danger/30 bg-danger/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger">
                  {currentState === 'DISPUTED_MANUAL'
                    ? 'Under Dispute Review'
                    : 'Settlement Reversed'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {events.map((event, index) => (
                <div
                  key={event.id || index}
                  className="flex items-start justify-between text-xs border-b border-gray-100 pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate">
                      {event.event_type || event.state || 'Event'}
                    </p>
                    {event.notes && (
                      <p className="text-gray-500">{event.notes}</p>
                    )}
                  </div>
                  <span className="text-gray-400 flex-shrink-0">
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
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const settlementStatusBadge = {
  LEDGER_FINALIZED: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  DISPUTED_MANUAL: { label: 'Disputed', color: 'bg-danger/10 text-danger', icon: AlertCircle },
  REVERSED: { label: 'Reversed', color: 'bg-gray-200 text-gray-600', icon: AlertCircle },
  COMPENSATING: { label: 'Reversing', color: 'bg-alert/10 text-alert', icon: Clock },
};

function SettlementCard({ settlement }) {
  const navigate = useNavigate();
  const status = settlementStatusBadge[settlement.state] || {
    label: 'In Progress',
    color: 'bg-blue-500/10 text-blue-500',
    icon: Clock,
  };
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/investments/settlements/${settlement.id}` })}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate truncate">
              {settlement.sacco_name || 'Settlement'}
            </h3>
            <Badge className={status.color} variant="outline">
              <StatusIcon className="h-3 w-3 mr-0.5" />
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            {settlement.quantity?.toLocaleString()} shares ·{' '}
            {formatTimeAgo(settlement.updated_at || settlement.created_at)}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-terracotta">
            {formatKES(settlement.total_value)}
          </p>
          <ChevronRight className="h-4 w-4 text-gray-400 ml-2 inline" />
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
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-24" />
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
      <div className="flex items-center justify-between">
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
            className="text-xs border rounded-md px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="disputed">Disputed</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
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