import { CheckCircle, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

const stateIcons = {
  LEDGER_FINALIZED: { icon: CheckCircle, color: 'text-success-600 bg-success-50' },
  DISPUTED_MANUAL: { icon: AlertTriangle, color: 'text-error-600 bg-error-50' },
  REVERSED: { icon: XCircle, color: 'text-slate-500 bg-slate-100' },
  COMPENSATING: { icon: RefreshCw, color: 'text-alert-600 bg-alert-50' },
  BUYER_DEBIT_CONFIRMED: { icon: CheckCircle, color: 'text-success-600 bg-success-50' },
  SELLER_CREDIT_CONFIRMED: { icon: CheckCircle, color: 'text-success-600 bg-success-50' },
};

const defaultIcon = { icon: Clock, color: 'text-slate-400 bg-slate-50' };

export default function SettlementTimeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-400">
        No events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-sand-200 space-y-4">
      {events.map((event, i) => {
        const { icon: Icon, color } = stateIcons[event.to_state] || defaultIcon;
        const isLast = i === events.length - 1;

        return (
          <div key={i} className="relative">
            <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${color}`}>
              <Icon className="w-2.5 h-2.5" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isLast ? 'text-terracotta-600' : 'text-slate-700'}`}>
                {event.to_state_display || event.to_state?.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {event.trigger_display || event.trigger}
              </p>
              {event.timestamp && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}