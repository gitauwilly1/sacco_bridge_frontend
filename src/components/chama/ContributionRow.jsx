import StatusBadge from '@/components/shared/StatusBadge.jsx';

export default function ContributionRow({ contribution, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 bg-white rounded-xl p-3 shadow-subtle ${
        onClick ? 'cursor-pointer hover:shadow-medium transition-all duration-200' : ''
      }`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        contribution.status === 'PAID' ? 'bg-success-500' :
        contribution.status === 'PENDING' ? 'bg-alert-500' :
        contribution.status === 'LATE' ? 'bg-error-500' :
        'bg-slate-300'
      }`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 truncate">
          {contribution.member_name || contribution.member?.user_name || 'Member'}
        </p>
        <p className="text-xs text-slate-500">
          {contribution.period_start} - {contribution.period_end}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-numbers font-semibold text-slate-700">
          KSh {parseInt(contribution.amount || 0).toLocaleString()}
        </p>
        <StatusBadge status={contribution.status} size="xs" />
      </div>
    </div>
  );
}