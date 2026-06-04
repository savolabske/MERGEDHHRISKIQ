import { useEffect } from 'react';
import {
  ArrowUpRight,
  Clock,
  Eye,
  FileSpreadsheet,
  FileText,
  Link2,
  TrendingUp,
  X,
} from 'lucide-react';
import type { HubTrendingDocument } from '../../data/homeDashboardMock';

const RESOURCE_TYPE_META = {
  document: {
    label: 'Document',
    Icon: FileText,
    iconBg: 'bg-destructive-subtle',
    iconColor: 'text-destructive-text',
  },
  health: {
    label: 'Health & Nutrition Document',
    Icon: FileText,
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success-text',
  },
  web: {
    label: 'Web Resource',
    Icon: Link2,
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
  },
  datasheet: {
    label: 'Data Sheet',
    Icon: FileSpreadsheet,
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success-text',
  },
  coordination: {
    label: 'Coordination Document',
    Icon: FileText,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-700',
  },
} as const;

interface TrendingThisWeekDrawerProps {
  open: boolean;
  onClose: () => void;
  documents: readonly HubTrendingDocument[];
  onOpenDocument?: (documentId: string) => void;
}

export function TrendingThisWeekDrawer({
  open,
  onClose,
  documents,
  onOpenDocument,
}: TrendingThisWeekDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleOpen = (id: string) => {
    onClose();
    onOpenDocument?.(id);
  };

  return (
    <div className="fixed inset-0 z-[1400] flex justify-end">
      <button
        type="button"
        aria-label="Close trending resources"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-labelledby="trending-drawer-title"
        className="relative flex h-full w-full max-w-[480px] flex-col border-l border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="shrink-0 border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <TrendingUp size={20} strokeWidth={2.25} aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id="trending-drawer-title"
                className="text-lg font-bold text-foreground"
              >
                Trending This Week
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {documents.length} resources
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={18} strokeWidth={2.25} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {documents.map((doc) => {
            const meta = RESOURCE_TYPE_META[doc.resourceType];
            const TypeIcon = meta.Icon;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => handleOpen(doc.id)}
                className="group w-full text-left rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.iconBg}`}
                  >
                    <TypeIcon size={18} className={meta.iconColor} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <ArrowUpRight
                        size={14}
                        className="shrink-0 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100 mt-0.5"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {meta.label}
                      <span className="mx-1.5 text-border-muted">•</span>
                      {doc.category}
                    </p>
                    <p className="text-xs text-text-subtle mt-2 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={12} strokeWidth={2.25} aria-hidden />
                        {doc.views}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} strokeWidth={2.25} aria-hidden />
                        {doc.openedAt}
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
