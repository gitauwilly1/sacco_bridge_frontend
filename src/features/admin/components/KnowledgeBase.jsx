import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';
import DataTable from './DataTable';

export default function KnowledgeBase() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const {
    data: articlesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-knowledge', page, search, status],
    queryFn: () =>
      adminApi
        .getKnowledgeArticles({
          page,
          page_size: 15,
          ...(search && { search }),
          ...(status !== 'all' && { status }),
        })
        .then((r) => r.data),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, publish }) =>
      adminApi.updateKnowledgeArticle(id, { is_published: publish }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] });
      toast.success('Article updated');
    },
    onError: (error) => toast.error(error.response?.data?.error?.message || 'Failed'),
  });

  const articles = articlesData?.results || articlesData?.data || [];
  const total = articlesData?.pagination?.count ?? articlesData?.count ?? articles.length;

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate text-sm">{row.title}</p>
          <p className="text-xs text-gray-400 truncate max-w-[300px]">{row.summary || row.content}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (value) => <span className="text-sm font-semibold text-slate/75">{value || 'General'}</span>,
    },
    {
      key: 'is_published',
      header: 'Status',
      render: (value) => (
        <Badge
          className={value ? 'bg-success/10 text-success border border-success/20' : 'bg-sand text-slate border border-sand-dark/20'}
          variant="outline"
        >
          {value ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      header: 'Updated',
      render: (value) => <span className="text-xs text-gray-500 font-medium">{formatDate(value)}</span>,
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-2 justify-end">
      {row.is_published ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert hover:text-alert/80 hover:bg-alert/5 transition-all rounded-lg font-semibold"
          onClick={() => togglePublish.mutate({ id: row.id, publish: false })}
        >
          <XCircle className="h-3 w-3 mr-1" /> Unpublish
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="text-success hover:text-success/80 hover:bg-success/5 transition-all rounded-lg font-semibold"
          onClick={() => togglePublish.mutate({ id: row.id, publish: true })}
        >
          <CheckCircle2 className="h-3 w-3 mr-1" /> Publish
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate">Knowledge Base</h1>
          <p className="text-sm text-gray-500">{total} articles</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="text-xs border border-sand bg-white/90 hover:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta rounded-lg px-2.5 py-1.5 text-slate font-medium shadow-subtle transition-all cursor-pointer"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => refetch()}
            className="border-sand hover:bg-sand-light text-slate transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate/75" />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={articles}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        totalCount={total}
        page={page}
        onPageChange={setPage}
        pageSize={15}
        searchValue={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        emptyMessage="No articles found"
        rowActions={rowActions}
      />
    </div>
  );
}