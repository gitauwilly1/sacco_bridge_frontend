import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Bell, CheckCheck, Wallet, TrendingUp, AlertTriangle, Shield, Info, Megaphone } from 'lucide-react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/');
      return data.data || data;
    },
  });

  const notifications = Array.isArray(data) ? data : data?.results || [];

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark_all_read/');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/notifications/${id}/mark_read/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

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

  const filters = ['ALL', 'CHAMA', 'INVESTMENT', 'SETTLEMENT', 'SYSTEM'];
  const filteredNotifications = filter === 'ALL'
    ? notifications
    : notifications.filter((n) => {
        if (filter === 'CHAMA') return n.category?.startsWith('CHAMA');
        if (filter === 'INVESTMENT') return n.category?.startsWith('INVESTMENT');
        if (filter === 'SETTLEMENT') return n.category === 'SETTLEMENT';
        if (filter === 'SYSTEM') return ['SYSTEM', 'SECURITY'].includes(n.category);
        return true;
      });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-heading font-semibold text-slate-800">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-xs text-slate-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="flex items-center gap-1.5 text-xs text-terracotta-600 font-medium hover:text-terracotta-700"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-terracotta-500 text-white'
                : 'bg-white text-slate-600 border border-sand-200'
            }`}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading && <ListSkeleton rows={6} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && filteredNotifications.length === 0 && (
        <EmptyState
          icon={<Bell className="w-10 h-10 text-terracotta-500" />}
          title="No notifications"
          description="You're all caught up. Notifications about your chamas and investments will appear here."
        />
      )}

      {!isLoading && !isError && filteredNotifications.length > 0 && (
        <div className="space-y-1">
          {filteredNotifications.map((notif) => {
            const { icon: Icon, color } = categoryIcons[notif.category] || defaultIcon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markOneMutation.mutate(notif.id)}
                className={`flex items-start gap-3 bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer ${
                  !notif.is_read ? 'border-l-3 border-l-terracotta-500' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-medium text-slate-800 truncate">{notif.title}</h4>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-terracotta-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{notif.body}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(notif.created_at).toLocaleDateString()} · {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}