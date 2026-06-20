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
  const { user } = useAuthStore();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-terracotta" />
            <span className="font-bold text-slate text-sm">Admin Panel</span>
          </div>
        )}
        <button
          className="hidden lg:block"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
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
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-terracotta/10 text-terracotta font-medium'
                  : 'text-slate hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      {!collapsed && (
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-sand-light flex items-center justify-center">
              <span className="text-xs font-bold text-terracotta">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <Badge className="bg-terracotta/10 text-terracotta text-[10px]">
                Admin
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r bg-white transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full bg-white z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Badge className="bg-terracotta/10 text-terracotta">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Admin
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