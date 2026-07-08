import useAuthStore from '../../stores/authStore';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export default function PushNotificationInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  usePushNotifications();

  return null;
}
