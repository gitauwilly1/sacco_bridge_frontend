import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Home, Users, ArrowLeftRight, Activity, User,
  Menu, X, LogOut, Settings, HelpCircle,
  Shield, ChevronDown,
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

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-alert text-white text-center text-sm py-1.5 font-medium">
          You are offline. Changes will sync when connected.
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-lg font-bold text-terracotta font-heading">
              Sacco Bridge
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="hidden sm:flex rounded-lg bg-gray-100 p-0.5">
              <button
                onClick={() => setActiveMode('chama')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'chama'
                    ? 'bg-white text-terracotta shadow-sm'
                    : 'text-gray-500 hover:text-slate'
                }`}
              >
                My Chama
              </button>
              <button
                onClick={() => setActiveMode('investments')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'investments'
                    ? 'bg-white text-terracotta shadow-sm'
                    : 'text-gray-500 hover:text-slate'
                }`}
              >
                Investments
              </button>
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-100">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profile_picture} />
                    <AvatarFallback className="bg-terracotta text-white text-xs">
                      {getInitials(user?.first_name, user?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.full_name || user?.email}</span>
                    <span className="text-xs text-gray-500 font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/security' })}>
                  <Shield className="mr-2 h-4 w-4" /> Security
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/help' })}>
                  <HelpCircle className="mr-2 h-4 w-4" /> Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-danger">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 lg:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white lg:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate({ to: item.path })}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-1"
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="text-[11px] text-gray-400">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-terracotta">Menu</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {/* Mode toggle for mobile */}
              <div className="flex rounded-lg bg-gray-100 p-0.5 mb-4">
                <button
                  onClick={() => setActiveMode('chama')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'chama'
                      ? 'bg-white text-terracotta shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  My Chama
                </button>
                <button
                  onClick={() => setActiveMode('investments')}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeMode === 'investments'
                      ? 'bg-white text-terracotta shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Investments
                </button>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate({ to: item.path });
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-100"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}