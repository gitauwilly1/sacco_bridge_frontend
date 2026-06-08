import { useMode } from '@/contexts/ModeContext';
import { Users, TrendingUp } from 'lucide-react';

export default function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div className="flex bg-sand-100 rounded-full p-0.5">
      <button
        onClick={() => setMode('chama')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === 'chama'
            ? 'bg-white text-terracotta-700 shadow-subtle'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Chama</span>
      </button>
      <button
        onClick={() => setMode('invest')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          mode === 'invest'
            ? 'bg-white text-slate-700 shadow-subtle'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <TrendingUp className="w-4 h-4" />
        <span className="hidden sm:inline">Invest</span>
      </button>
    </div>
  );
}