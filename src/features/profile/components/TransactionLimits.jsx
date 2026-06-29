import { useQuery } from '@tanstack/react-query';
import { Shield, ArrowUp, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { profileApi } from '../api/profileApi';
import { formatKES } from '../../../utils/format';

function LimitsSkeleton() {
  return (
    <Card className="border-sand bg-white shadow-subtle">
      <CardContent className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="skeleton-shimmer h-3.5 w-24 rounded" />
              <div className="skeleton-shimmer h-3.5 w-32 rounded" />
            </div>
            <div className="skeleton-shimmer h-2 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TransactionLimits() {
  const {
    data: limits,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['transaction-limits'],
    queryFn: () =>
      profileApi.getTransactionLimits().then((r) => r.data.data || r.data),
  });

  if (isLoading) return <LimitsSkeleton />;
  if (error) {
    return <ErrorState message="Failed to load limits" onRetry={refetch} />;
  }

  const dailyPercent = limits?.daily_limit ? Math.min(100, Math.round((limits.daily_used / limits.daily_limit) * 100)) : 0;
  const monthlyPercent = limits?.monthly_limit ? Math.min(100, Math.round((limits.monthly_used / limits.monthly_limit) * 100)) : 0;

  return (
    <Card className="border-sand bg-white shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-terracotta" />
          Transaction Limits
        </CardTitle>
        <CardDescription className="text-xs text-gray-400 font-medium">Your current sending and withdrawal limits</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Per Transaction */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-sand/45 bg-sand-light/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white border border-sand/30 flex items-center justify-center shadow-subtle flex-shrink-0">
              <ArrowUp className="h-4 w-4 text-terracotta" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate">Single Transaction Limit</p>
              <p className="text-[10px] text-gray-405 font-medium mt-0.5">Maximum amount allowed per transfer</p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-slate font-numbers">
            {limits?.per_transaction_limit != null ? formatKES(limits.per_transaction_limit) : '—'}
          </span>
        </div>

        <div className="space-y-5">
          {/* Daily limit progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-terracotta" /> Daily Limit Usage
              </span>
              <span className="font-numbers text-slate/90">
                {formatKES(limits?.daily_used || 0)} / {formatKES(limits?.daily_limit || 0)}
              </span>
            </div>
            <div className="w-full bg-sand-light/60 h-2.5 rounded-full overflow-hidden border border-sand/30">
              <div
                className="bg-terracotta h-full rounded-full transition-all duration-500"
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>{dailyPercent}% Used</span>
              <span>{formatKES(Math.max(0, (limits?.daily_limit || 0) - (limits?.daily_used || 0)))} Remaining</span>
            </div>
          </div>

          {/* Monthly limit progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-terracotta" /> Monthly Limit Usage
              </span>
              <span className="font-numbers text-slate/90">
                {formatKES(limits?.monthly_used || 0)} / {formatKES(limits?.monthly_limit || 0)}
              </span>
            </div>
            <div className="w-full bg-sand-light/60 h-2.5 rounded-full overflow-hidden border border-sand/30">
              <div
                className="bg-terracotta h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
              <span>{monthlyPercent}% Used</span>
              <span>{formatKES(Math.max(0, (limits?.monthly_limit || 0) - (limits?.monthly_used || 0)))} Remaining</span>
            </div>
          </div>
        </div>

        {limits?.kyc_level && (
          <div className="mt-5 bg-sand-light/50 border border-sand/40 rounded-xl p-3 text-[11px] text-gray-400 font-medium text-center leading-relaxed">
            Limits are tied to your identity verification status:
            <span className="inline-flex bg-terracotta/10 border border-terracotta/20 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-terracotta ml-1.5 shadow-none">
              KYC {limits.kyc_level}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}