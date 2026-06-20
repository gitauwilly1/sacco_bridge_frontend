import { useState, useCallback } from 'react';
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
import { toast } from 'sonner';
import { notificationApi } from '../api/notificationApi';
import { formatTimeAgo } from '../../../utils/format';
import useNotificationStore from '../../../stores/notificationStore';

const categoryConfig = {
  chama: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  contribution: { icon: HandCoins, color: 'text-success', bg: 'bg-success/10' },
  loan: { icon: DollarSign, color: 'text-alert', bg: 'bg-alert/10' },
  investment: { icon: Building2, color: 'text-terracotta', bg: 'bg-terracotta/10' },
  settlement: { icon: CheckCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  meeting: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  poll: { icon: Vote, color: 'text-alert', bg: 'bg-alert/10' },
  security: { icon: Shield, color: 'text-danger', bg: 'bg-danger/10' },
  system: { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' },
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
      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        !notification.is_read ? 'bg-sand-light/50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-lg ${category.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${category.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-slate`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-terracotta flex-shrink-0 mt-1.5" />
            )}
          </div>
          {notification.body && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {notification.body}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">
              {formatTimeAgo(notification.created_at)}
            </span>
            {notification.category && (
              <Badge className={category.color} variant="outline">
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
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-64 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationList() {
  const queryClient = useQueryClient();
  const { resetUnread } = useNotificationStore();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['notifications', page, filter, showUnreadOnly],
    queryFn: () =>
      notificationApi
        .getNotifications({
          page,
          page_size: 20,
          ...(filter !== 'all' && { category: filter }),
          ...(showUnreadOnly && { is_read: false }),
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
      <div className="sticky top-14 z-30 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-slate">Notifications</h1>
            <p className="text-xs text-gray-500">{total} notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`text-xs px-2 py-1 rounded-full ${
                showUnreadOnly
                  ? 'bg-terracotta/10 text-terracotta'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Unread
            </button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Read All
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 px-4 pb-2 overflow-x-auto">
          {categoryTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                filter === tab.value
                  ? 'bg-terracotta text-white'
                  : 'bg-gray-100 text-gray-600'
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
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={
            filter !== 'all' || showUnreadOnly
              ? 'No notifications match your filters'
              : "You're all caught up!"
          }
        />
      ) : (
        <>
          <div>
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
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
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