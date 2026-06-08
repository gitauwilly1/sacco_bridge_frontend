import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api.js';
import { ListSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';
import EmptyState from '@/components/shared/EmptyState.jsx';

export default function ChamaListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['chamas'],
    queryFn: async () => {
      const { data } = await api.get('/chamas/');
      return data;
    },
  });

  const chamas = Array.isArray(data?.data)
    ? data.data
    : data?.data?.results || [];

  const filteredChamas = chamas.filter((chama) =>
    chama.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">
          My Chamas
        </h2>
        <button
          onClick={() => navigate('/chamas/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>

      {chamas.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chamas..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-sand-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-300 transition-all"
          />
        </div>
      )}

      {isLoading && <ListSkeleton rows={5} />}
      {isError && <ErrorState onRetry={refetch} />}

      {!isLoading && !isError && filteredChamas.length === 0 && (
        <EmptyState
          icon={<Users className="w-10 h-10 text-terracotta-500" />}
          title={search ? 'No chamas found' : 'No chamas yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Create or join a chama to start tracking your group savings.'
          }
          actionLabel={search ? undefined : 'Create Your First Chama'}
          onAction={search ? undefined : () => navigate('/chamas/new')}
        />
      )}

      {!isLoading && !isError && filteredChamas.length > 0 && (
        <div className="space-y-2">
          {filteredChamas.map((chama) => (
            <div
              key={chama.id}
              onClick={() => navigate(`/chamas/${chama.id}`)}
              className="bg-white rounded-xl p-4 shadow-subtle hover:shadow-medium transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-sm">
                      {chama.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-slate-800 text-sm">
                      {chama.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {chama.member_count || 0} members
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-xs text-slate-500">
                        {chama.contribution_frequency_display || chama.contribution_frequency || 'Weekly'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-numbers font-semibold text-slate-700 text-sm">
                      KSh {parseInt(chama.total_savings || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">total saved</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}