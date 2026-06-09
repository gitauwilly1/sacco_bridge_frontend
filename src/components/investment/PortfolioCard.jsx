export default function PortfolioCard({ totalValue, holdingsCount, activeConnections, completedSettlements, trend }) {
  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-5 text-white shadow-medium">
      <p className="text-slate-300 text-xs font-medium uppercase tracking-wide">Portfolio Value</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-3xl font-numbers font-bold">
          KSh {parseInt(totalValue || 0).toLocaleString()}
        </p>
        {trend !== undefined && (
          <span className={`text-xs font-medium mb-1 ${trend >= 0 ? 'text-success-400' : 'text-error-400'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <div>
          <p className="text-slate-400 text-xs">Holdings</p>
          <p className="font-semibold text-sm">{holdingsCount || 0}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Active</p>
          <p className="font-semibold text-sm">{activeConnections || 0}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Completed</p>
          <p className="font-semibold text-sm">{completedSettlements || 0}</p>
        </div>
      </div>
    </div>
  );
}