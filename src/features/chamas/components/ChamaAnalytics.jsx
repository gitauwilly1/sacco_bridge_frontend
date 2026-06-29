import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, DollarSign, Users, Wallet, Calendar,
  Target, Percent, AlertTriangle, CheckCircle2,
  PiggyBank, Scale, Clock, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chamaApi } from '../api/chamaApi';
import { formatKES } from '../../../utils/format';

export default function ChamaAnalytics({ chamaId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['chama-analytics', chamaId],
    queryFn: () =>
      chamaApi.getChamaAnalytics(chamaId, { period: 'MONTHLY' }).then((r) => {
        const d = r.data.data || r.data;
        return Array.isArray(d) ? d[0] : d;
      }),
    enabled: !!chamaId,
  });

  if (isLoading) return <div className="space-y-3 p-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton-shimmer h-32 w-full rounded-xl" />)}</div>;
  if (error) return <p className="text-sm text-gray-400 p-4 text-center">Analytics unavailable</p>;
  if (!data) return <p className="text-sm text-gray-400 text-center py-8">No analytics data yet. Start contributing to see stats.</p>;

  const a = data;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-sand bg-white shadow-subtle rounded-xl">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-4 w-4 text-terracotta" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Total Contributions</p>
              <p className="text-sm font-bold text-slate font-numbers">{formatKES(a.total_contributions || 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle rounded-xl">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Avg Contribution</p>
              <p className="text-sm font-bold text-slate font-numbers">{formatKES(a.average_contribution || 0)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle rounded-xl">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Loans Issued</p>
              <p className="text-sm font-bold text-slate font-numbers">{a.total_loans_issued || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sand bg-white shadow-subtle rounded-xl">
          <CardContent className="p-3 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-alert/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-alert" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Active Members</p>
              <p className="text-sm font-bold text-slate font-numbers">{a.active_members ?? a.total_members ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          <Card className="border-sand/60 bg-sand-light/30 shadow-subtle rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Percent className="h-3.5 w-3.5 text-success" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">On-Time Rate</p>
              </div>
              <p className="text-lg font-bold text-slate font-numbers">{(a.on_time_rate || 0).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="border-sand/60 bg-sand-light/30 shadow-subtle rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-alert" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Default Rate</p>
              </div>
              <p className="text-lg font-bold text-slate font-numbers">{(a.default_rate || 0).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3">
          <Card className="border-sand/60 bg-sand-light/30 shadow-subtle rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <PiggyBank className="h-3.5 w-3.5 text-terracotta" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Savings Growth</p>
              </div>
              <p className="text-lg font-bold text-slate font-numbers">{formatKES(a.savings_growth || 0)}</p>
            </CardContent>
          </Card>
          <Card className="border-sand/60 bg-sand-light/30 shadow-subtle rounded-xl">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Scale className="h-3.5 w-3.5 text-blue-500" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Loan/Savings Ratio</p>
              </div>
              <p className="text-lg font-bold text-slate font-numbers">{(a.loan_to_savings_ratio || 0).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Breakdown rows */}
      <Card className="border-sand bg-white shadow-subtle rounded-xl">
        <CardHeader className="pb-2 border-b border-sand/40">
          <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider">Contribution Health</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-sand">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-500">Late contributions</span>
            <span className="text-xs font-semibold text-alert">{a.late_contributions || 0}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-500">Missed contributions</span>
            <span className="text-xs font-semibold text-danger">{a.missed_contributions || 0}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-500">Late fees collected</span>
            <span className="text-xs font-semibold text-slate font-numbers">{formatKES(a.total_late_fees || 0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Loan Health */}
      <Card className="border-sand bg-white shadow-subtle rounded-xl">
        <CardHeader className="pb-2 border-b border-sand/40">
          <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider">Loan Health</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-sand">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-gray-500">Fully repaid</span>
            </div>
            <span className="text-xs font-semibold text-success">{a.loans_fully_repaid || 0}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5 text-danger" />
              <span className="text-xs text-gray-500">In default</span>
            </div>
            <span className="text-xs font-semibold text-danger">{a.loans_in_default || 0}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-500">Total loan amount</span>
            <span className="text-xs font-semibold text-slate font-numbers">{formatKES(a.total_loan_amount || 0)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-xs text-gray-500">Interest earned</span>
            <span className="text-xs font-semibold text-slate font-numbers">{formatKES(a.total_interest_earned || 0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Meetings */}
      {(a.total_meetings || a.average_attendance) && (
        <Card className="border-sand bg-white shadow-subtle rounded-xl">
          <CardHeader className="pb-2 border-b border-sand/40">
            <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-terracotta" />
              Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-sand">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500">Total meetings</span>
              <span className="text-xs font-semibold text-slate">{a.total_meetings || 0}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-gray-500">Avg attendance</span>
              <span className="text-xs font-semibold text-slate">{(a.average_attendance || 0).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period info */}
      {a.period_start && (
        <p className="text-[10px] text-gray-400 text-center">
          Period: {new Date(a.period_start).toLocaleDateString()} – {new Date(a.period_end).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}