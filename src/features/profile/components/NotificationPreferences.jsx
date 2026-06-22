import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Mail, Smartphone, MessageSquare, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/feedback';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';

const notificationCategories = [
  {
    key: 'contributions',
    label: 'Contributions',
    description: 'When members contribute or contributions are due',
    icon: Bell,
  },
  {
    key: 'loans',
    label: 'Loans',
    description: 'Loan applications, approvals, and repayment reminders',
    icon: Bell,
  },
  {
    key: 'meetings',
    label: 'Meetings',
    description: 'Meeting invitations, reminders, and minutes',
    icon: Bell,
  },
  {
    key: 'polls',
    label: 'Polls',
    description: 'New polls and voting results',
    icon: Bell,
  },
  {
    key: 'investments',
    label: 'Investments',
    description: 'New opportunities, offers, and settlement updates',
    icon: Bell,
  },
  {
    key: 'security',
    label: 'Security',
    description: 'Login alerts, password changes, 2FA updates',
    icon: Bell,
  },
  {
    key: 'system',
    label: 'System',
    description: 'Platform updates, maintenance, and announcements',
    icon: Bell,
  },
];

const channels = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'push', label: 'Push', icon: Smartphone },
  { key: 'in_app', label: 'In-App', icon: MessageSquare },
];

function PreferencesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-sand">
          <CardContent className="p-4 space-y-2.5">
            <div className="skeleton-shimmer h-4 w-32 rounded-lg" />
            <div className="skeleton-shimmer h-3 w-48 rounded" />
            <div className="flex gap-3">
              <div className="skeleton-shimmer h-6 w-16 rounded-full" />
              <div className="skeleton-shimmer h-6 w-16 rounded-full" />
              <div className="skeleton-shimmer h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function NotificationPreferences() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({});

  const {
    data: prefsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () =>
      profileApi
        .getNotificationPreferences()
        .then((r) => r.data.data || r.data || {}),
    onSuccess: (data) => {
      setPreferences(data.preferences || data || {});
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => profileApi.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferences saved');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to save preferences'
      );
    },
  });

  const handleToggle = (category, channel) => {
    setPreferences((prev) => {
      const catPrefs = prev[category] || {};
      return {
        ...prev,
        [category]: {
          ...catPrefs,
          [channel]: !catPrefs[channel],
        },
      };
    });
  };

  const handleSave = () => {
    saveMutation.mutate({ preferences });
  };

  if (isLoading) return <PreferencesSkeleton />;
  if (error) {
    return (
      <ErrorState message="Failed to load preferences" onRetry={refetch} />
    );
  }

  return (
    <div className="space-y-4">
      {notificationCategories.map((category) => {
        const Icon = category.icon;
        const catPrefs = preferences[category.key] || {};

        return (
          <Card key={category.key} className="border-sand bg-white shadow-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="h-4.5 w-4.5 text-terracotta" />
                <h3 className="text-sm font-bold text-slate">
                  {category.label}
                </h3>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-3.5 leading-relaxed">
                {category.description}
              </p>
              <div className="flex gap-2.5">
                {channels.map((channel) => {
                  const ChannelIcon = channel.icon;
                  const isActive = catPrefs[channel.key] !== false; // default true

                  return (
                    <button
                      key={channel.key}
                      onClick={() => handleToggle(category.key, channel.key)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-terracotta/10 text-terracotta border-terracotta/20 shadow-none'
                          : 'bg-gray-50 text-gray-400 border-gray-200/60 hover:bg-gray-100 hover:text-slate'
                      }`}
                    >
                      <ChannelIcon className="h-3.5 w-3.5" />
                      {channel.label}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Button
        className="w-full bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-10 rounded-xl text-xs font-semibold mt-2"
        onClick={handleSave}
        disabled={saveMutation.isPending}
      >
        <Save className="mr-2 h-4 w-4" />
        {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}