import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { ResourceFile } from '../../data/resourcesMock';
import { FileTypeIcon } from './resourceShared';

const PAGE_SIZE_OPTIONS = [10, 20, 30];

interface ResourceDocumentsListProps {
  files: ResourceFile[];
  editable?: boolean;
  onChange?: (files: ResourceFile[]) => void;
}

export function ResourceDocumentsList({ files, editable = false, onChange }: ResourceDocumentsListProps) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageFiles = filtered.slice(start, start + pageSize);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(files.map((f) => f.id));
      const next = new Set([...prev].filter((id) => valid.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [files]);

  const canEdit = editable && !!onChange;

  const removeFiles = (ids: Set<string>) => {
    if (!onChange || ids.size === 0) return;
    const count = ids.size;
    onChange(files.filter((f) => !ids.has(f.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(
      count === 1 ? 'Document removed' : `${count} documents removed`,
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = pageFiles.map((f) => f.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const pageIds = pageFiles.map((f) => f.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someOnPageSelected = pageIds.some((id) => selectedIds.has(id));

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Documents
        </p>
        <span className="text-sm text-muted-foreground">{files.length} files</span>
      </div>

      {canEdit && selectedIds.size > 0 && (
        <div className="mb-4 px-4 py-3 bg-muted/50 border border-border rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground font-medium">
            {selectedIds.size} file{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => removeFiles(selectedIds)}
              className="px-3 py-1.5 bg-destructive hover:bg-destructive-text text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              Remove selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          size={16}
        />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {canEdit && pageFiles.length > 0 && (
        <div className="flex items-center gap-3 pb-2 mb-1 border-b border-border">
          <input
            type="checkbox"
            checked={allOnPageSelected}
            ref={(el) => {
              if (el) el.indeterminate = someOnPageSelected && !allOnPageSelected;
            }}
            onChange={toggleSelectAllOnPage}
            className="w-4 h-4 rounded border-border-muted text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
            aria-label="Select all documents on this page"
          />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select all on page
          </span>
        </div>
      )}

      <div className="divide-y divide-border">
        {pageFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 py-3 hover:bg-muted/40 transition-colors -mx-2 px-2 rounded-lg"
          >
            {canEdit && (
              <input
                type="checkbox"
                checked={selectedIds.has(file.id)}
                onChange={() => toggleSelect(file.id)}
                className="w-4 h-4 shrink-0 rounded border-border-muted text-primary focus:ring-2 focus:ring-ring/20 cursor-pointer"
                aria-label={`Select ${file.name}`}
              />
            )}
            <FileTypeIcon type={file.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {file.size} · Uploaded {file.uploadedAt}
              </p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={() => removeFiles(new Set([file.id]))}
                className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive-text hover:bg-destructive-subtle rounded-lg transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        {pageFiles.length === 0 && (
          <p className="py-6 text-sm text-muted-foreground text-center">No documents found</p>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPageSizeMenu((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 border border-border rounded-md text-sm bg-card hover:bg-muted"
              >
                {pageSize}
                <ChevronDown size={14} />
              </button>
              {showPageSizeMenu && (
                <div className="absolute z-10 bottom-full mb-1 bg-card border border-border rounded-lg shadow-lg py-1">
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setPageSize(n);
                        setPage(1);
                        setShowPageSizeMenu(false);
                      }}
                      className="block w-full px-4 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span>per page</span>
            <span className="hidden sm:inline mx-2">·</span>
            <span>
              {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {editable && (
        <div className="mt-6 border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer">
          <p className="text-sm text-foreground mb-1">
            <span className="text-primary font-medium">Click to Upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">Max file size: 25 MB</p>
        </div>
      )}
    </div>
  );
}
