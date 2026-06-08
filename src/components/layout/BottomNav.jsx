import { NavLink, useLocation } from 'react-router-dom';
import { useMode } from '@/contexts/ModeContext';
import { Home, Users, TrendingUp, PlusCircle, Clock, User } from 'lucide-react';

export default function BottomNav() {
  const { mode } = useMode();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) =>
    `flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors duration-200 ${
      isActive(path)
        ? 'text-terracotta-600'
        : 'text-slate-400 hover:text-slate-600'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-sand-200 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        <NavLink to="/" className={linkClass('/')}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        <NavLink
          to={mode === 'chama' ? '/chamas' : '/saccos'}
          className={linkClass(mode === 'chama' ? '/chamas' : '/saccos')}
        >
          {mode === 'chama' ? (
            <Users className="w-5 h-5" />
          ) : (
            <TrendingUp className="w-5 h-5" />
          )}
          <span className="text-[10px] font-medium">
            {mode === 'chama' ? 'Groups' : 'Market'}
          </span>
        </NavLink>

        <NavLink
          to={mode === 'chama' ? '/contribute' : '/opportunities'}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-all duration-200 -mt-5 ${
            isActive(mode === 'chama' ? '/contribute' : '/opportunities')
              ? 'text-white'
              : 'text-white'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta-500 to-clay-700 flex items-center justify-center shadow-terracotta">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {mode === 'chama' ? 'Contribute' : 'Invest'}
          </span>
        </NavLink>

        <NavLink to="/activity" className={linkClass('/activity')}>
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium">Activity</span>
        </NavLink>

        <NavLink to="/profile" className={linkClass('/profile')}>
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}