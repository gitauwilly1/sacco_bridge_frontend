import { TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SaccoCard({ sacco, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(sacco);
    else navigate(`/saccos/${sacco.id}`);
  };

  const tierColors = {
    TIER_1: 'bg-success-50 text-success-700',
    TIER_2: 'bg-alert-50 text-alert-700',
    TIER_3: 'bg-slate-100 text-slate-600',
    UNRATED: 'bg-slate-50 text-slate-500',
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-slate-800 text-sm">{sacco.name}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tierColors[sacco.sasra_tier] || tierColors.UNRATED}`}>
              {sacco.sasra_tier?.replace('_', ' ') || 'Unrated'}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Dividend</p>
          <p className="font-numbers font-semibold text-success-600 text-xs">
            {sacco.dividend_rate || 0}%
          </p>
        </div>
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Price</p>
          <p className="font-numbers font-semibold text-slate-800 text-xs">
            KSh {parseFloat(sacco.estimated_share_value || 0).toFixed(0)}
          </p>
        </div>
        <div className="bg-sand-50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500">Listings</p>
          <p className="font-numbers font-semibold text-terracotta-600 text-xs">
            {sacco.active_listings || 0}
          </p>
        </div>
      </div>
    </div>
  );
}