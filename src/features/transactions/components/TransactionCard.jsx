import { useNavigate } from '@tanstack/react-router';
import {
  CheckCircle2, Clock, AlertCircle, XCircle,
  ChevronRight, Building2, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const statusConfig = {
  MATCH_PROPOSED: { label: 'Proposed', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  INTENT_LOCKED: { label: 'Locked', color: 'bg-purple-500/10 text-purple-500', icon: Clock },
  BUYER_DEBIT_INITIATED: { label: 'Processing', color: 'bg-alert/10 text-alert', icon: RefreshCw },
  BUYER_DEBIT_CONFIRMED: { label: 'Processing', color: 'bg-alert/10 text-alert', icon: RefreshCw },
  SELLER_CREDIT_INITIATED: { label: 'Processing', color: 'bg-alert/10 text-alert', icon: RefreshCw },
  SELLER_CREDIT_CONFIRMED: { label: 'Processing', color: 'bg-alert/10 text-alert', icon: RefreshCw },
  LEDGER_FINALIZED: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  COMPENSATING: { label: 'Reversing', color: 'bg-alert/10 text-alert', icon: RefreshCw },
  REVERSED: { label: 'Reversed', color: 'bg-gray-200 text-gray-600', icon: XCircle },
  DISPUTED_MANUAL: { label: 'Disputed', color: 'bg-danger/10 text-danger', icon: AlertCircle },
  CLOSED_BY_TRUSTEE: { label: 'Closed', color: 'bg-gray-200 text-gray-600', icon: CheckCircle2 },
};

export default function TransactionCard({ settlement }) {
  const navigate = useNavigate();
  const status = statusConfig[settlement.state] || {
    label: settlement.state,
    color: 'bg-gray-100 text-gray-600',
    icon: Clock,
  };
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: `/transactions/${settlement.id}` })}
    >
      <CardContent className="p-4 flex items-center gap-3">
        {/* SACCO Icon */}
        <div className="h-10 w-10 rounded-lg bg-sand-light flex items-center justify-center flex-shrink-0">
          <Building2 className="h-5 w-5 text-terracotta" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-slate truncate">
              {settlement.sacco_name || 'Settlement'}
            </h3>
            <Badge className={status.color} variant="outline">
              <StatusIcon className="h-3 w-3 mr-0.5" />
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{settlement.quantity?.toLocaleString()} shares</span>
            {settlement.counterparty_name && (
              <span className="truncate max-w-[120px]">
                with {settlement.counterparty_name}
              </span>
            )}
            <span>{formatTimeAgo(settlement.updated_at || settlement.created_at)}</span>
          </div>
        </div>

        {/* Value */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-terracotta">
            {formatKES(settlement.total_value)}
          </p>
          <p className="text-xs text-gray-400">
            {formatKES(settlement.price_per_share)}/share
          </p>
        </div>

        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </CardContent>
    </Card>
  );
}