import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Circle, Clock, Shield, DollarSign,
  ArrowRightLeft, FileText, AlertCircle,
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
    <div className="relative">
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
          <div key={step} className="flex gap-3">
            {/* Line & Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCompleted
                    ? 'bg-success text-white'
                    : isCurrent
                    ? 'bg-terracotta text-white ring-2 ring-terracotta/30 animate-pulse'
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
                  className={`w-0.5 flex-1 min-h-[28px] ${
                    isCompleted ? 'bg-success' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 flex-1 ${isSkipped ? 'opacity-40' : ''}`}>
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
              {event?.description && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Reversal States */}
      {isReversal && (
        <>
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-danger text-white flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="pb-2 flex-1">
              <p className="text-sm font-medium text-danger">
                {currentState === 'DISPUTED_MANUAL'
                  ? 'Under Dispute Review'
                  : currentState === 'COMPENSATING'
                  ? 'Reversing Transaction'
                  : 'Transaction Reversed'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}