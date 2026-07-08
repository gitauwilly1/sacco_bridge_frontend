import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Bell } from 'lucide-react';
import useNotificationStore from '../../../stores/notificationStore';
import useSocketStore from '../../../stores/socketStore';
import { notificationApi } from '../api/notificationApi';

export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const { isConnected } = useSocketStore();
  const [isNewChange, setIsNewChange] = useState(false);

  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () =>
      notificationApi.getUnreadCount().then((r) => r.data.data?.count || r.data.count || 0),
    refetchInterval: 120000,
  });

  useEffect(() => {
    if (data != null) {
      setUnreadCount(data);
    }
  }, [data, setUnreadCount]);

  useEffect(() => {
    if (unreadCount > 0) {
      const t1 = setTimeout(() => setIsNewChange(true), 0);
      const t2 = setTimeout(() => setIsNewChange(false), 300);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [unreadCount]);

  return (
    <button
      onClick={() => navigate({ to: '/notifications' })}
      className="relative p-2 hover:bg-sand-light/50 rounded-lg transition-colors cursor-pointer"
    >
      <Bell className={`h-5 w-5 text-slate transition-transform ${unreadCount > 0 ? 'animate-bell-ring origin-top' : ''}`} />
      <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
      {unreadCount > 0 && (
        <span aria-live="polite" aria-atomic="true"
          className={`absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] font-extrabold rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-white shadow-subtle transition-all duration-300 ${
            isNewChange ? 'scale-125' : 'scale-100'
          }`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}