import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Search,
  MoreVertical,
  Trash2,
  Download,
  Upload,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ResourceFile, ResourceFileType } from '../../data/resourcesMock';
import {
  DETAIL_FILES_TABLE_GRID,
  DetailSectionTitle,
  PlatformFileStatusCell,
} from './resourceShared';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const;

function inferFileType(name: string): ResourceFileType {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (ext === 'xlsx' || ext === 'xls') return 'XLSX';
  if (ext === 'pptx' || ext === 'ppt') return 'PPTX';
  return 'OTHER';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResourceDocumentsListProps {
  files: ResourceFile[];
  editable?: boolean;
  onChange?: (files: ResourceFile[]) => void;
}

export function ResourceDocumentsList({
  files,
  editable = false,
  onChange,
}: ResourceDocumentsListProps) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageFiles = filtered.slice(start, start + pageSize);
  const showingEnd = Math.min(start + pageSize, filtered.length);

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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllOnPage = (checked: boolean) => {
    const pageIds = pageFiles.map((f) => f.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        pageIds.forEach((id) => next.add(id));
      } else {
        pageIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const handleDownload = (ids: string[]) => {
    if (ids.length === 0) return;
    toast.success(
      ids.length === 1 ? 'Download started' : `Downloading ${ids.length} files`,
    );
    setOpenMenuId(null);
  };

  const handleReEmbed = (ids: string[]) => {
    if (ids.length === 0) return;
    toast.success(
      ids.length === 1 ? 'Re-embedding file...' : `Re-embedding ${ids.length} files...`,
    );
    setOpenMenuId(null);
  };

  const promptDeleteFiles = (ids: string[]) => {
    if (ids.length === 0) return;
    setOpenMenuId(null);
    setPendingDeleteIds(ids);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteFiles = () => {
    if (pendingDeleteIds.length === 0) return;
    const deleteSet = new Set(pendingDeleteIds);
    const updated = files.filter((f) => !deleteSet.has(f.id));
    onChange?.(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pendingDeleteIds.forEach((id) => next.delete(id));
      return next;
    });
    setShowDeleteConfirm(false);
    setPendingDeleteIds([]);
    toast.success(
      pendingDeleteIds.length === 1 ? 'File deleted' : `${pendingDeleteIds.length} files deleted`,
    );
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    const now = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newFiles: ResourceFile[] = selected.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: inferFileType(file.name),
      uploadedAt: now,
    }));

    onChange([...files, ...newFiles]);
    e.target.value = '';
    toast.success(
      newFiles.length === 1 ? 'File added' : `${newFiles.length} files added`,
    );
  };

  const allOnPageSelected =
    pageFiles.length > 0 && pageFiles.every((f) => selectedIds.has(f.id));

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <DetailSectionTitle className="mb-0">Files</DetailSectionTitle>
        <span className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          size={18}
        />
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {pageFiles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={(e) => handleSelectAllOnPage(e.target.checked)}
              className="w-4 h-4 rounded border-checkbox-unchecked text-primary focus:ring-ring"
            />
            Select all on this page
          </label>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary-foreground">
                {selectedIds.size} selected
              </span>
              {!canEdit && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDownload(Array.from(selectedIds))}
                    className="px-3 py-1.5 text-sm border border-primary text-primary-text bg-primary-subtle rounded-lg hover:bg-sidebar-accent transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReEmbed(Array.from(selectedIds))}
                    className="px-3 py-1.5 text-sm border border-border-muted text-secondary-foreground rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCcw size={14} />
                    Re-embed
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => promptDeleteFiles(Array.from(selectedIds))}
                className="px-3 py-1.5 text-sm border border-destructive text-destructive-text bg-destructive-subtle rounded-lg hover:bg-destructive-subtle transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {pageFiles.length > 0 ? (
        <div className="border-t border-border overflow-x-auto">
          <div className="min-w-[min(100%,720px)]">
            <div
              className={`${DETAIL_FILES_TABLE_GRID} min-h-10 py-2 border-b border-border table-header-label bg-muted/70`}
              role="row"
            >
              <div className="flex items-center justify-center">
                <div className="h-4 w-4 shrink-0" aria-hidden />
              </div>
              <div className="min-w-0" role="columnheader">
                Document
              </div>
              <div className="min-w-0" role="columnheader">
                Status
              </div>
              <div className="flex min-w-0 items-center justify-end pr-0.5" role="columnheader">
                Actions
              </div>
            </div>
            <div className="divide-y divide-border">
              {pageFiles.map((file) => (
                <div
                  key={file.id}
                  className={`${DETAIL_FILES_TABLE_GRID} table-row-entity bg-card transition-colors`}
                  role="row"
                >
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="h-4 w-4 shrink-0 rounded border-checkbox-unchecked text-primary focus:ring-ring"
                      aria-label={`Select ${file.name}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="table-primary-text truncate">{file.name}</p>
                    <p className="table-supporting-text mt-0.5">
                      {file.size} · Uploaded {file.uploadedAt}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <PlatformFileStatusCell file={file} />
                  </div>
                  <div className="relative flex items-center justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === file.id ? null : file.id);
                      }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary"
                      aria-expanded={openMenuId === file.id}
                      aria-haspopup="menu"
                      aria-label={`Actions for ${file.name}`}
                      title="Actions"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === file.id && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10"
                          aria-label="Close menu"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-1 z-20 w-[200px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg shadow-black/10"
                        >
                          {!canEdit ? (
                            <>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleDownload([file.id])}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted first:pt-3"
                              >
                                <Download size={16} className="shrink-0 text-info" />
                                Download
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleReEmbed([file.id])}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                              >
                                <RefreshCcw size={16} className="shrink-0 text-secondary-foreground" />
                                Re-embed
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => promptDeleteFiles([file.id])}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 pb-3 text-left text-sm text-destructive-text transition-colors hover:bg-destructive-subtle"
                              >
                                <Trash2 size={16} className="shrink-0 text-destructive-text" />
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => promptDeleteFiles([file.id])}
                              className="flex w-full items-center gap-2.5 px-4 py-2.5 pb-3 text-left text-sm text-destructive-text transition-colors hover:bg-destructive-subtle"
                            >
                              <Trash2 size={16} className="shrink-0 text-destructive-text" />
                              Delete
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {files.length === 0
            ? canEdit
              ? 'No files yet. Upload files below.'
              : 'No files found'
            : 'No files found'}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 border border-border rounded-lg text-foreground bg-card focus:outline-none focus:border-primary"
            >
              {PAGE_SIZE_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <span>per page</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {filtered.length > 0 ? `${start + 1}-${showingEnd} of ${filtered.length}` : '0 of 0'}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded-lg text-sm ${
                currentPage === 1
                  ? 'text-border-muted cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">{currentPage}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-lg text-sm ${
                currentPage === totalPages
                  ? 'text-border-muted cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1500] p-4">
          <div className="bg-card rounded-xl max-w-[460px] w-full shadow-2xl">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Delete file{pendingDeleteIds.length > 1 ? 's' : ''}?
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pendingDeleteIds.length > 1
                  ? `Are you sure you want to delete ${pendingDeleteIds.length} files? This action cannot be undone.`
                  : 'Are you sure you want to delete this file? This action cannot be undone.'}
              </p>
            </div>
            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPendingDeleteIds([]);
                }}
                className="px-4 py-2.5 border border-border hover:bg-muted rounded-lg text-sm font-medium text-muted-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFiles}
                className="px-4 py-2.5 bg-destructive hover:opacity-90 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {canEdit && (
        <div className="mt-5 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="platform-resource-file-upload"
            accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx"
            multiple
          />
          <label
            htmlFor="platform-resource-file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload size={28} className="text-text-subtle mb-2" />
            <span className="text-sm font-medium text-primary">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-text-subtle mt-1">
              PDF, DOC, DOCX, TXT, XLSX (max 25MB)
            </span>
          </label>
        </div>
      )}
    </div>
  );

}
