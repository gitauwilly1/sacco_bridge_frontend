import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Shield, Bell, Smartphone, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { profileApi } from '../api/profileApi';
import EditProfileForm from './EditProfileForm';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import SessionManager from './SessionManager';
import DataExport from './DataExport';
import AccountDeactivation from './AccountDeactivation';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile().then((r) => r.data.data || r.data),
  });

  const { data: detailedProfile } = useQuery({
    queryKey: ['detailedProfile'],
    queryFn: () =>
      profileApi.getDetailedProfile().then((r) => r.data.data || r.data),
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load profile" onRetry={refetch} />;

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <div className="text-center py-6 bg-sand-light/50">
        <div className="relative mx-auto w-24 h-24 rounded-full bg-white border-2 border-sand flex items-center justify-center mb-3 overflow-hidden">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile?.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-terracotta">
              {profile?.initials || (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '') || '?'}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate">{profile?.full_name || profile?.email}</h1>
        <p className="text-sm text-gray-500">{profile?.email}</p>
        {profile?.phone_number && (
          <p className="text-xs text-gray-400 mt-0.5">{profile.phone_number}</p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 mt-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-1" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-1" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1" /> Alerts
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Smartphone className="h-4 w-4 mr-1" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="data">
            <Download className="h-4 w-4 mr-1" /> Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <EditProfileForm profile={profile} detailedProfile={detailedProfile} />
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SecuritySettings profile={profile} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <SessionManager />
        </TabsContent>

        <TabsContent value="data" className="mt-4 space-y-4">
          <DataExport />
          <AccountDeactivation />
        </TabsContent>
      </Tabs>
    </div>
  );
}