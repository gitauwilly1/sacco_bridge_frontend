import { useNavigate } from '@tanstack/react-router';
import {
  CheckCircle2, Clock, AlertCircle, XCircle,
  ChevronRight, Building2, RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKES, formatTimeAgo } from '../../../utils/format';

const statusConfig = {
  MATCH_PROPOSED: { label: 'Proposed', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', icon: Clock },
  INTENT_LOCKED: { label: 'Locked', color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20', icon: Clock },
  BUYER_DEBIT_INITIATED: { label: 'Processing', color: 'bg-alert/10 text-alert border border-alert/20', icon: RefreshCw },
  BUYER_DEBIT_CONFIRMED: { label: 'Processing', color: 'bg-alert/10 text-alert border border-alert/20', icon: RefreshCw },
  SELLER_CREDIT_INITIATED: { label: 'Processing', color: 'bg-alert/10 text-alert border border-alert/20', icon: RefreshCw },
  SELLER_CREDIT_CONFIRMED: { label: 'Processing', color: 'bg-alert/10 text-alert border border-alert/20', icon: RefreshCw },
  LEDGER_FINALIZED: { label: 'Completed', color: 'bg-success/10 text-success border border-success/20', icon: CheckCircle2 },
  COMPENSATING: { label: 'Reversing', color: 'bg-alert/10 text-alert border border-alert/20', icon: RefreshCw },
  REVERSED: { label: 'Reversed', color: 'bg-gray-100 text-gray-500 border border-gray-200', icon: XCircle },
  DISPUTED_MANUAL: { label: 'Disputed', color: 'bg-danger/10 text-danger border border-danger/20', icon: AlertCircle },
  CLOSED_BY_TRUSTEE: { label: 'Closed', color: 'bg-gray-100 text-gray-500 border border-gray-200', icon: CheckCircle2 },
};

export default function TransactionCard({ settlement }) {
  const navigate = useNavigate();
  const status = statusConfig[settlement.state] || {
    label: settlement.state,
    color: 'bg-gray-100 text-gray-500 border border-gray-200',
    icon: Clock,
  };
  const StatusIcon = status.icon;

  return (
    <Card
      className="cursor-pointer border-sand shadow-subtle card-lift transition-all duration-200"
      onClick={() => navigate({ to: `/transactions/${settlement.id}` })}
    >
      <CardContent className="p-4 flex items-center gap-3.5">
        {/* SACCO Icon */}
        <div className="h-10 w-10 rounded-xl bg-sand-light flex items-center justify-center flex-shrink-0 ring-2 ring-sand/30">
          <Building2 className="h-5 w-5 text-terracotta" />
        </div>

        {/* Info */}
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
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span className="font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{settlement.quantity?.toLocaleString()} shares</span>
            {settlement.counterparty_name && (
              <span className="truncate max-w-[120px]">
                with {settlement.counterparty_name}
              </span>
            )}
            <span className="font-sans font-medium text-gray-400">{formatTimeAgo(settlement.updated_at || settlement.created_at)}</span>
          </div>
        </div>

        {/* Value */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatKES(settlement.total_value)}
          </p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5 font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {formatKES(settlement.price_per_share)}/sh
          </p>
        </div>

        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </CardContent>
    </Card>
  );
}