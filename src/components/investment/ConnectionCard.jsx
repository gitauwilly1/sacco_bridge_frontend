import StatusBadge from '@/components/shared/StatusBadge.jsx';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConnectionCard({ connection, onClick }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(connection);
    else navigate(`/connections/${connection.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-semibold text-slate-800 text-sm">
          {connection.sacco_name}
        </h3>
        <StatusBadge status={connection.status} size="xs" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {connection.buyer_name} - {connection.seller_name}
          </p>
          {connection.total_amount && (
            <p className="text-sm font-numbers font-semibold text-slate-700 mt-1">
              KSh {parseInt(connection.total_amount).toLocaleString()}
            </p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}