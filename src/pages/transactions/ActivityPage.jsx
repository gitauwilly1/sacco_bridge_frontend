import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Clock, Wallet, Landmark, TrendingUp, FileText, ChevronRight } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function ActivityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ALL');

  const { data: settlementsData, isLoading: sLoading, isError: sError, refetch: sRefetch } = useQuery({
    queryKey: ['my-settlements'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/settlements/');
      return data.data || data;
    },
  });

  const { data: ledgerData, isLoading: lLoading, isError: lError, refetch: lRefetch } = useQuery({
    queryKey: ['my-ledger'],
    queryFn: async () => {
      const { data } = await api.get('/transactions/ledger/');
      return data.data || data;
    },
  });

  const settlements = Array.isArray(settlementsData) ? settlementsData : settlementsData?.results || [];
  const ledger = Array.isArray(ledgerData) ? ledgerData : ledgerData?.results || [];

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'SETTLEMENTS', label: 'Settlements' },
    { key: 'LEDGER', label: 'Ledger' },
    { key: 'RECEIPTS', label: 'Receipts' },
  ];

  const stateColors = {
    LEDGER_FINALIZED: 'bg-success-50 text-success-700',
    DISPUTED_MANUAL: 'bg-error-50 text-error-700',
    REVERSED: 'bg-slate-100 text-slate-600',
    COMPENSATING: 'bg-alert-50 text-alert-700',
  };

  const defaultStateColor = 'bg-alert-50 text-alert-700';

  const isLoading = sLoading || lLoading;
  const isError = sError || lError;
  const refetch = () => { sRefetch(); lRefetch(); };

  return (
    <div className="px-4 py-4 space-y-4">
      <h2 className="text-lg font-heading font-semibold text-slate-800">Activity</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-terracotta-500 text-white'
                : 'bg-white text-slate-600 border border-sand-200 hover:border-terracotta-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && settlements.length === 0 && ledger.length === 0 && (
        <EmptyState
          icon={<Clock className="w-10 h-10 text-terracotta-500" />}
          title="No activity yet"
          description="Your transactions, settlements, and receipts will appear here."
        />
      )}

      {!isLoading && !isError && (activeTab === 'ALL' || activeTab === 'SETTLEMENTS') && settlements.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-slate-700 mb-2">Settlements</h3>
          <div className="space-y-2">
            {settlements.slice(0, 10).map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/settlements/${s.uuid || s.id}`)}
                className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stateColors[s.state] || defaultStateColor}`}>
                    {s.state_display || s.state}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{s.sacco_name || s.buyer_sacco_name || 'SACCO'}</span>
                  <span className="font-numbers font-semibold text-slate-800">
                    KSh {parseInt(s.amount || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !isError && (activeTab === 'ALL' || activeTab === 'LEDGER') && ledger.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-slate-700 mb-2">Ledger Entries</h3>
          <div className="space-y-2">
            {ledger.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl p-4 shadow-subtle"
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Shares Transferred</span>
                  <span className="font-numbers font-semibold text-slate-800">
                    {parseFloat(entry.share_quantity || 0).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-numbers font-semibold text-slate-800">
                    KSh {parseInt(entry.total_amount || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(entry.recorded_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(activeTab === 'ALL' || activeTab === 'RECEIPTS') && (
        <Link
          to="/receipts"
          className="flex items-center justify-between bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-terracotta-600" />
            </div>
            <span className="font-heading font-semibold text-slate-800 text-sm">View Receipts</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      )}
    </div>
  );
}