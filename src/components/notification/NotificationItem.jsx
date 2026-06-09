import { Bell, Wallet, TrendingUp, CheckCheck, AlertTriangle, Shield, Info, Megaphone } from 'lucide-react';

const categoryIcons = {
  CHAMA_CONTRIBUTION: { icon: Wallet, color: 'text-success-600 bg-success-50' },
  CHAMA_LOAN: { icon: Wallet, color: 'text-terracotta-600 bg-terracotta-50' },
  INVESTMENT_OFFER: { icon: TrendingUp, color: 'text-slate-600 bg-slate-50' },
  SETTLEMENT: { icon: CheckCheck, color: 'text-success-600 bg-success-50' },
  DISPUTE: { icon: AlertTriangle, color: 'text-error-600 bg-error-50' },
  SECURITY: { icon: Shield, color: 'text-slate-600 bg-slate-50' },
  SYSTEM: { icon: Info, color: 'text-slate-600 bg-slate-50' },
  MARKETING: { icon: Megaphone, color: 'text-terracotta-600 bg-terracotta-50' },
};

const defaultIcon = { icon: Bell, color: 'text-slate-500 bg-slate-50' };

export default function NotificationItem({ notification, onClick }) {
  const { icon: Icon, color } = categoryIcons[notification.category] || defaultIcon;

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer ${
        !notification.is_read ? 'border-l-[3px] border-l-terracotta-500' : ''
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className="text-sm font-medium text-slate-800 truncate">{notification.title}</h4>
          {!notification.is_read && (
            <div className="w-2 h-2 rounded-full bg-terracotta-500 flex-shrink-0 ml-2" />
          )}
        </div>
        <p className="text-xs text-slate-500 line-clamp-2">{notification.body}</p>
        <p className="text-xs text-slate-400 mt-1">
          {new Date(notification.created_at).toLocaleDateString()} ·{' '}
          {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}