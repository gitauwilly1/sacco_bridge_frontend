import StatusBadge from '@/components/shared/StatusBadge.jsx';

export default function OpportunityCard({ opportunity, onExpressInterest, isPending }) {
  const urgencyColors = {
    STANDARD: 'bg-success-50 text-success-700',
    PRIORITY: 'bg-alert-50 text-alert-700',
    URGENT: 'bg-error-50 text-error-700',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading font-semibold text-slate-800 text-sm">
            {opportunity.sacco_name}
          </h3>
          <p className="text-xs text-slate-500">
            {opportunity.share_quantity} shares available
          </p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyColors[opportunity.urgency] || urgencyColors.STANDARD}`}>
          {opportunity.urgency === 'URGENT' ? 'Urgent' : opportunity.urgency === 'PRIORITY' ? 'Priority' : 'Standard'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Est. Range</p>
          <p className="font-numbers font-semibold text-slate-800 text-xs">
            KSh {parseInt(opportunity.total_expected_value || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Per Share</p>
          <p className="font-numbers font-semibold text-slate-800 text-xs">
            KSh {parseFloat(opportunity.expected_price_per_share || 0).toFixed(0)}
          </p>
        </div>
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Timeline</p>
          <p className="font-numbers font-semibold text-slate-800 text-xs">
            {opportunity.urgency === 'URGENT' ? '24h' : opportunity.urgency === 'PRIORITY' ? '48h' : '1 week'}
          </p>
        </div>
      </div>

      {opportunity.notes && (
        <p className="text-xs text-slate-500 mb-3 italic">"{opportunity.notes}"</p>
      )}

      {onExpressInterest && (
        <button
          onClick={onExpressInterest}
          disabled={isPending}
          className="w-full py-2 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-xs font-medium rounded-lg hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all"
        >
          {isPending ? 'Sending...' : 'Express Interest'}
        </button>
      )}
    </div>
  );
}