import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Globe, Library, X } from 'lucide-react';
import { iconButtonSmClass, outlineControlClass } from '../../../components/ui/interaction';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { cn } from '../../../components/ui/utils';
import type { ReportResourcePool, ReportSource, ReportSourceKind } from './reportSources';

type SourceTab = 'all' | ReportSourceKind;

const TAB_LABEL: Record<SourceTab, string> = {
  all: 'All',
  document: 'Documents',
  web: 'Web',
};

const HOVER_LABEL = 'Sources used to create this report';

function SourceRowBody({ source, number }: { source: ReportSource; number: number }) {
  const canOpen = source.access === 'open';

  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          canOpen ? 'bg-primary-subtle' : 'bg-muted',
        )}
      >
        {source.kind === 'web' ? (
          <Globe size={16} className={canOpen ? 'text-primary' : 'text-muted-foreground'} />
        ) : (
          <FileText size={16} className={canOpen ? 'text-primary' : 'text-muted-foreground'} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs font-semibold leading-none text-primary">Source {number}</div>
        <h3 className="text-base font-semibold leading-snug break-words text-foreground">{source.title}</h3>
        {source.date ? <p className="mt-1 text-xs text-text-subtle">{source.date}</p> : null}
        {source.access === 'deleted' ? (
          <p className="mt-2 text-sm italic leading-relaxed text-muted-foreground">
            Original document deleted — only its indexed content remains.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ReportSourcesDrawer({
  sources,
  onClose,
  onOpenResource,
}: {
  sources: ReportSource[];
  onClose: () => void;
  onOpenResource?: (resourceId: string, pool: ReportResourcePool) => void;
}) {
  const [tab, setTab] = useState<SourceTab>('all');

  const availableTabs = useMemo(() => {
    const kinds = new Set(sources.map((source) => source.kind));
    const tabs: SourceTab[] = ['all'];
    if (kinds.has('document')) tabs.push('document');
    if (kinds.has('web')) tabs.push('web');
    return tabs.length > 2 ? tabs : [];
  }, [sources]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const visible = tab === 'all' ? sources : sources.filter((source) => source.kind === tab);

  const openResource = (source: ReportSource) => {
    if (source.access !== 'open' || !source.resourceId || !source.pool || !onOpenResource) return;
    onOpenResource(source.resourceId, source.pool);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  // Portal to body so the drawer escapes the report header. That header keeps a
  // translateY from its load animation, which would otherwise trap this fixed
  // layer inside the breadcrumb strip (dark bar, panel clipped underneath).
  return createPortal(
    <div className="fixed inset-0 z-[1600]">
      <button
        type="button"
        aria-label="Close sources"
        className="absolute inset-0 z-[1600] bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-sources-title"
        className="absolute top-0 right-0 z-[1610] flex h-full w-full flex-col border-l border-border bg-card shadow-2xl sm:w-[420px]"
      >
        <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-5 sm:px-6 sm:py-6">
          <div
            className={cn(
              'flex items-start justify-between gap-3',
              availableTabs.length > 0 && 'mb-4',
            )}
          >
            <div className="min-w-0 flex-1">
              <h2 id="report-sources-title" className="mb-1 text-xl font-semibold text-foreground">
                Sources
              </h2>
              <p className="text-sm text-muted-foreground">
                {sources.length === 0
                  ? 'No sources were added to this report'
                  : 'Documents that supported this report'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(iconButtonSmClass, 'size-8 border border-transparent hover:border-border')}
            >
              <X size={18} />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {availableTabs.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-secondary p-0.5">
              {availableTabs.map((item) => {
                const count =
                  item === 'all' ? sources.length : sources.filter((source) => source.kind === item).length;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    className={cn(
                      'flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3',
                      tab === item
                        ? 'bg-card text-foreground'
                        : 'text-text-subtle hover:text-muted-foreground',
                    )}
                  >
                    {TAB_LABEL[item]} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-auto px-4 py-5 sm:px-6 sm:py-6">
          {visible.length === 0 ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Documents used to create this report will show up here.
            </p>
          ) : (
            visible.map((source) => {
              const number = sources.findIndex((item) => item.id === source.id) + 1;
              const canOpen = source.access === 'open' && Boolean(source.resourceId && source.pool && onOpenResource);
              if (!canOpen) {
                return (
                  <div key={source.id} className="px-2 py-2">
                    <SourceRowBody source={source} number={number} />
                  </div>
                );
              }
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => openResource(source)}
                  aria-label={`Open ${source.resourceTitle}`}
                  className="-mx-2 block w-full rounded-xl px-2 py-2 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <SourceRowBody source={source} number={number} />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

interface ReportSourcesButtonProps {
  sources: ReportSource[];
  className?: string;
  onOpenResource?: (resourceId: string, pool: ReportResourcePool) => void;
}

/** Report-level sources control. Hover explains the pill; click opens the documents that built the report. */
export function ReportSourcesButton({ sources, className, onOpenResource }: ReportSourcesButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip delayDuration={400}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={HOVER_LABEL}
            className={cn(
              outlineControlClass,
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-foreground',
              className,
            )}
          >
            <Library size={13} className="shrink-0" />
            Sources
            <span className="text-text-subtle">{sources.length}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          variant="muted"
          side="bottom"
          sideOffset={8}
          className="z-[1700] max-w-[240px] text-left whitespace-normal"
        >
          {HOVER_LABEL}
        </TooltipContent>
      </Tooltip>
      {open ? (
        <ReportSourcesDrawer
          sources={sources}
          onClose={() => setOpen(false)}
          onOpenResource={onOpenResource}
        />
      ) : null}
    </>
  );
}
