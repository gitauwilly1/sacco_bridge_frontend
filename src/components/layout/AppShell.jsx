import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatbotApi } from '@/features/chatbot/api/chatbotApi';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  Home, Users, ArrowLeftRight, Activity, User,
  Menu, X, LogOut, Settings, HelpCircle,
  Shield, ChevronDown, WifiOff, Bot, Plus, MessageSquare,
  HandCoins, Building2, Wallet, LayoutGrid,
  ChevronLeft, ChevronRight,
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
import useFocusTrap from '../../hooks/useFocusTrap';
const ChatScreen = lazy(() => import('@/features/chatbot/components/ChatScreen'));

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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const v = localStorage.getItem('sb_sidebar_collapsed');
      return v ? JSON.parse(v) : false;
    } catch (e) {
      return false;
    }
  });
  const { user, logout } = useAuthStore();
  const { activeMode, setActiveMode, isOnline } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryAction = usePrimaryAction(activeMode, navigate);
  const navItems = useNavItems(activeMode);

  const sidebarTrapRef = useFocusTrap(sidebarOpen);
  const chatTrapRef = useFocusTrap(chatMounted);

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

  // Chat sessions unread count
  const { data: sessionsData } = useQuery({
    queryKey: ['chatbot-unread-count'],
    queryFn: () => chatbotApi.getSessions({ page_size: 50 }).then((r) => r.data),
    refetchInterval: 30000,
    staleTime: 15000,
  });
  const sessionsList = sessionsData?.results || sessionsData?.data || [];
  const chatUnreadCount = Array.isArray(sessionsList) ? sessionsList.reduce((acc, s) => acc + (s.unread_count || 0), 0) : 0;

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
        <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 bg-alert text-white text-center text-xs py-2 font-medium">
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

      {/* ── Main + Desktop Sidebar ── */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col border-r border-sand/45 bg-slate-50 shadow-sm transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <div className="flex items-center justify-end p-3 border-b border-sand/40">
            <button
              onClick={() => setSidebarCollapsed((s) => !s)}
              className="hidden lg:inline-flex p-1 rounded-md hover:bg-sand-light transition-colors"
              aria-label="Toggle sidebar"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4 text-slate" /> : <ChevronLeft className="h-4 w-4 text-slate" />}
            </button>
          </div>
          <nav className="p-2 flex-1 overflow-y-auto space-y-1 scrollbar-none">
            {sidebarNav.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate({ to: item.path })}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active ? 'bg-sand-light text-terracotta' : 'text-slate hover:bg-sand-light/50'
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <item.icon className={`h-5 w-5 ${active ? 'text-terracotta' : 'text-gray-400'}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main id="main-content" className="flex-1 pb-20 lg:pb-0 overflow-auto">
          {children}
        </main>
      </div>

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
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[52px] py-1 transition-all duration-200 ${
                  active ? 'scale-105 bg-slate-100 rounded-lg px-3 py-2' : 'rounded-xl'
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
        <div ref={sidebarTrapRef} className="fixed inset-0 z-40 lg:hidden">
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
                const activeBg = activeMode === 'investments' ? 'bg-slate-100 text-slate border-slate-200' : 'bg-sand-light text-terracotta border-terracotta';
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 transition-all duration-150 text-sm font-medium ${
                      active
                        ? `${activeBg} border-l-2 pl-[10px] rounded-lg shadow-sm`
                        : 'text-slate hover:bg-sand-light hover:text-slate rounded-lg'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? (activeMode === 'investments' ? 'text-slate' : 'text-terracotta') : 'text-gray-400'}`} />
                    <span className="ml-1">{item.label}</span>
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
      {!chatOpen && (
        <button
          id="chat-fab"
          onClick={() => {
            setChatOpen(true);
            setChatMounted(true);
          }}
          className="fixed right-4 z-[60] h-12 w-12 flex items-center justify-center rounded-full bg-terracotta hover:bg-clay text-white shadow-elevated transition-all hover:scale-105 active:scale-95 cursor-pointer bottom-28 sm:bottom-6"
          aria-label="Open chat"
          title="Open chat"
        >
          <MessageSquare className="h-6 w-6" />
          {/* Unread badge */}
          {chatUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-danger text-white text-[11px] font-bold">{chatUnreadCount > 99 ? '99+' : chatUnreadCount}</span>
          )}
        </button>
      )}

      {/* Chat Slide-over */}
      {chatMounted && (
        <div ref={chatTrapRef} className="fixed inset-0 z-50">
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${chatVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setChatOpen(false)}
          />
          <div className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white shadow-elevated transform transition-all duration-300 ${chatVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 border-b border-sand/40">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-terracotta" />
                  <h3 className="text-sm font-bold text-slate">Chat Assistant</h3>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-sand-light transition-colors">
                  <X className="h-5 w-5 text-slate" />
                </button>
              </div>
              <div className="h-[calc(100vh-64px)] overflow-hidden flex-1">
                <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="skeleton-shimmer h-8 w-8 rounded-full" /></div>}>
                  <ChatScreen />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* manage mount/visibility for animation */}
      {/** Toggle visibility when chatOpen changes **/}
      {chatMounted && (
        <ChatMountEffect chatOpen={chatOpen} setChatVisible={setChatVisible} setChatMounted={setChatMounted} />
      )}
    </div>
  );
}

function ChatMountEffect({ chatOpen, setChatVisible, setChatMounted }) {
  useEffect(() => {
    let t1;
    let t2;
    if (chatOpen) {
      // small delay to ensure element is mounted before making it visible
      t1 = setTimeout(() => setChatVisible(true), 20);
    } else {
      // hide then unmount after transition
      setChatVisible(false);
      t2 = setTimeout(() => setChatMounted(false), 320);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [chatOpen, setChatMounted, setChatVisible]);

  return null;
}