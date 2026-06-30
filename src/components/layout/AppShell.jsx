import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home, Users, ArrowLeftRight, Activity, User,
  Menu, X, LogOut, Settings, HelpCircle,
  Shield, ChevronDown, WifiOff, Bot, Plus,
  HandCoins, Building2, Wallet, LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';
import { isAdmin } from '../../utils/permissions';
import { getInitials } from '../../utils/format';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import BridgeLogo from '../brand/BridgeLogo';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

// ── Primary action FAB config (context-aware) ─────────────────────────────
function usePrimaryAction(activeMode, navigate) {
  if (activeMode === 'investments') {
    return {
      label: 'Sell Shares',
      icon: ArrowLeftRight,
      action: () => navigate({ to: '/investments/sell' }),
    };
  }
  return {
    label: 'Contribute',
    icon: Plus,
    action: () => navigate({ to: '/chamas' }),
  };
}

// ── Nav items — change second tab based on mode ───────────────────────────
function useNavItems(activeMode) {
  const secondTab = activeMode === 'investments'
    ? { id: 'investments', label: 'Invest', icon: ArrowLeftRight, path: '/investments' }
    : { id: 'chamas', label: 'Chamas', icon: Users, path: '/chamas' };

  return [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    secondTab,
    null, // placeholder for center FAB
    { id: 'activity', label: 'Activity', icon: Activity, path: '/activity' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ];
}

// ── Sidebar nav items (full list) ─────────────────────────────────────────
const sidebarNav = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'My Chamas', icon: Users, path: '/chamas' },
  { label: 'Investments', icon: ArrowLeftRight, path: '/investments' },
  { label: 'Browse SACCOs', icon: Building2, path: '/investments/saccos' },
  { label: 'My Holdings', icon: Wallet, path: '/investments/holdings' },
  { label: 'Opportunities', icon: LayoutGrid, path: '/investments/opportunities' },
  { label: 'Connections', icon: HandCoins, path: '/investments/connections' },
  { label: 'Activity', icon: Activity, path: '/activity' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { activeMode, setActiveMode, isOnline } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryAction = usePrimaryAction(activeMode, navigate);
  const navItems = useNavItems(activeMode);

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  const handleNavClick = (path) => {
    navigate({ to: path });
    setSidebarOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Context-aware FAB menu items
  const fabItems = activeMode === 'investments'
    ? [
        { label: 'Sell Shares', icon: ArrowLeftRight, path: '/investments/sell' },
        { label: 'Browse Opportunities', icon: Building2, path: '/investments/opportunities' },
        { label: 'My Holdings', icon: Wallet, path: '/investments/holdings' },
      ]
    : [
        { label: 'Record Contribution', icon: HandCoins, path: '/chamas' },
        { label: 'Apply for Loan', icon: Activity, path: '/chamas' },
        { label: 'Create Chama', icon: Plus, path: '/chamas/new' },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-surface dark:bg-surface">
      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-alert text-white text-center text-xs py-2 font-medium">
          <WifiOff className="h-3.5 w-3.5 animate-pulse-amber" />
          You are offline. Changes will sync when connected.
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 glass-header">
        <div className="flex h-14 items-center justify-between px-4">

          {/* Left: hamburger + wordmark */}
          <div className="flex items-center gap-2.5">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate hover:bg-sand-light transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 select-none group"
              aria-label="Sacco Bridge home"
            >
              <BridgeLogo size={22} />
              <span className="font-heading font-bold text-base text-slate tracking-tight hidden sm:inline">
                Sacco<span className="text-terracotta">Bridge</span>
              </span>
            </button>
          </div>

          {/* Center: Mode toggle */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <div className="rounded-full bg-sand p-1 shadow-subtle flex items-center">
              <button
                id="mode-chama-btn"
                onClick={() => { setActiveMode('chama'); navigate({ to: '/chamas' }); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeMode !== 'investments'
                    ? 'bg-terracotta text-white shadow-sm'
                    : 'text-slate hover:text-terracotta'
                }`}
              >
                My Chama
              </button>
              <button
                id="mode-investments-btn"
                onClick={() => { setActiveMode('investments'); navigate({ to: '/investments' }); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeMode === 'investments'
                    ? 'bg-slate text-white shadow-sm'
                    : 'text-slate hover:text-slate/70'
                }`}
              >
                Investments
              </button>
            </div>
            <div className="rounded-full bg-sand-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate">
              Active view: {activeMode === 'chama' ? 'My Chama' : 'Investments'}
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <button
              id="header-help-btn"
              onClick={() => navigate({ to: '/help' })}
              className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full text-slate hover:bg-sand-light transition-colors"
              aria-label="Help center"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="user-menu-btn"
                  className="flex items-center gap-1.5 rounded-full p-1 hover:bg-sand-light transition-colors ring-2 ring-transparent hover:ring-sand focus-visible:ring-terracotta"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-sand">
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback className={`text-white text-xs font-semibold ${activeMode === 'investments' ? 'bg-slate' : 'bg-terracotta'}`}>
                      {getInitials(user?.first_name, user?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-elevated border-sand">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2.5 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profile_picture} />
                      <AvatarFallback className="bg-terracotta text-white text-xs font-semibold">
                        {getInitials(user?.first_name, user?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate text-sm truncate">
                        {user?.full_name || user?.email}
                      </span>
                      <span className="text-xs text-gray-400 truncate font-normal">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })} className="gap-2.5 cursor-pointer">
                  <User className="h-4 w-4 text-gray-400" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/profile/appearance' })} className="gap-2.5 cursor-pointer">
                  <Settings className="h-4 w-4 text-gray-400" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/profile/security' })} className="gap-2.5 cursor-pointer">
                  <Shield className="h-4 w-4 text-gray-400" /> Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/legal/documents' })} className="gap-2.5 cursor-pointer">
                  <Shield className="h-4 w-4 text-gray-400" /> Legal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/help' })} className="gap-2.5 cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-gray-400" /> Help
                </DropdownMenuItem>
                {isAdmin(user) && (
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin' })} className="gap-2.5 cursor-pointer">
                    <Shield className="h-4 w-4 text-terracotta" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  id="logout-btn"
                  className="gap-2.5 cursor-pointer text-danger focus:text-danger focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-20 lg:pb-0">
        {children}
      </main>

      <div className="pb-16 lg:pb-0 hidden lg:block">
        <Footer />
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sand bg-white/90 backdrop-blur-lg lg:hidden dark:border-slate-700 dark:bg-slate-900/90">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item, i) => {
            if (item === null) {
              // Center FAB
              return (
                <div key="fab" className="relative">
                  <button
                    id="nav-fab-btn"
                    onClick={() => setFabOpen(!fabOpen)}
                    className={`flex h-14 w-14 -mt-6 items-center justify-center rounded-full shadow-elevated transition-all duration-200 active:scale-95 ${
                      activeMode === 'investments'
                        ? 'bg-slate hover:bg-slate/90'
                        : 'bg-terracotta hover:bg-clay'
                    }`}
                    aria-label="Primary action"
                  >
                    <Plus className={`h-6 w-6 text-white transition-transform duration-200 ${fabOpen ? 'rotate-45' : ''}`} />
                  </button>

                  {/* FAB menu */}
                  {fabOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setFabOpen(false)}
                      />
                      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 min-w-48">
                        {fabItems.map(({ label, icon: Icon, path }) => (
                          <button
                            key={path + label}
                            onClick={() => {
                              setFabOpen(false);
                              navigate({ to: path });
                            }}
                            className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-elevated border border-sand text-sm font-semibold text-slate hover:bg-sand-light transition-all whitespace-nowrap"
                          >
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeMode === 'investments' ? 'bg-slate/10' : 'bg-terracotta/10'}`}>
                              <Icon className={`h-4 w-4 ${activeMode === 'investments' ? 'text-slate' : 'text-terracotta'}`} />
                            </div>
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            }

            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                onClick={() => navigate({ to: item.path })}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 rounded-xl transition-all duration-200 ${
                  active ? 'scale-105' : ''
                }`}
              >
                <div className={`h-1 w-4 rounded-full mb-0.5 transition-all duration-200 ${
                  active
                    ? activeMode === 'investments' ? 'bg-slate' : 'bg-terracotta'
                    : 'bg-transparent'
                }`} />
                <item.icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    active
                      ? activeMode === 'investments' ? 'text-slate' : 'text-terracotta'
                      : 'text-gray-400'
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  active
                    ? activeMode === 'investments' ? 'text-slate' : 'text-terracotta'
                    : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-dark/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-elevated flex flex-col animate-slide-right dark:bg-slate-900">
            {/* Drawer header */}
            <div
              className="flex items-center justify-between p-4 pt-5"
              style={{
                background: activeMode === 'investments'
                  ? 'linear-gradient(135deg, #3D405B 0%, #2a2d40 100%)'
                  : 'linear-gradient(135deg, #C67B5C 0%, #8B4513 100%)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                  <BridgeLogo size={20} />
                </div>
                <div>
                  <p className="font-heading font-bold text-white text-sm">SaccoBridge</p>
                  <p className="text-white/70 text-xs">{user?.full_name || user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="p-3 border-b border-sand">
              <div className="flex rounded-full bg-sand p-1">
                <button
                  onClick={() => { setActiveMode('chama'); setSidebarOpen(false); navigate({ to: '/chamas' }); }}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeMode !== 'investments'
                      ? 'bg-terracotta text-white shadow-sm'
                      : 'text-slate'
                  }`}
                >
                  My Chama
                </button>
                <button
                  onClick={() => { setActiveMode('investments'); setSidebarOpen(false); navigate({ to: '/investments' }); }}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeMode === 'investments'
                      ? 'bg-slate text-white shadow-sm'
                      : 'text-slate'
                  }`}
                >
                  Investments
                </button>
              </div>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {sidebarNav.map((item) => {
                const active = isActive(item.path);
                const accentColor = activeMode === 'investments' ? 'text-slate border-slate bg-slate/5' : 'text-terracotta border-terracotta bg-sand-light';
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? `${accentColor} border-l-2 pl-[10px]`
                        : 'text-slate hover:bg-sand-light hover:text-slate'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? (activeMode === 'investments' ? 'text-slate' : 'text-terracotta') : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer footer */}
            <div className="p-3 border-t border-sand space-y-1">
              <button
                onClick={() => handleNavClick('/help')}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate hover:bg-sand-light transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-gray-400" />
                Help & Support
              </button>
              <div className="flex items-center justify-center py-2 border-t border-sand/40 mt-2 pt-2">
                <LanguageSwitcher />
              </div>
              <button
                id="sidebar-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop AI Assistant FAB ── */}
      <button
        id="ai-assistant-fab"
        onClick={() => navigate({ to: '/chat' })}
        className="hidden lg:flex fixed bottom-6 right-6 z-40 h-12 w-12 items-center justify-center rounded-full bg-terracotta hover:bg-clay text-white shadow-elevated transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>
    </div>
  );
}