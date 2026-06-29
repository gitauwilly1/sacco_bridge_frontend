import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Shield,
  Bell,
  Smartphone,
  Download,
  Palette,
  Menu,
  Save,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Activity,
  Gauge,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { profileApi } from '../api/profileApi';
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

const SECTIONS = [
  {
    value: 'profile',
    label: 'Overview',
    heading: 'Profile overview',
    icon: User,
    description: 'Personal details, verification, and account health in one place.',
    supportingText: 'Keep your profile accurate so chama members and administrators can trust your identity.',
    hasFooterActions: true,
    actions: {
      primary: { label: 'Save changes', icon: Save, target: 'profile-edit-form', type: 'submit' },
      secondary: { label: 'Reset', icon: RotateCcw, event: 'profile-form-reset' },
      help: { label: 'Help', message: 'Update your name, contact details, and investment preferences. Changes are saved securely to your account.' },
    },
  },
  {
    value: 'security',
    label: 'Security',
    heading: 'Security & access',
    icon: Shield,
    description: 'Protect your account with strong credentials and connected sign-in options.',
    supportingText: 'We recommend enabling two-factor authentication and reviewing linked accounts regularly.',
    actions: {
      manage: { label: 'Manage sessions', section: 'sessions' },
      help: { label: 'Help', message: 'Change your password, enable 2FA, and review third-party accounts linked to Sacco Bridge.' },
    },
  },
  {
    value: 'notifications',
    label: 'Notifications',
    heading: 'Notification preferences',
    icon: Bell,
    description: 'Choose how and when Sacco Bridge reaches you about activity that matters.',
    supportingText: 'Security alerts are always delivered — other categories can be tailored to your workflow.',
    hasFooterActions: true,
    actions: {
      primary: { label: 'Save preferences', icon: Save, target: 'notification-save-btn', type: 'button' },
      help: { label: 'Help', message: 'Toggle email, push, and in-app alerts per category. Preferences sync across your devices.' },
    },
  },
  {
    value: 'sessions',
    label: 'Sessions',
    heading: 'Active sessions',
    icon: Smartphone,
    description: 'Review devices currently signed in to your account.',
    supportingText: 'Sign out of unfamiliar sessions immediately to keep your account secure.',
    actions: {
      help: { label: 'Help', message: 'Each session shows the device, location, and last activity. Revoke any session you do not recognize.' },
    },
  },
  {
    value: 'appearance',
    label: 'Appearance',
    heading: 'Appearance & accessibility',
    icon: Palette,
    description: 'Adjust theme, typography, and motion to match your comfort.',
    supportingText: 'Display settings apply instantly and are stored on this device.',
    actions: {
      help: { label: 'Help', message: 'Theme and accessibility options are saved locally in your browser for a consistent experience.' },
    },
  },
  {
    value: 'data',
    label: 'Data & privacy',
    heading: 'Data & privacy',
    icon: Download,
    description: 'Export your records or manage account deactivation.',
    supportingText: 'You own your data — download a portable copy or request account closure at any time.',
    hasFooterActions: true,
    actions: {
      primary: { label: 'Export data', icon: Download, target: 'data-export-btn', type: 'button' },
      help: { label: 'Help', message: 'Exports include profile, chama, contribution, loan, and investment records in JSON format.' },
    },
  },
  {
    value: 'limits',
    label: 'Transaction limits',
    heading: 'Transaction limits',
    icon: Gauge,
    description: 'View operational thresholds and spending caps on your account.',
    supportingText: 'Limits help protect your chama and personal finances from unexpected activity.',
    actions: {
      help: { label: 'Help', message: 'Transaction limits are set by your chama administrators and platform policies.' },
    },
  },
];

