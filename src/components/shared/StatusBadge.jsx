import { CheckCircle, Clock, XCircle, AlertTriangle, Pause, RefreshCw } from 'lucide-react';

const statusConfig = {
  // Generic
  ACTIVE: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  PENDING: { icon: Clock, color: 'bg-alert-50 text-alert-700 border-alert-200' },
  COMPLETED: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  CANCELLED: { icon: XCircle, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  FAILED: { icon: XCircle, color: 'bg-error-50 text-error-700 border-error-200' },
  SUSPENDED: { icon: Pause, color: 'bg-alert-50 text-alert-700 border-alert-200' },

  // Settlement states
  MATCH_PROPOSED: { icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' },
  INTENT_LOCKED: { icon: RefreshCw, color: 'bg-alert-50 text-alert-700 border-alert-200' },
  BUYER_DEBIT_CONFIRMED: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  SELLER_CREDIT_CONFIRMED: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  LEDGER_FINALIZED: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  DISPUTED_MANUAL: { icon: AlertTriangle, color: 'bg-error-50 text-error-700 border-error-200' },
  REVERSED: { icon: XCircle, color: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Loan states
  APPROVED: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  DISBURSED: { icon: CheckCircle, color: 'bg-terracotta-50 text-terracotta-700 border-terracotta-200' },
  PARTIALLY_REPAID: { icon: RefreshCw, color: 'bg-alert-50 text-alert-700 border-alert-200' },
  FULLY_REPAID: { icon: CheckCircle, color: 'bg-success-50 text-success-700 border-success-200' },
  DEFAULTED: { icon: XCircle, color: 'bg-error-50 text-error-700 border-error-200' },
};

const defaultConfig = { icon: Clock, color: 'bg-slate-100 text-slate-600 border-slate-200' };

export default function StatusBadge({ status, label, size = 'sm' }) {
  const config = statusConfig[status] || defaultConfig;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border whitespace-nowrap ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {label || status?.replace(/_/g, ' ')}
    </span>
  );
}