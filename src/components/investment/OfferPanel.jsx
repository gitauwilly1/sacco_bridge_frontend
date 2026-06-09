import { User } from 'lucide-react';

export default function OfferPanel({ offer, isOwnOffer, onAccept, onDecline, onCounter, isPending }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-subtle border-2 border-terracotta-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
        <p className="text-xs text-slate-500">
          {isOwnOffer ? 'Your offer' : `Offer from ${offer.offered_by_name}`}
        </p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="font-numbers font-bold text-slate-800 text-xl">
          KSh {parseFloat(offer.price_per_share || 0).toFixed(0)}
        </p>
        <span className="text-xs text-slate-500">per share</span>
      </div>

      <div className="flex justify-between text-sm mb-3">
        <span className="text-slate-500">Total</span>
        <span className="font-numbers font-semibold text-slate-800">
          KSh {parseInt(offer.total_amount || 0).toLocaleString()}
        </span>
      </div>

      {offer.message && (
        <p className="text-xs text-slate-500 mb-3 italic">"{offer.message}"</p>
      )}

      {!isOwnOffer && offer.status === 'PENDING' && (
        <div className="flex gap-2">
          {onAccept && (
            <button onClick={onAccept} disabled={isPending}
              className="flex-1 py-2 bg-success-600 text-white text-xs font-medium rounded-lg hover:bg-success-700 disabled:opacity-50">
              Accept
            </button>
          )}
          {onDecline && (
            <button onClick={onDecline} disabled={isPending}
              className="flex-1 py-2 bg-white border border-error-200 text-error-600 text-xs font-medium rounded-lg hover:bg-error-50 disabled:opacity-50">
              Decline
            </button>
          )}
          {onCounter && (
            <button onClick={onCounter} disabled={isPending}
              className="flex-1 py-2 bg-white border border-alert-200 text-alert-600 text-xs font-medium rounded-lg hover:bg-alert-50 disabled:opacity-50">
              Counter
            </button>
          )}
        </div>
      )}
    </div>
  );
}