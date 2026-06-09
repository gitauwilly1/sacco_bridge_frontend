import { Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChamaCard({ chama, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(chama);
    } else {
      navigate(`/chamas/${chama.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">
              {chama.name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-slate-800 text-sm">{chama.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {chama.member_count || 0}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-xs text-slate-500">
                {chama.contribution_frequency_display || chama.contribution_frequency || 'Weekly'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-numbers font-semibold text-slate-700 text-sm">
              KSh {parseInt(chama.total_savings || 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">total saved</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}