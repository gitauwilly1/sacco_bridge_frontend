import { useAuth } from '@/contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { User, Shield, Bell, Globe, FileText, HelpCircle, LogOut, ChevronRight, Star } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', path: '/profile/edit' },
        { icon: Shield, label: 'Security', path: '/profile/security' },
        { icon: Bell, label: 'Notification Preferences', path: '/profile/preferences' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language', value: 'English' },
      ],
    },
    {
      title: 'Documents',
      items: [
        { icon: FileText, label: 'Terms of Service' },
        { icon: FileText, label: 'Privacy Policy' },
        { icon: FileText, label: 'Risk Disclosure' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center' },
        { icon: HelpCircle, label: 'Contact Support' },
      ],
    },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-white rounded-xl p-6 shadow-subtle text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center mx-auto mb-3">
          <span className="text-white font-heading font-bold text-xl">
            {user?.initials || 'U'}
          </span>
        </div>
        <h2 className="font-heading font-bold text-slate-800 text-lg">{user?.full_name || 'User'}</h2>
        <p className="text-sm text-slate-500">{user?.email}</p>
        {user?.trust_score && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="w-4 h-4 text-alert-500 fill-alert-500" />
            <span className="text-sm font-medium text-slate-700">{parseFloat(user.trust_score).toFixed(1)} Trust Score</span>
          </div>
        )}
      </div>

      {menuSections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1 mb-2">
            {section.title}
          </h3>
          <div className="bg-white rounded-xl shadow-subtle overflow-hidden">
            {section.items.map((item, i) => (
              <div
                key={i}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  i < section.items.length - 1 ? 'border-b border-sand-100' : ''
                } ${item.path ? 'cursor-pointer hover:bg-sand-50 transition-colors' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && <span className="text-xs text-slate-400">{item.value}</span>}
                  {item.path && <ChevronRight className="w-4 h-4 text-slate-300" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-error-600 font-medium text-sm border border-error-200 rounded-xl hover:bg-error-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}