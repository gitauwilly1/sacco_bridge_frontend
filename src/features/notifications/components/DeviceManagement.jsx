import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Smartphone, Monitor, Trash2, Circle, BellPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationApi } from '../api/notificationApi';
import { formatDate } from '../../../utils/format';
import { toast } from 'sonner';
import { usePushNotifications } from '../../../hooks/usePushNotifications';

const deviceIcons = { IOS: Smartphone, ANDROID: Smartphone, WEB: Monitor };

export default function DeviceManagement() {
  const queryClient = useQueryClient();
  const { permission, fcmToken, isRegistering, requestPermission } = usePushNotifications();

  const { data, isLoading } = useQuery({
    queryKey: ['user-devices'],
    queryFn: () => notificationApi.getDevices().then((r) => r.data.data || r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationApi.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-devices'] });
      toast.success('Device removed');
    },
    onError: () => toast.error('Failed to remove device'),
  });

  const devices = Array.isArray(data) ? data : data?.results || [];

  return (
    <Card className="border-sand bg-white shadow-subtle rounded-2xl">
      <CardHeader className="pb-3 border-b border-sand/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate">Registered Devices</CardTitle>
          <Button
            variant="ghost" size="sm"
            onClick={requestPermission}
            disabled={isRegistering || permission === 'granted'}
            className="text-xs font-semibold text-terracotta hover:text-terracotta-dark hover:bg-terracotta/5 cursor-pointer"
          >
            <BellPlus className="h-3.5 w-3.5 mr-1" />
            {isRegistering ? 'Registering...' : permission === 'granted' ? 'Active' : 'Enable Push'}
          </Button>
        </div>
        {permission === 'denied' && (
          <p className="text-xs text-alert mt-1">Push notifications blocked. Update your browser settings to enable.</p>
        )}
      </CardHeader>
      <CardContent className="pt-3">
        {isLoading && (
          <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        )}
        {!isLoading && devices.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">No devices registered</p>
        )}
        <div className="space-y-2">
          {devices.map((device) => {
            const Icon = deviceIcons[device.device_type] || Smartphone;
            return (
              <div key={device.id} className="flex items-center justify-between p-3 rounded-xl bg-sand-light/30 hover:bg-sand-light transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${device.is_active ? 'bg-success/10' : 'bg-gray-100'}`}>
                    <Icon className={`h-4 w-4 ${device.is_active ? 'text-success' : 'text-gray-300'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate">{device.device_name || device.device_type}</p>
                      {device.is_active && <Circle className="h-1.5 w-1.5 fill-success text-success" />}
                    </div>
                    <p className="text-xs text-gray-400">
                      {device.device_type} {device.app_version && `v${device.app_version}`} &middot; Last active {formatDate(device.last_active_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => deleteMutation.mutate(device.id)}
                  disabled={deleteMutation.isPending}
                  className="text-gray-300 hover:text-alert hover:bg-alert/5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}