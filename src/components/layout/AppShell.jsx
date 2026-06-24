import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Home, Users, ArrowLeftRight, Activity, User,
  Menu, X, LogOut, Settings, HelpCircle,
  Shield, ChevronDown, WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useAuthStore from '../../stores/authStore';
import useUIStore from '../../stores/uiStore';
import { getInitials } from '../../utils/format';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import BridgeLogo from '../brand/BridgeLogo';
import Footer from './Footer';

const navItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'chamas', label: 'Chamas', icon: Users, path: '/chamas' },
  { id: 'investments', label: 'Invest', icon: ArrowLeftRight, path: '/investments' },
  { id: 'activity', label: 'Activity', icon: Activity, path: '/activity' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];



export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { activeMode, setActiveMode, isOnline } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  const handleNavClick = (path) => {
    navigate({ to: path });
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* ── Offline Banner ──────────────────────────────────────────── */}
      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-alert text-white text-center text-xs py-2 font-medium">
          <WifiOff className="h-3.5 w-3.5 animate-pulse-amber" />
          You are offline. Changes will sync when connected.
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-sand bg-white/80 backdrop-blur-lg">
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

          {/* Center: Mode toggle (hidden on mobile, moved to sidebar) */}
          <div className="hidden sm:flex rounded-full bg-sand p-1 shadow-subtle">
            <button
              id="mode-chama-btn"
              onClick={() => setActiveMode('chama')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeMode === 'chama'
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'text-slate hover:text-terracotta'
              }`}
            >
              My Chama
            </button>
            <button
              id="mode-investments-btn"
              onClick={() => setActiveMode('investments')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeMode === 'investments'
                  ? 'bg-terracotta text-white shadow-sm'
                  : 'text-slate hover:text-terracotta'
              }`}
            >
              Investments
            </button>
          </div>

          {/* Right: notifications + avatar dropdown */}
          <div className="flex items-center gap-1.5">
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="user-menu-btn"
                  className="flex items-center gap-1.5 rounded-full p-1 hover:bg-sand-light transition-colors ring-2 ring-transparent hover:ring-sand focus-visible:ring-terracotta"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-sand">
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback className="bg-terracotta text-white text-xs font-semibold">
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
                <DropdownMenuItem onClick={() => navigate({ to: '/settings' })} className="gap-2.5 cursor-pointer">
                  <Settings className="h-4 w-4 text-gray-400" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/security' })} className="gap-2.5 cursor-pointer">
                  <Shield className="h-4 w-4 text-gray-400" /> Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/help' })} className="gap-2.5 cursor-pointer">
                  <HelpCircle className="h-4 w-4 text-gray-400" /> Help
                </DropdownMenuItem>
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

      {/* ── Main Content ────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      <div className="pb-16 lg:pb-0">
        <Footer />
      </div>

      {/* ── Mobile Bottom Navigation ────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-sand bg-white/90 backdrop-blur-lg lg:hidden">
        <div className="flex h-16 items-center justify-around px-1">
          {navItems.map((item) => {
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.path;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
                onClick={() => navigate({ to: item.path })}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                {/* Active indicator dot */}
                <div className={`h-1 w-4 rounded-full mb-0.5 transition-all duration-200 ${
                  isActive ? 'bg-terracotta' : 'bg-transparent'
                }`} />
                <item.icon
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-terracotta' : 'text-gray-400'
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-terracotta' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile Sidebar Overlay ──────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-dark/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-elevated flex flex-col animate-slide-right">
            {/* Drawer header — branded gradient */}
            <div
              className="flex items-center justify-between p-4 pt-5"
              style={{ background: 'linear-gradient(135deg, #C67B5C 0%, #8B4513 100%)' }}
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
                  onClick={() => setActiveMode('chama')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeMode === 'chama'
                      ? 'bg-terracotta text-white shadow-sm'
                      : 'text-slate'
                  }`}
                >
                  My Chama
                </button>
                <button
                  onClick={() => setActiveMode('investments')}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeMode === 'investments'
                      ? 'bg-terracotta text-white shadow-sm'
                      : 'text-slate'
                  }`}
                >
                  Investments
                </button>
              </div>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-sand-light text-terracotta border-l-2 border-terracotta pl-[10px]'
                        : 'text-slate hover:bg-sand-light hover:text-slate'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-terracotta' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Drawer footer */}
            <div className="p-3 border-t border-sand">
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
    </div>
  );
}