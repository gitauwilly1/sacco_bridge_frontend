import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User, Shield, Bell, Smartphone, Download, Palette,
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
import TransactionLimits from './TransactionLimits';
import AppearanceSettings from './AppearanceSettings';
import VerificationStatus from './VerificationStatus';
import ConnectedAccounts from './ConnectedAccounts';
import UserProfileScore from './UserProfileScore';


export default function ProfilePage({ defaultTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

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
        <div className="relative mx-auto w-24 h-24 rounded-full bg-sand-light flex items-center justify-center mb-3 ring-4 ring-sand/30 shadow-subtle">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile?.full_name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl font-extrabold text-terracotta font-heading">
              {getInitials(profile?.first_name, profile?.last_name) || '?'}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate">
          {profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`}
        </h1>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{profile?.email}</p>
        {profile?.trust_score > 0 && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-terracotta/10 border border-terracotta/20 px-3 py-1 rounded-full text-xs font-bold text-terracotta shadow-none">
            <Shield className="h-3.5 w-3.5" />
            <span>Trust Score: {profile.trust_score}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="bg-sand-light/60 p-1 rounded-xl border border-sand/40 w-full justify-start overflow-x-auto flex gap-1 scrollbar-none">
          <TabsTrigger
            value="profile"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <Shield className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <Bell className="h-3.5 w-3.5" /> Alerts
          </TabsTrigger>
          <TabsTrigger
            value="sessions"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <Smartphone className="h-3.5 w-3.5" /> Sessions
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <Download className="h-3.5 w-3.5" /> Data
          </TabsTrigger>
          <TabsTrigger
            value="limits"
            className="px-3 py-2 text-xs rounded-lg cursor-pointer transition-all flex items-center gap-1.5 font-bold data-[state=active]:bg-white data-[state=active]:text-terracotta data-[state=active]:shadow-subtle data-[state=active]:border data-[state=active]:border-sand/65 text-slate hover:text-terracotta/80 font-heading"
          >
            <Shield className="h-3.5 w-3.5" /> Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <UserProfileScore />
          <VerificationStatus profile={profile} />
          <EditProfileForm profile={profile} />
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <ConnectedAccounts profile={profile} />
          <SecuritySettings profile={profile} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <SessionManager />
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="data" className="mt-4 space-y-4">
          <DataExport />
          <AccountDeactivation />
        </TabsContent>

        <TabsContent value="limits" className="mt-4">
          <TransactionLimits />
        </TabsContent>
      </Tabs>
    </div>
  );
}