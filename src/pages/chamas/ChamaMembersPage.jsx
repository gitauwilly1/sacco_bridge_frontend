import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ChamaMembersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chama-members', id],
    queryFn: async () => {
      const { data } = await api.get(`/chamas/${id}/members/`);
      return data.data || data;
    },
    enabled: !!id,
  });

  const members = Array.isArray(data) ? data : data?.results || [];

  const filteredMembers = members.filter((m) =>
    m.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h2 className="text-lg font-heading font-semibold text-slate-800">Members</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all"
        />
      </div>

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && (
        <div className="space-y-1">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-subtle"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">
                  {member.user_initials || member.user_name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{member.user_name}</p>
                <p className="text-xs text-slate-500">{member.role_display || member.role}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-numbers font-medium text-slate-700">
                  KSh {parseInt(member.total_contributions || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">contributed</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}