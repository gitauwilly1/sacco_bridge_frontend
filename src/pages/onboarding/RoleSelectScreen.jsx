import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Wallet, TrendingUp, Building2 } from 'lucide-react';

export default function RoleSelectScreen() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const roles = [
    {
      id: 'CHAMA_MEMBER',
      icon: Users,
      title: 'I belong to a Chama',
      description: 'Track contributions, loans, and meetings with your group.',
      color: 'bg-terracotta-50 text-terracotta-600 border-terracotta-200',
      activeColor: 'border-terracotta-500 bg-terracotta-50 ring-2 ring-terracotta-200',
    },
    {
      id: 'SELLER',
      icon: Wallet,
      title: 'I need liquidity',
      description: 'Sell your SACCO shares to verified buyers when you need cash.',
      color: 'bg-sand-50 text-clay-700 border-sand-200',
      activeColor: 'border-clay-500 bg-sand-50 ring-2 ring-sand-200',
    },
    {
      id: 'INVESTOR',
      icon: TrendingUp,
      title: 'I want to earn yield',
      description: 'Buy SACCO shares and earn dividends from cooperatives.',
      color: 'bg-slate-50 text-slate-600 border-slate-200',
      activeColor: 'border-slate-500 bg-slate-50 ring-2 ring-slate-200',
    },
    {
      id: 'INSTITUTIONAL',
      icon: Building2,
      title: 'I represent an institution',
      description: 'Deploy capital as a SACCO or investment group.',
      color: 'bg-success-50 text-success-700 border-success-200',
      activeColor: 'border-success-500 bg-success-50 ring-2 ring-success-200',
    },
  ];

  const toggleRole = (roleId) => {
    setSelected((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-slate-800 mb-2">
            What brings you here?
          </h1>
          <p className="text-sm text-slate-500">
            Select all that apply. You can change this later.
          </p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => {
            const isActive = selected.includes(role.id);
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive ? role.activeColor : `${role.color} border-transparent hover:border-sand-300`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-white' : 'bg-white/50'
                  }`}>
                    <role.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-slate-800 text-sm">
                      {role.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {role.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-terracotta-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="4 8 7 11 12 5" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate('/onboarding/terms')}
          disabled={selected.length === 0}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-xl shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
        >
          Continue
        </button>
      </div>

      <div className="px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Step 3 of 4
        </p>
      </div>
    </div>
  );
}