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
  const total = articlesData?.count || articles.length;

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate text-sm">{row.title}</p>
          <p className="text-xs text-gray-500 truncate max-w-[300px]">{row.summary || row.content}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (value) => <span className="text-sm text-gray-600">{value || 'General'}</span>,
    },
    {
      key: 'is_published',
      header: 'Status',
      render: (value) => (
        <Badge
          className={value ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-600'}
          variant="outline"
        >
          {value ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'updated_at',
      header: 'Updated',
      render: (value) => <span className="text-xs text-gray-500">{formatDate(value)}</span>,
    },
  ];

  const rowActions = (row) => (
    <div className="flex items-center gap-1 justify-end">
      {row.is_published ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-alert"
          onClick={() => togglePublish.mutate({ id: row.id, publish: false })}
        >
          <XCircle className="h-3 w-3 mr-1" /> Unpublish
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="text-success"
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
            className="text-xs border rounded-md px-2 py-1.5 bg-white"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3" />
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