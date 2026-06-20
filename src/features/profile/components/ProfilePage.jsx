import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User, Shield, Bell, Smartphone, Download,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { profileApi } from '../api/profileApi';
import { getInitials } from '../../../utils/format';
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

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load profile" onRetry={refetch} />;

  return (
    <div className="pb-4">
      {/* Profile Header */}
      <div className="text-center py-6 px-4">
        <div className="relative mx-auto w-24 h-24 rounded-full bg-sand-light flex items-center justify-center mb-3">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile?.full_name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-terracotta">
              {getInitials(profile?.first_name, profile?.last_name) || '?'}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate">
          {profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`}
        </h1>
        <p className="text-sm text-gray-500">{profile?.email}</p>
        {profile?.trust_score > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 bg-sand-light px-3 py-1 rounded-full">
            <Shield className="h-4 w-4 text-terracotta" />
            <span className="text-sm font-medium text-terracotta">
              Trust Score: {profile.trust_score}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
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
          <EditProfileForm profile={profile} />
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