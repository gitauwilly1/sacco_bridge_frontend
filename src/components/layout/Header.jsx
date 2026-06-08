import { useMode } from '@/contexts/ModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import ModeToggle from '@/components/layout/ModeToggle';

export default function Header() {
  const { user } = useAuth();
  const { mode } = useMode();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-sand-200 safe-top">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-500 to-clay-700 flex items-center justify-center">
            <span className="text-white font-heading font-bold text-sm">SB</span>
          </div>
          <ModeToggle />
        </div>
        <div className="flex items-center gap-3">
          <Link to="/notifications" className="relative p-1.5 rounded-full hover:bg-sand-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
          </Link>
          <Link to="/profile" className="p-0.5 rounded-full border-2 border-transparent hover:border-terracotta-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-terracotta-100 flex items-center justify-center">
              <span className="text-terracotta-700 font-heading font-semibold text-sm">
                {user?.initials || 'U'}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}