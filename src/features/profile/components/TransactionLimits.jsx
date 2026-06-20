import { useQuery } from '@tanstack/react-query';
import { Shield, ArrowUp, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { profileApi } from '../api/profileApi';
import { formatKES } from '../../../utils/format';

function LimitsSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
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

  const limitItems = [
    {
      label: 'Per Transaction',
      value: limits?.per_transaction_limit,
      icon: ArrowUp,
      color: 'text-blue-500',
    },
    {
      label: 'Daily Limit',
      value: limits?.daily_limit,
      icon: Clock,
      color: 'text-alert',
    },
    {
      label: 'Monthly Limit',
      value: limits?.monthly_limit,
      icon: Calendar,
      color: 'text-terracotta',
    },
    {
      label: 'Daily Used',
      value: limits?.daily_used,
      icon: Clock,
      color: 'text-gray-500',
    },
    {
      label: 'Monthly Used',
      value: limits?.monthly_used,
      icon: Calendar,
      color: 'text-gray-500',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-terracotta" />
          Transaction Limits
        </CardTitle>
        <CardDescription>Your current sending and withdrawal limits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {limitItems.map((item) => {
            const Icon = item.icon;
            const value = item.value;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate">
                  {value != null ? formatKES(value) : '—'}
                </span>
              </div>
            );
          })}
        </div>
        {limits?.kyc_level && (
          <div className="mt-4 bg-sand-light rounded-lg p-3 text-xs text-gray-500 text-center">
            Limits are based on your KYC level:{' '}
            <span className="font-semibold text-terracotta">{limits.kyc_level}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}