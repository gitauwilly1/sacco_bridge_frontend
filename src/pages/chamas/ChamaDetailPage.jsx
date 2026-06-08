import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Wallet, Landmark, Calendar, Settings, ChevronRight, TrendingUp } from 'lucide-react';
import api from '@/lib/api.js';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ChamaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chama', id],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${id}/`);
      return data.data || data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="skeleton h-6 w-32" />
        <CardSkeleton />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
          <div className="skeleton h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const chama = data;

  const menuItems = [
    {
      icon: Users,
      label: 'Members',
      value: `${chama.member_count || 0} members`,
      path: `/chamas/${id}/members`,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: Wallet,
      label: 'Contributions',
      value: `KSh ${parseInt(chama.total_savings || 0).toLocaleString()}`,
      path: `/chamas/${id}/contributions`,
      color: 'text-success-600 bg-success-50',
    },
    {
      icon: Landmark,
      label: 'Loans',
      value: `${chama.outstanding_loans > 0 ? 'Active' : 'None'}`,
      path: `/chamas/${id}/loans`,
      color: 'text-alert-600 bg-alert-50',
    },
    {
      icon: Calendar,
      label: 'Meetings',
      value: 'View schedule',
      path: `/chamas/${id}/meetings`,
      color: 'text-terracotta-600 bg-terracotta-50',
    },
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-gradient-to-br from-terracotta-500 to-clay-700 rounded-xl p-5 text-white shadow-terracotta">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white font-heading font-bold text-lg">
              {chama.name?.charAt(0)?.toUpperCase() || 'C'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold">{chama.name}</h1>
            <p className="text-sand-200 text-xs">{chama.chama_type_display || 'Welfare Group'}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-sand-300 text-xs">Contribution</p>
            <p className="font-semibold text-sm">
              KSh {parseInt(chama.contribution_amount || 0)} / {chama.contribution_frequency_display || 'Week'}
            </p>
          </div>
          <div>
            <p className="text-sand-300 text-xs">Loan Rate</p>
            <p className="font-semibold text-sm">{chama.loan_interest_rate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-semibold text-slate-800 text-sm">
              {item.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{item.value}</p>
          </Link>
        ))}
      </div>

      {chama.description && (
        <div className="bg-white rounded-xl p-4 shadow-subtle">
          <h3 className="font-heading font-semibold text-slate-800 text-sm mb-2">
            About
          </h3>
          <p className="text-sm text-slate-600">{chama.description}</p>
        </div>
      )}

      <Link
        to={`/chamas/${id}/settings`}
        className="flex items-center justify-between bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-500" />
          </div>
          <span className="font-heading font-semibold text-slate-800 text-sm">
            Chama Settings
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </Link>
    </div>
  );
}