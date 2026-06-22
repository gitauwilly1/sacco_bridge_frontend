import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Circle, Clock, Shield, DollarSign,
  ArrowRightLeft, FileText, AlertCircle, Check,
} from 'lucide-react';
import { transactionApi } from '../api/transactionApi';
import { formatDateTime } from '../../../utils/format';

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

export default function SettlementTimeline({ settlementId, currentState }) {
  const { data: events } = useQuery({
    queryKey: ['settlement-timeline', settlementId],
    queryFn: () =>
      transactionApi
        .getSettlementTimeline(settlementId)
        .then((r) => r.data.results || r.data.data || []),
    enabled: !!settlementId,
  });

  const timelineEvents = events || [];
  const currentStepIndex = stateStepOrder.indexOf(currentState);
  const isReversal = ['COMPENSATING', 'REVERSED', 'DISPUTED_MANUAL'].includes(currentState);

  return (
    <div className="relative space-y-0.5">
      {stateStepOrder.map((step, index) => {
        const StepIcon = stateIcons[step] || Circle;
        const isCompleted = !isReversal && index < currentStepIndex;
        const isCurrent = step === currentState && !isReversal;
        const isPending = !isReversal && index > currentStepIndex;
        const isSkipped = isReversal && index >= currentStepIndex;

        const event = timelineEvents.find(
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
                      : 'bg-gray-55 border-gray-200 text-gray-400'
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
              {event?.description && (
                <p className="text-xs text-slate mt-1 bg-sand-light/50 border border-sand/40 rounded-lg p-2 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Reversal States */}
      {isReversal && (
        <div className="flex gap-3.5 pt-2">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-danger border border-danger/30 text-white flex items-center justify-center shadow-subtle">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="pb-2 flex-1 pt-1">
            <p className="text-xs font-bold text-danger">
              {currentState === 'DISPUTED_MANUAL'
                ? 'Under Dispute Review'
                : currentState === 'COMPENSATING'
                ? 'Reversing Transaction'
                : 'Transaction Reversed'}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Status updated in activity logs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}