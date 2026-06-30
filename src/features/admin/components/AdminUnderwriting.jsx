import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, CheckCircle2,
  ChevronRight, Search, ArrowLeft, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { adminApi } from '../api/adminApi';
import { scoringApi } from '../../chamas/api/scoringApi';
import { chamaApi } from '../../chamas/api/chamaApi';
import { formatKES } from '../../../utils/format';
import { toast } from 'sonner';

const decisionColors = {
  APPROVE: 'bg-success/10 text-success',
  APPROVE_WITH_CONDITIONS: 'bg-blue-500/10 text-blue-600',
  FLAG_FOR_REVIEW: 'bg-alert/10 text-alert',
  REJECT: 'bg-danger/10 text-danger',
};

const decisionLabels = {
  APPROVE: 'Approve',
  APPROVE_WITH_CONDITIONS: 'Conditional',
  FLAG_FOR_REVIEW: 'Flagged',
  REJECT: 'Reject',
};

export default function AdminUnderwriting() {
  const queryClient = useQueryClient();
  const [selectedChamaId, setSelectedChamaId] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [search, setSearch] = useState('');
  const [loanPage, setLoanPage] = useState(1);

  /* Chamas list */
  const { data: chamas, isLoading: chamasLoading, error: chamasError } = useQuery({
    queryKey: ['admin-chamas-uw'],
    queryFn: () =>
      adminApi.getChamasAdmin({ page_size: 100 }).then((r) => {
        const d = r.data.data || r.data;
        return Array.isArray(d) ? d : d.results || [];
      }),
  });

  /* Loans for selected chama */
  const { data: loansRes, isLoading: loansLoading, error: loansError } = useQuery({
    queryKey: ['chama-loans-uw', selectedChamaId, loanPage],
    queryFn: () =>
      chamaApi.getLoans(selectedChamaId, { page: loanPage, page_size: 20 }).then((r) => {
        const d = r.data.data || r.data;
        const list = Array.isArray(d) ? d : d.results || [];
        return {
          loans: list,
          totalPages: d.total_pages || Math.ceil((d.count || list.length) / 20) || 1,
          totalCount: d.count || list.length,
        };
      }),
    enabled: !!selectedChamaId,
  });

  /* Underwriting for selected loan */
  const { data: underwriting, isLoading: uwLoading, error: uwError, refetch: uwRefetch } = useQuery({
    queryKey: ['underwriting', selectedLoanId],
    queryFn: () => scoringApi.getUnderwritingDecision(selectedLoanId).then((r) => r.data.data || r.data),
    enabled: !!selectedLoanId,
  });

  /* Override mutation */
  const overrideMutation = useMutation({
    mutationFn: ({ loanId, decision, reason }) =>
      scoringApi.overrideUnderwriting(loanId, { decision, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['underwriting', selectedLoanId] });
      toast.success('Underwriting decision overridden');
    },
    onError: () => toast.error('Failed to override decision'),
  });

  const [overrideDecision, setOverrideDecision] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  const filteredChamas = (chamas || []).filter(
    (c) => !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedLoanId) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { setSelectedLoanId(null); setOverrideDecision(''); setOverrideReason(''); }}
          className="text-xs text-gray-500 hover:text-slate"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to loans
        </Button>

        {uwError && (
          <ErrorState message="Failed to load underwriting decision" onRetry={uwRefetch} />
        )}

        {uwLoading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : underwriting && (
          <Card className="border-sand bg-white shadow-subtle rounded-2xl">
            <CardHeader className="pb-3 border-b border-sand/40">
              <CardTitle className="text-xs font-bold text-slate uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-terracotta" />
                Underwriting Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={`text-xs font-bold px-3 py-1 rounded-full border-0 ${decisionColors[underwriting.decision] || 'bg-sand text-slate'}`}>
                  {decisionLabels[underwriting.decision] || underwriting.decision}
                </Badge>
                {underwriting.overridden && (
                  <Badge className="text-xs bg-alert/10 text-alert border-0 rounded-full">
                    Overridden to {decisionLabels[underwriting.overridden_decision] || underwriting.overridden_decision}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-sand-light/50">
                  <p className="text-lg font-bold text-slate font-numbers">{underwriting.confidence ?? '—'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Confidence</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/50">
                  <p className="text-lg font-bold text-slate font-numbers">{underwriting.credit_score ?? '—'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Credit Score</p>
                </div>
                <div className="p-3 rounded-xl bg-sand-light/50">
                  <p className="text-lg font-bold text-slate font-numbers">{underwriting.chama_health ?? '—'}</p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">Chama Health</p>
                </div>
              </div>

              {underwriting.reasoning && (
                <div>
                  <p className="text-xs font-semibold text-slate mb-1">Reasoning</p>
                  <pre className="text-xs text-gray-500 bg-sand-light/50 rounded-lg p-3 overflow-auto whitespace-pre-wrap">
                    {typeof underwriting.reasoning === 'string' ? underwriting.reasoning : JSON.stringify(underwriting.reasoning, null, 2)}
                  </pre>
                </div>
              )}

              {underwriting.conditions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate mb-1">Conditions</p>
                  <ul className="space-y-1">
                    {underwriting.conditions.map((c, i) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-alert mt-0.5 flex-shrink-0" />
                        {typeof c === 'string' ? c : JSON.stringify(c)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!underwriting.overridden && (
                <div className="border-t border-sand/40 pt-4 space-y-3">
                  <p className="text-xs font-bold text-slate uppercase tracking-wider">Override Decision</p>
                  <div className="flex gap-2">
                    {['APPROVE', 'APPROVE_WITH_CONDITIONS', 'FLAG_FOR_REVIEW', 'REJECT'].map((d) => (
                      <Button
                        key={d}
                        variant={overrideDecision === d ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setOverrideDecision(d)}
                        className={`text-xs ${overrideDecision === d ? 'bg-terracotta text-white' : 'border-sand/40'}`}
                      >
                        {decisionLabels[d]}
                      </Button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Reason for override..."
                    className="w-full text-sm border border-sand/40 rounded-xl p-3 bg-white resize-none h-20 outline-none focus:border-terracotta/50 transition-colors"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="bg-terracotta text-white hover:bg-clay"
                    disabled={!overrideDecision || overrideMutation.isPending}
                    onClick={() =>
                      overrideMutation.mutate({ loanId: selectedLoanId, decision: overrideDecision, reason: overrideReason })
                    }
                  >
                    {overrideMutation.isPending ? 'Submitting...' : 'Submit Override'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate">Underwriting</h1>
        <p className="text-sm text-gray-500">Review loan underwriting decisions across all chamas</p>
      </div>

      {!selectedChamaId ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chamas..."
              className="pl-9 border-sand/40 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {chamasLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : chamasError ? (
            <ErrorState message="Failed to load chamas" onRetry={() => queryClient.invalidateQueries({ queryKey: ['admin-chamas-uw'] })} />
          ) : (
            <div className="space-y-2">
              {filteredChamas.map((chama) => (
                <Card
                  key={chama.id}
                  className="border-sand bg-white shadow-subtle rounded-xl cursor-pointer card-lift hover:border-terracotta/30"
                  onClick={() => { setSelectedChamaId(chama.id); setLoanPage(1); }}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate text-sm">{chama.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{chama.total_members || 0} members</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </CardContent>
                </Card>
              ))}
              {filteredChamas.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No chamas found</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedChamaId(null); setLoanPage(1); }}
            className="text-xs text-gray-500 hover:text-slate"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> All chamas
          </Button>

          {loansLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : loansError ? (
            <ErrorState message="Failed to load loans" onRetry={() => queryClient.invalidateQueries({ queryKey: ['chama-loans-uw', selectedChamaId, loanPage] })} />
          ) : (
            <>
              {/* Summary stat cards */}
              {(() => {
                const loanList = loansRes?.loans || [];
                const total = loanList.length;
                const approved = loanList.filter((l) => l.status === 'APPROVED').length;
                const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
                const avgConf = loanList.reduce((s, l) => s + (Number(l.confidence) || 0), 0);
                const avgConfVal = total > 0 && avgConf > 0 ? Math.round(avgConf / total) : null;
                return (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bento-card p-3 text-center">
                      <p className="text-lg font-extrabold text-slate font-numbers">{total}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Total Loans Reviewed</p>
                    </div>
                    <div className="bento-card p-3 text-center">
                      <p className="text-lg font-extrabold text-slate font-numbers">{approvalRate}%</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Approval Rate</p>
                    </div>
                    <div className="bento-card p-3 text-center">
                      <p className="text-lg font-extrabold text-slate font-numbers">{avgConfVal ?? '—'}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">Average Confidence</p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2">
                {(loansRes?.loans || []).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No loans in this chama</p>
                ) : (
                  (loansRes?.loans || []).map((loan) => (
                    <Card
                      key={loan.id}
                      className="border-sand bg-white shadow-subtle rounded-xl cursor-pointer card-lift hover:border-terracotta/30"
                      onClick={() => setSelectedLoanId(loan.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-sand-light flex items-center justify-center">
                            <FileText className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate">{loan.borrower_name || loan.borrower || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{formatKES(loan.principal || loan.amount || 0)}</p>
                          </div>
                        </div>
                        <Badge className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 ${
                          loan.status === 'APPROVED' ? 'bg-success/10 text-success' :
                          loan.status === 'PENDING' ? 'bg-alert/10 text-alert' :
                          loan.status === 'DISBURSED' ? 'bg-blue-500/10 text-blue-600' :
                          loan.status === 'REJECTED' ? 'bg-danger/10 text-danger' :
                          loan.status === 'REPAID' ? 'bg-sand text-slate' :
                          'bg-sand-light text-gray-400'
                        }`}>
                          {loan.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination */}
              {loansRes?.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  {Array.from({ length: loansRes.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setLoanPage(p)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                        p === loanPage ? 'bg-terracotta text-white' : 'bg-sand-light text-slate hover:bg-sand'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}