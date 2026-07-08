import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from '@tanstack/react-router';
import BridgeLogo from '@/components/brand/BridgeLogo';
import {
  Bell, LayoutDashboard, Users, Building2, HandCoins, AlertCircle,
  Shield, Lock, FileText, Webhook, BookOpen, BarChart3,
  ChevronLeft, ChevronRight, Menu, X, ShieldCheck, Trash2, User,
  LogOut, Settings, TrendingUp, Scale, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import useAuthStore from '../../../stores/authStore';
import useUIStore from '../../../stores/uiStore';
import { isSupportAgent, RESTRICTED_ADMIN_ROUTES } from '../../../utils/permissions';
import { adminApi } from '../api/adminApi';
import useFocusTrap from '../../../hooks/useFocusTrap';
import { WifiOff } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/saccos', label: 'SACCOs', icon: Building2 },
  { to: '/admin/chamas', label: 'Chamas', icon: HandCoins },
  { to: '/admin/disputes', label: 'Disputes', icon: AlertCircle },
  { to: '/admin/fraud', label: 'Fraud', icon: Shield },
  { to: '/admin/escrow', label: 'Escrow', icon: Lock },
  { to: '/admin/audit', label: 'Audit', icon: FileText },
  { to: '/admin/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/admin/legal', label: 'Legal', icon: BookOpen },
  { to: '/admin/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { to: '/admin/underwriting', label: 'Underwriting', icon: Scale },
  { to: '/admin/settlements', label: 'Settlements', icon: HandCoins },
  { to: '/admin/volume', label: 'Volume', icon: TrendingUp },
  { to: '/admin/deletion-requests', label: 'Deletions', icon: Trash2 },
  { to: '/admin/approvals', label: 'Approvals', icon: CheckCircle2 },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { isOnline } = useUIStore();
  const isSupportAgentRole = isSupportAgent(user);

  const visibleNavItems = navItems.filter(
    (item) => !isSupportAgentRole || !RESTRICTED_ADMIN_ROUTES.includes(item.to)
  );

  const mobileTrapRef = useFocusTrap(mobileOpen);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <BridgeLogo size={24} className="text-terracotta" />
            <div>
              <p className="font-extrabold text-slate text-xs uppercase tracking-wider">Admin Panel</p>
              <p className="text-[10px] text-gray-500">Platform controls</p>
            </div>
          </div>
        )}
        <button
          className="hidden lg:block p-1 hover:bg-sand-light rounded-lg cursor-pointer transition-colors text-slate/60 hover:text-terracotta"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4.5 w-4.5" />
          ) : (
            <ChevronLeft className="h-4.5 w-4.5" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-none">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => {
                navigate({ to: item.to });
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all text-xs font-bold cursor-pointer border-l-2 ${
                isActive
                  ? 'bg-sand-light text-terracotta border-terracotta rounded-r-xl rounded-l-none'
                  : 'text-slate hover:bg-sand-light/50 hover:text-slate border-transparent rounded-lg'
              } ${collapsed ? 'justify-center px-2 border-l-0' : ''}`}
            >
              <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${isActive ? 'text-terracotta' : 'text-slate/65'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-3.5 border-t border-sand/40">
          <button
            onClick={() => navigate({ to: '/profile' })}
            className="flex items-center gap-2.5 w-full cursor-pointer hover:bg-sand-light/50 rounded-lg p-1.5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
              <User className="h-4 w-4 text-terracotta/60" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-slate truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <Badge className="bg-terracotta/10 text-terracotta border border-terracotta/20 text-[9px] font-extrabold rounded-full px-2 py-0.5 shadow-none mt-0.5 select-none uppercase">
                Admin
              </Badge>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-surface">
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div role="status" aria-live="polite" className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-alert text-white text-center text-xs py-2 font-medium">
          <WifiOff className="h-3.5 w-3.5 animate-pulse-amber" />
          You are offline. Changes will sync when connected.
        </div>
      )}
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 bg-slate-50 shadow-[0_0_0_1px_rgba(148,163,184,0.12),0_10px_30px_-12px_rgba(15,23,42,0.12)] transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div ref={mobileTrapRef} className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full bg-white z-10 border-r border-sand/45">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-header px-4 py-3.5 flex items-center gap-3">
          <button
            className="lg:hidden p-1.5 hover:bg-sand-light rounded-lg transition-colors cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5 text-slate" />
          </button>

          {/* Search removed — each page has its own search via DataTable */}

          <div className="flex-1 sm:flex-none" />

          {/* Admin Notification Bell */}
          <AdminNotificationBell navigate={navigate} />

          {/* Admin badge */}
          <Badge className="bg-terracotta/10 text-terracotta border border-terracotta/20 text-[10px] font-extrabold rounded-full px-2.5 py-0.5 shadow-none">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Admin Mode
          </Badge>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 hover:bg-sand-light rounded-lg transition-colors cursor-pointer">
                <div className="h-7 w-7 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center shadow-subtle">
                  <User className="h-3.5 w-3.5 text-terracotta/60" />
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate max-w-24 truncate">
                  {user?.first_name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate({ to: '/profile' })} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/profile/appearance' })} className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <div className="border-t border-sand/40 my-1" />
              <DropdownMenuItem
                onClick={async () => {
                  await useAuthStore.getState().logout();
                  navigate({ to: '/login' });
                }}
                className="cursor-pointer text-danger hover:text-danger"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNotificationBell({ navigate }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-notification-summary'],
    queryFn: () => adminApi.getAdminNotificationSummary().then(r => r.data?.data),
    refetchInterval: 30000,
  });

  const total = data?.total || 0;
  const items = [
    { label: 'SACCOs pending verification', count: data?.pending_saccos || 0, to: '/admin/saccos', icon: Building2 },
    { label: 'Open disputes', count: data?.open_disputes || 0, to: '/admin/disputes', icon: AlertCircle },
    { label: 'Deletion requests', count: data?.pending_deletions || 0, to: '/admin/deletion-requests', icon: Trash2 },
    { label: 'Unreviewed fraud', count: data?.unreviewed_fraud || 0, to: '/admin/fraud', icon: Shield },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-1.5 hover:bg-sand-light rounded-lg transition-colors cursor-pointer">
          <Bell className={`h-5 w-5 ${total > 0 ? 'text-terracotta' : 'text-slate/60'}`} />
          {total > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-danger text-white text-[9px] font-bold px-1 shadow">
              {total > 9 ? '9+' : total}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <p className="text-xs font-bold text-slate px-2 py-1.5 border-b border-sand/40 mb-1">Pending Actions</p>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.to}
            onClick={() => navigate({ to: item.to })}
            className="flex items-center justify-between cursor-pointer py-2"
          >
            <div className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-slate/60" />
              <span className="text-xs">{item.label}</span>
            </div>
            <Badge className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
              item.count > 0 ? 'bg-terracotta/10 text-terracotta' : 'bg-gray-100 text-gray-400'
            }`} variant="outline">
              {item.count}
            </Badge>
          </DropdownMenuItem>
        ))}
        {total === 0 && !isLoading && (
          <p className="text-xs text-gray-400 text-center py-3">All clear — no pending items</p>
        )}
        {isLoading && (
          <p className="text-xs text-gray-400 text-center py-3">Loading...</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
