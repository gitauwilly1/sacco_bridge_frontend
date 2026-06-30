import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Bell, CheckCheck, HandCoins, DollarSign, Shield,
  Users, Building2, AlertCircle, Calendar, Vote,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState } from '@/components/feedback';
import SearchInput from '@/components/ui/SearchInput';
import DateRangeFilter from '@/components/ui/DateRangeFilter';
import { toast } from 'sonner';
import { notificationApi } from '../api/notificationApi';
import { formatTimeAgo } from '../../../utils/format';
import useNotificationStore from '../../../stores/notificationStore';
import useSocketStore from '../../../stores/socketStore';

const categoryConfig = {
  chama: { icon: Users, color: 'text-blue-500', bg: 'bg-sand-light' },
  contribution: { icon: HandCoins, color: 'text-success', bg: 'bg-sand-light' },
  loan: { icon: DollarSign, color: 'text-alert', bg: 'bg-sand-light' },
  investment: { icon: Building2, color: 'text-terracotta', bg: 'bg-sand-light' },
  settlement: { icon: CheckCheck, color: 'text-terracotta', bg: 'bg-sand-light' },
  meeting: { icon: Calendar, color: 'text-blue-500', bg: 'bg-sand-light' },
  poll: { icon: Vote, color: 'text-alert', bg: 'bg-sand-light' },
  security: { icon: Shield, color: 'text-danger', bg: 'bg-sand-light' },
  system: { icon: Bell, color: 'text-slate', bg: 'bg-sand-light' },
};

const categoryTabs = [
  { value: 'all', label: 'All' },
  { value: 'chama', label: 'Chama' },
  { value: 'loan', label: 'Loans' },
  { value: 'investment', label: 'Investments' },
  { value: 'security', label: 'Security' },
];

function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { decrementUnread } = useNotificationStore();
  const category = categoryConfig[notification.category] || categoryConfig.system;
  const Icon = category.icon;

  const markReadMutation = useMutation({
    mutationFn: () => notificationApi.markAsRead(notification.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      decrementUnread();
    },
  });

  const handlePress = () => {
    if (!notification.is_read) {
      markReadMutation.mutate();
    }
    if (notification.action_url) {
      navigate({ to: notification.action_url });
    }
  };

  return (
    <button
      onClick={handlePress}
      className={`w-full text-left p-3.5 rounded-xl border card-lift transition-all cursor-pointer ${
        !notification.is_read
          ? 'bg-sand-light/30 border-sand-dark/15 shadow-none'
          : 'bg-white border-sand/45 shadow-subtle'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
          <Icon className={`h-5 w-5 ${category.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-xs ${!notification.is_read ? 'font-bold text-slate' : 'font-medium text-slate/80'} truncate`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="h-2.5 w-2.5 rounded-full bg-terracotta animate-pulse flex-shrink-0 mt-1.5" />
            )}
          </div>
          {notification.body && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {notification.body}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-400 font-medium font-numbers">
              {formatTimeAgo(notification.created_at)}
            </span>
            {notification.category && (
              <Badge className={`${category.color} bg-sand-light/60 border-sand-dark/20 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md shadow-none capitalize`} variant="outline">
                {notification.category}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function NotificationListSkeleton() {
  return (
    <div className="space-y-2.5 px-4 pt-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3.5 border border-sand/40 bg-white rounded-xl shadow-subtle flex items-start gap-3">
          <div className="skeleton-shimmer h-10 w-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-3.5 w-48 rounded" />
            <div className="skeleton-shimmer h-3 w-full rounded" />
            <div className="skeleton-shimmer h-2.5 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationList() {
  const queryClient = useQueryClient();
  const { resetUnread } = useNotificationStore();
  const { lastNotification, clearLastNotification } = useSocketStore();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [days, setDays] = useState('all');

  useEffect(() => {
    if (lastNotification) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      clearLastNotification();
    }
  }, [lastNotification, queryClient, clearLastNotification]);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', page, filter, showUnreadOnly, search, days],
    queryFn: () =>
      notificationApi
        .getNotifications({
          page,
          page_size: 20,
          ...(filter !== 'all' && { category: filter }),
          ...(showUnreadOnly && { is_read: false }),
          ...(search && { search }),
          ...(days !== 'all' && { days }),
        })
        .then((r) => r.data),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      resetUnread();
      toast.success('All notifications marked as read');
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const notifications = notificationsData?.results || notificationsData?.data || [];
  const total = notificationsData?.count || notifications.length;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b border-sand/40">
        <div className="px-4 pt-3 pb-2 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-slate">Notifications</h1>
              <p className="text-xs text-gray-400 font-medium">{total} notifications</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                  showUnreadOnly
                    ? 'bg-terracotta/10 text-terracotta border-terracotta/20 shadow-none'
                    : 'bg-sand-light/60 text-slate border-sand/40 hover:bg-sand-light'
                }`}
              >
                Unread
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="border-terracotta text-terracotta hover:bg-terracotta/5 hover:text-terracotta cursor-pointer h-8 rounded-lg text-xs font-semibold px-3 transition-all"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Read All
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search notifications..." className="flex-1" />
            <DateRangeFilter value={days} onChange={(v) => { setDays(v); setPage(1); }} />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap cursor-pointer transition-all border ${
                filter === tab.value
                  ? 'bg-terracotta text-white border-terracotta shadow-subtle'
                  : 'bg-sand-light/60 text-slate border-sand/40 hover:bg-sand-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <NotificationListSkeleton />
      ) : error ? (
        <ErrorState message="Failed to load notifications" onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description={
              filter !== 'all' || showUnreadOnly
                ? 'No notifications match your filters'
                : "You're all caught up!"
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-2.5 px-4 pt-3">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="border-sand hover:bg-sand-light text-slate text-xs font-semibold h-8 rounded-lg cursor-pointer transition-all"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-400 font-medium">
                {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="border-sand hover:bg-sand-light text-slate text-xs font-semibold h-8 rounded-lg cursor-pointer transition-all"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}