import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorState } from '@/components/feedback';

export default function DataTable({
  columns,
  data = [],
  isLoading,
  error,
  onRetry,
  totalCount = 0,
  page = 1,
  onPageChange,
  pageSize = 15,
  searchValue = '',
  onSearch,
  emptyMessage = 'No results found',
  onRowClick,
  rowActions,
  searchable = true,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Local sorting if requested
  const processedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];

    if (valA == null) return 1;
    if (valB == null) return -1;

    if (typeof valA === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="skeleton-shimmer h-10 w-full max-w-md rounded-xl" />
        )}
        <div className="border border-sand bg-white rounded-2xl overflow-hidden shadow-subtle">
          <div className="bg-sand-light/50 p-4 border-b border-sand/30 flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-shimmer h-4 w-1/4 rounded" />
            ))}
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between gap-4 py-1.5">
                <div className="skeleton-shimmer h-4.5 w-1/3 rounded" />
                <div className="skeleton-shimmer h-4.5 w-1/4 rounded" />
                <div className="skeleton-shimmer h-4.5 w-1/5 rounded" />
                <div className="skeleton-shimmer h-4.5 w-12 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message="Failed to load platform data" onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Header */}
      {searchable && onSearch && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate/50" />
          <Input
            placeholder="Search records..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 border-input rounded-xl bg-white text-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 shadow-none"
          />
        </div>
      )}

      {/* Grid Container */}
      <div className="border border-sand bg-white rounded-2xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sand-light/50 border-b border-sand/40">
                {columns.map((col) => (
                  <th
                    key={col.key || col.header}
                    className="p-3.5 text-[10px] font-extrabold text-slate uppercase tracking-wider text-left"
                    style={{ width: col.width }}
                  >
                    {col.sortable ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center gap-1 hover:text-terracotta transition-colors cursor-pointer"
                      >
                        <span>{col.header}</span>
                        {sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-3 w-3 text-terracotta" />
                          ) : (
                            <ChevronDown className="h-3 w-3 text-terracotta" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-slate/30" />
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                ))}
                {rowActions && (
                  <th className="p-3.5 text-[10px] font-extrabold text-slate uppercase tracking-wider text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {processedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (rowActions ? 1 : 0)}
                    className="p-8 text-center text-xs text-gray-400 font-medium"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                processedData.map((row, rIndex) => (
                  <tr
                    key={row.id || rIndex}
                    className={`hover:bg-sand-light/20 transition-all border-b border-sand/30 last:border-0 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key || col.header}
                        className="p-3.5 text-xs text-slate font-medium"
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="p-3.5 text-right text-xs">
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-[11px] text-gray-400 font-medium">
            Showing page <span className="font-bold text-slate">{page}</span> of <span className="font-bold text-slate">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="border-sand hover:bg-sand-light text-slate text-xs font-semibold h-8 rounded-lg cursor-pointer transition-all"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="border-sand hover:bg-sand-light text-slate text-xs font-semibold h-8 rounded-lg cursor-pointer transition-all"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
