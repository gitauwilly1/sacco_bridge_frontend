import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import useNotificationStore from '../../../stores/notificationStore';
import { notificationApi } from '../api/notificationApi';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount } = useNotificationStore();

  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () =>
      notificationApi.getUnreadCount().then((r) => r.data.data?.count || r.data.count || 0),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  useEffect(() => {
    if (data != null) {
      setUnreadCount(data);
    }
  }, [data, setUnreadCount]);

  return (
    <button
      onClick={() => navigate({ to: '/notifications' })}
      className="relative p-2"
    >
      <Bell className="h-5 w-5 text-slate" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}