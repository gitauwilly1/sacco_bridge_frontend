import StatusBadge from '@/components/shared/StatusBadge.jsx';
import { Landmark } from 'lucide-react';

export default function LoanCard({ loan, onClick, showActions, onApprove, onDisburse, onRepay }) {
  const progressPercent = loan.total_repayable > 0
    ? ((parseFloat(loan.total_repayable) - parseFloat(loan.outstanding_balance || 0)) / parseFloat(loan.total_repayable)) * 100
    : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 shadow-subtle ${
        onClick ? 'cursor-pointer hover:shadow-medium transition-all duration-200' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-terracotta-50 flex items-center justify-center">
            <Landmark className="w-4 h-4 text-terracotta-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{loan.borrower_name}</p>
            <p className="text-xs text-slate-500">{loan.purpose}</p>
          </div>
        </div>
        <StatusBadge status={loan.status} size="xs" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-500">Principal</p>
          <p className="text-sm font-numbers font-semibold text-slate-700">
            KSh {parseInt(loan.principal || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Outstanding</p>
          <p className="text-sm font-numbers font-semibold text-slate-700">
            KSh {parseInt(loan.outstanding_balance || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {loan.status === 'DISBURSED' || loan.status === 'PARTIALLY_REPAID' ? (
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Repaid</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-sand-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success-500 to-success-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-sand-100">
          {loan.status === 'PENDING' && onApprove && (
            <button onClick={onApprove} className="flex-1 py-1.5 bg-success-600 text-white text-xs font-medium rounded-lg hover:bg-success-700">
              Approve
            </button>
          )}
          {loan.status === 'APPROVED' && onDisburse && (
            <button onClick={onDisburse} className="flex-1 py-1.5 bg-terracotta-600 text-white text-xs font-medium rounded-lg hover:bg-terracotta-700">
              Disburse
            </button>
          )}
          {(loan.status === 'DISBURSED' || loan.status === 'PARTIALLY_REPAID') && onRepay && (
            <button onClick={onRepay} className="flex-1 py-1.5 bg-success-600 text-white text-xs font-medium rounded-lg hover:bg-success-700">
              Record Repayment
            </button>
          )}
        </div>
      )}
    </div>
  );
}