function getVerificationSummary(profile) {
  const checks = [
    { key: 'email', verified: !!profile?.email_verified, label: 'Email' },
    { key: 'phone', verified: !!profile?.phone_verified, label: 'Phone' },
    {
      key: 'id',
      verified: profile?.id_verification_status === 'verified',
      pending: profile?.id_verification_status === 'pending',
      label: 'Identity',
    },
  ];

  const verifiedCount = checks.filter((c) => c.verified).length;
  const pendingCount = checks.filter((c) => c.pending).length;

  if (verifiedCount === checks.length) {
    return { status: 'healthy', label: 'Fully verified', detail: 'All identity checks complete', verifiedCount, total: checks.length };
  }
  if (pendingCount > 0) {
    return { status: 'pending', label: 'Verification in progress', detail: `${pendingCount} check${pendingCount > 1 ? 's' : ''} awaiting review`, verifiedCount, total: checks.length };
  }
  return {
    status: 'attention',
    label: 'Action recommended',
    detail: `${checks.length - verifiedCount} verification${checks.length - verifiedCount > 1 ? 's' : ''} incomplete`,
    verifiedCount,
    total: checks.length,
  };
}

function AccountHealthCard({ profile, onNavigate }) {
  const health = useMemo(() => getVerificationSummary(profile), [profile]);
  const statusStyles = {
    healthy: 'border-success/30 bg-success/5 text-success',
    pending: 'border-sand bg-sand-light/60 text-slate',
    attention: 'border-alert/30 bg-alert/5 text-alert',
  };

  return (
    <div className="rounded-3xl border border-sand/40 bg-white shadow-subtle overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`rounded-2xl p-2.5 ${statusStyles[health.status]}`}>
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Account health</p>
            <h2 className="mt-1 text-lg font-semibold text-slate">{health.label}</h2>
            <p className="mt-1 text-sm text-gray-500">{health.detail}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <div className="rounded-2xl border border-sand/40 bg-sand-light/50 px-4 py-2.5 text-center min-w-[88px]">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Verified</p>
            <p className="text-lg font-bold text-slate">{health.verifiedCount}/{health.total}</p>
          </div>
          {profile?.trust_score > 0 && (
            <div className="rounded-2xl border border-terracotta/20 bg-terracotta/5 px-4 py-2.5 text-center min-w-[88px]">
              <p className="text-[10px] uppercase tracking-wider text-terracotta/70 font-semibold">Trust score</p>
              <p className="text-lg font-bold text-terracotta">{profile.trust_score}</p>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigate('profile')}
            className="border-sand hover:bg-sand-light text-slate h-9 rounded-xl text-xs font-semibold"
          >
            Review verification
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-px border-t border-sand/30 bg-sand/20 sm:grid-cols-3">
        {[
          { label: 'Email', verified: !!profile?.email_verified },
          { label: 'Phone', verified: !!profile?.phone_verified },
          {
            label: 'Identity',
            verified: profile?.id_verification_status === 'verified',
            pending: profile?.id_verification_status === 'pending',
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 bg-white px-4 py-3">
            {item.verified ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            ) : item.pending ? (
              <AlertCircle className="h-4 w-4 text-slate shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-alert shrink-0" />
            )}
            <div>
              <p className="text-xs font-semibold text-slate">{item.label}</p>
              <p className="text-[11px] text-gray-400">
                {item.verified ? 'Verified' : item.pending ? 'Pending review' : 'Not verified'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarNav({ sections, activeTab, onSelect, className = '' }) {
  return (
    <nav className={`space-y-1.5 ${className}`} aria-label="Profile sections">
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeTab === section.value;
        return (
          <button
            key={section.value}
            type="button"
            onClick={() => onSelect(section.value)}
            aria-current={isActive ? 'page' : undefined}
            className={`w-full rounded-2xl border px-3.5 py-3.5 text-left transition-all ${
              isActive
                ? 'border-terracotta/30 bg-white shadow-subtle ring-1 ring-terracotta/10'
                : 'border-transparent bg-sand-light/60 hover:border-sand/40 hover:bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 rounded-xl p-2 ${
                  isActive ? 'bg-terracotta/10 text-terracotta' : 'bg-sand/70 text-slate'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold truncate ${isActive ? 'text-slate' : 'text-gray-700'}`}>
                    {section.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-terracotta shrink-0">Active</span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{section.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

function SectionToolbar({ section, onNavigate }) {
  const { actions } = section;
  if (!actions) return null;

  const runAction = (action) => {
    if (action.section) {
      onNavigate(action.section);
      return;
    }
    if (action.message) {
      toast.info(action.message);
      return;
    }
    if (action.event) {
      window.dispatchEvent(new CustomEvent(action.event));
      return;
    }
    if (action.target) {
      const el = document.getElementById(action.target);
      if (action.type === 'submit' && el?.requestSubmit) {
        el.requestSubmit();
      } else {
        el?.click();
      }
    }
  };

  const toolbarButtons = [
    actions.primary && { ...actions.primary, variant: 'default' },
    actions.secondary && { ...actions.secondary, variant: 'outline' },
    actions.manage && { ...actions.manage, variant: 'outline' },
    actions.help && { ...actions.help, variant: 'ghost' },
  ].filter(Boolean);

  if (toolbarButtons.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {toolbarButtons.map((action) => {
        const Icon = action.icon || (action.message ? HelpCircle : null);
        const isPrimary = action.variant === 'default';
        return (
          <Button
            key={action.label}
            type="button"
            size="sm"
            variant={action.variant}
            onClick={() => runAction(action)}
            className={
              isPrimary
                ? 'bg-terracotta hover:bg-terracotta-dark text-white h-9 rounded-xl text-xs font-semibold shadow-subtle'
                : action.variant === 'ghost'
                  ? 'text-gray-500 hover:text-slate h-9 rounded-xl text-xs font-semibold'
                  : 'border-sand hover:bg-sand-light text-slate h-9 rounded-xl text-xs font-semibold'
            }
          >
            {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

function ActionFooter({ section }) {
  if (!section.hasFooterActions || !section.actions) return null;

  const { primary, secondary } = section.actions;

  const runAction = (action) => {
    if (action?.event) {
      window.dispatchEvent(new CustomEvent(action.event));
      return;
    }
    if (action?.target) {
      const el = document.getElementById(action.target);
      if (action.type === 'submit' && el?.requestSubmit) {
        el.requestSubmit();
      } else {
        el?.click();
      }
    }
  };

  return (
    <div className="sticky bottom-0 z-20 -mx-6 -mb-6 mt-8 border-t border-sand/40 bg-white/95 px-6 py-4 backdrop-blur-md supports-backdrop-filter:bg-white/80">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          {section.value === 'profile' && 'Unsaved changes will be lost if you navigate away without saving.'}
          {section.value === 'notifications' && 'Your notification choices apply to all signed-in devices.'}
          {section.value === 'data' && 'Exports are generated on demand and may take a few seconds.'}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {secondary && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => runAction(secondary)}
              className="border-sand hover:bg-sand-light text-slate h-10 rounded-xl text-xs font-semibold px-4"
            >
              {secondary.icon && <secondary.icon className="mr-1.5 h-4 w-4" />}
              {secondary.label}
            </Button>
          )}
          {primary && (
            <Button
              type="button"
              size="sm"
              onClick={() => runAction(primary)}
              className="bg-terracotta hover:bg-terracotta-dark text-white h-10 rounded-xl text-xs font-semibold px-5 shadow-subtle"
            >
              {primary.icon && <primary.icon className="mr-1.5 h-4 w-4" />}
              {primary.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage({ defaultTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const activeSection = SECTIONS.find((section) => section.value === activeTab) || SECTIONS[0];

  const handleNavigate = (value) => {
    setActiveTab(value);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Profile Header */}
      <div className="border-b border-sand/30 bg-gradient-to-b from-sand-light/40 to-transparent px-4 py-6 text-center">
        <div className="relative mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-sand-light ring-4 ring-sand/30 shadow-subtle">
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile?.full_name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-terracotta/60" />
          )}
        </div>
        <h1 className="text-xl font-bold text-slate">
          {profile?.full_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}
        </h1>
        <p className="mt-0.5 text-xs font-medium text-gray-400">{profile?.email}</p>
        {profile?.membership_status && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {profile.membership_status} member
          </p>
        )}
      </div>

      {/* Mobile section picker */}
      <div className="sticky top-14 z-30 border-b border-sand/40 bg-white/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileNavOpen(true)}
          className="w-full justify-between border-sand bg-white h-11 rounded-2xl text-sm font-semibold text-slate shadow-subtle"
        >
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-terracotta" />
            {activeSection.label}
          </span>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Button>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[min(100vw,320px)] border-sand bg-white p-0">
          <SheetHeader className="border-b border-sand/30 px-5 py-4 text-left">
            <SheetTitle className="text-base font-semibold text-slate">Account settings</SheetTitle>
            <SheetDescription className="text-xs text-gray-500">
              Jump to any profile section
            </SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto p-3">
            <SidebarNav sections={SECTIONS} activeTab={activeTab} onSelect={handleNavigate} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-6 px-4 pt-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        {/* Desktop sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[4.75rem] max-h-[calc(100vh-5.5rem)] space-y-4 overflow-y-auto overscroll-contain pr-1">
            <div className="rounded-3xl border border-sand/40 bg-white shadow-subtle overflow-hidden">
              <div className="border-b border-sand/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Account settings</p>
                <h2 className="mt-2 text-lg font-semibold text-slate">Profile navigation</h2>
                <p className="mt-1 text-xs text-gray-500">Select a section to manage your account.</p>
              </div>
              <div className="p-3">
                <SidebarNav sections={SECTIONS} activeTab={activeTab} onSelect={handleNavigate} />
              </div>
            </div>

            <div className="rounded-3xl border border-sand/40 bg-white shadow-subtle p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Quick insights</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-sand-light/80 p-4">
                  <p className="text-xs text-gray-500">Membership</p>
                  <p className="mt-1 text-sm font-semibold text-slate">{profile?.membership_status || 'Standard'}</p>
                </div>
                <div className="rounded-2xl bg-sand-light/80 p-4">
                  <p className="text-xs text-gray-500">Last active</p>
                  <p className="mt-1 text-sm font-semibold text-slate">
                    {profile?.last_login ? new Date(profile.last_login).toLocaleString() : 'Not available'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-5">
          <AccountHealthCard profile={profile} onNavigate={handleNavigate} />

          <div className="rounded-3xl border border-sand/40 bg-white shadow-subtle">
            {/* Section header with toolbar */}
            <div className="border-b border-sand/30 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">
                    {activeSection.label}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate">{activeSection.heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">{activeSection.supportingText}</p>
                </div>
                <SectionToolbar section={activeSection} onNavigate={handleNavigate} />
              </div>
            </div>

            {/* Section content */}
            <div className="space-y-6 px-6 py-6">
              {activeSection.value === 'profile' && (
                <>
                  <UserProfileScore />
                  <VerificationStatus profile={profile} />
                  <EditProfileForm profile={profile} />
                </>
              )}

              {activeSection.value === 'security' && (
                <>
                  <ConnectedAccounts profile={profile} />
                  <SecuritySettings profile={profile} />
                </>
              )}

              {activeSection.value === 'notifications' && <NotificationPreferences />}

              {activeSection.value === 'sessions' && <SessionManager />}

              {activeSection.value === 'appearance' && <AppearanceSettings />}

              {activeSection.value === 'data' && (
                <>
                  <DataExport />
                  <AccountDeactivation />
                </>
              )}

              {activeSection.value === 'limits' && <TransactionLimits />}
            </div>

            <ActionFooter section={activeSection} />
          </div>
        </main>
      </div>
    </div>
  );
}
