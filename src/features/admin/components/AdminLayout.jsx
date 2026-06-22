import { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard, Users, Building2, HandCoins, AlertCircle,
  Shield, Lock, FileText, Webhook, BookOpen, BarChart3,
  ChevronLeft, ChevronRight, Menu, X, Search, ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '../../../stores/authStore';

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
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-sand/45">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5.5 w-5.5 text-terracotta" />
            <span className="font-extrabold text-slate text-xs uppercase tracking-wider">Admin Panel</span>
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
        {navItems.map((item) => {
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
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-sand-light border border-sand/30 flex items-center justify-center flex-shrink-0 shadow-subtle">
              <span className="text-xs font-bold text-terracotta font-heading">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <Badge className="bg-terracotta/10 text-terracotta border border-terracotta/20 text-[9px] font-extrabold rounded-full px-2 py-0.5 shadow-none mt-0.5 select-none uppercase">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-sand/45 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-sand/40 px-4 py-3.5 flex items-center gap-3 shadow-sm">
          <button
            className="lg:hidden p-1.5 hover:bg-sand-light rounded-lg transition-colors cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5 text-slate" />
          </button>
          <div className="flex-1" />
          <Badge className="bg-terracotta/10 text-terracotta border border-terracotta/20 text-[10px] font-extrabold rounded-full px-2.5 py-0.5 shadow-none">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Admin Mode
          </Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}