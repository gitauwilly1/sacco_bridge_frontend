import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SearchInput from '@/components/ui/SearchInput';
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
  sortKey: controlledSortKey,
  sortOrder: controlledSortOrder,
  onSort,
  selectable,
  selectedIds,
  onSelectionChange,
  bulkActionBar,
}) {
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortOrder, setInternalSortOrder] = useState('asc');
  const selectAllRef = useRef(null);

  const isControlled = controlledSortKey !== undefined || onSort;
  const activeSortKey = isControlled ? controlledSortKey : internalSortKey;
  const activeSortOrder = isControlled ? (controlledSortOrder || 'asc') : internalSortOrder;

  const handleSort = (key) => {
    let newOrder;
    if (activeSortKey === key) {
      newOrder = activeSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      newOrder = 'asc';
    }
    if (isControlled) {
      onSort?.(key, newOrder);
    } else {
      setInternalSortKey(key);
      setInternalSortOrder(newOrder);
    }
  };

  const processedData = [...data].sort((a, b) => {
    if (!activeSortKey) return 0;
    const valA = a[activeSortKey];
    const valB = b[activeSortKey];
    if (valA == null) return 1;
    if (valB == null) return -1;
    if (typeof valA === 'string') {
      return activeSortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    return activeSortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const ids = selectable && onSelectionChange ? (selectedIds || new Set()) : null;
  const pageIds = selectable ? processedData.map((r) => r.id).filter(Boolean) : [];
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => ids?.has(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        ids && pageIds.some((id) => ids.has(id)) && !allPageSelected;
    }
  }, [ids, pageIds, allPageSelected]);

  const toggleSelect = (id) => {
    if (!ids || !onSelectionChange) return;
    const next = new Set(ids);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allPageSelected) {
      const next = new Set(ids);
      pageIds.forEach((id) => next.delete(id));
      onSelectionChange(next);
    } else {
      const next = new Set(ids || []);
      pageIds.forEach((id) => next.add(id));
      onSelectionChange(next);
    }
  };

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

  const colspan = columns.length + (rowActions ? 1 : 0) + (selectable ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Header */}
      {searchable && onSearch && (
        <SearchInput
          value={searchValue}
          onChange={onSearch}
          placeholder="Search records..."
          className="max-w-md"
        />
      )}

      {/* Bulk Action Bar */}
      {selectable && ids && ids.size > 0 && bulkActionBar && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-terracotta/5 border border-terracotta/20 rounded-xl">
          <span className="text-xs font-bold text-terracotta">
            {ids.size} selected
          </span>
          {typeof bulkActionBar === 'function' ? bulkActionBar(ids) : bulkActionBar}
        </div>
      )}

      {/* Grid Container */}
      <div className="border border-sand bg-white rounded-2xl shadow-subtle overflow-hidden">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sand-light/50 border-b border-sand/40">
                {selectable && (
                  <th className="p-3.5 w-10">
                    <Checkbox
                      ref={selectAllRef}
                      checked={allPageSelected}
                      onCheckedChange={toggleSelectAll}
                      className="border-slate/30 data-[state=checked]:bg-terracotta data-[state=checked]:border-terracotta"
                    />
                  </th>
                )}
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
                        {activeSortKey === col.key ? (
                          activeSortOrder === 'asc' ? (
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
                  <td colSpan={colspan} className="p-8 text-center text-xs text-gray-400 font-medium">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                processedData.map((row, rIndex) => {
                  const rowId = row.id;
                  return (
                    <tr
                      key={rowId || rIndex}
                      className={`hover:bg-sand-light/20 transition-all border-b border-sand/30 last:border-0 ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="p-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={ids?.has(rowId) || false}
                            onCheckedChange={() => toggleSelect(rowId)}
                            className="border-slate/30 data-[state=checked]:bg-terracotta data-[state=checked]:border-terracotta"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key || col.header} className="p-3.5 text-xs text-slate font-medium">
                          {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                        </td>
                      ))}
                      {rowActions && (
                        <td className="p-3.5 text-right text-xs" onClick={(e) => e.stopPropagation()}>
                          {rowActions(row)}
                        </td>
                      )}
                    </tr>
                  );
                })
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
              size="sm" variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="border-sand hover:bg-sand-light text-slate text-xs font-semibold h-8 rounded-lg cursor-pointer transition-all"
            >
              Previous
            </Button>
            <Button
              size="sm" variant="outline"
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
