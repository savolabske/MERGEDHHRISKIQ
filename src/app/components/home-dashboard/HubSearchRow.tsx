import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  File,
  FileText,
  GraduationCap,
  Lock,
  Search,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';
import {
  HUB_QUICK_ACTIONS,
  HUB_QUICK_ACTION_PANELS,
  HUB_TRENDING_DOCUMENTS,
  HUB_TRENDING_PREVIEW_COUNT,
  type HubQuickActionId,
} from '../../data/homeDashboardMock';
import type { AppView } from '../../types/navigation';
import { hubCard } from './hubStyles';
import { TrendingThisWeekDrawer } from './TrendingThisWeekDrawer';

const ACTION_ICONS = {
  reports: FileText,
  training: GraduationCap,
  security: Shield,
} as const;

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  let parent = element?.parentElement ?? null;
  while (parent) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function scrollPanelIntoView(panel: HTMLElement, padding = 24) {
  const scrollParent = getScrollParent(panel);

  if (!scrollParent) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  const panelRect = panel.getBoundingClientRect();
  const parentRect = scrollParent.getBoundingClientRect();
  const overflowBottom = panelRect.bottom - parentRect.bottom + padding;

  if (overflowBottom > 0) {
    scrollParent.scrollBy({ top: overflowBottom, behavior: 'smooth' });
  }
}

interface HubSearchRowProps {
  onSearch: (query: string) => void;
  onNavigate: (view: AppView) => void;
  onOpenDocument?: (documentId: string) => void;
}

export function HubSearchRow({ onSearch, onNavigate, onOpenDocument }: HubSearchRowProps) {
  const [query, setQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [activePanel, setActivePanel] = useState<HubQuickActionId | null>(null);
  const [trendingDrawerOpen, setTrendingDrawerOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const trendingPreview = HUB_TRENDING_DOCUMENTS.slice(0, HUB_TRENDING_PREVIEW_COUNT);
  const trendingTotal = HUB_TRENDING_DOCUMENTS.length;

  useEffect(() => {
    if (!activePanel) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      setActivePanel(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePanel(null);
    };

    const timer = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 0);

    document.addEventListener('keydown', handleEscape);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [activePanel]);

  useEffect(() => {
    if (!activePanel) return;

    const scroll = () => {
      if (panelRef.current) scrollPanelIntoView(panelRef.current);
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scroll);
    });

    const afterAnimation = window.setTimeout(scroll, 300);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(afterAnimation);
    };
  }, [activePanel]);

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  const toggleQuickActionPanel = (id: HubQuickActionId) => {
    setActivePanel((current) => (current === id ? null : id));
  };

  const handlePanelItemClick = (item: string) => {
    setQuery(item);
    setActivePanel(null);
    onSearch(item);
  };

  const activePanelData = activePanel ? HUB_QUICK_ACTION_PANELS[activePanel] : null;
  const ActivePanelIcon = activePanel ? ACTION_ICONS[activePanel] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className={`${hubCard} p-6 flex flex-col relative overflow-visible ${activePanel ? 'z-20' : ''}`}>
        <h2 className="text-base font-bold text-foreground">What do you need today?</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Access Somalia humanitarian data and reports instantly
        </p>

        {/* Tall prompt bar */}
        <div className="mt-5 rounded-2xl border border-border bg-background p-4 min-h-[132px] flex flex-col">
          <div className="flex items-start gap-2.5 flex-1 min-h-[52px]">
            <Search
              size={18}
              className="text-muted-foreground shrink-0 mt-0.5"
              aria-hidden
            />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitSearch();
                }
              }}
              rows={2}
              placeholder="Search displacement, rainfall, access routes, or ask anything…"
              className="flex-1 min-h-[44px] resize-none border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 mt-3 pt-1">
            <button
              type="button"
              onClick={() => setIsPrivate((prev) => !prev)}
              aria-pressed={isPrivate}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isPrivate
                  ? 'border-border bg-card text-muted-foreground hover:bg-muted/60'
                  : 'border-border/60 bg-transparent text-text-subtle hover:bg-muted/40'
              }`}
            >
              <Lock size={12} strokeWidth={2.25} aria-hidden />
              Private to me
            </button>
            <button
              type="button"
              onClick={submitSearch}
              disabled={!query.trim()}
              aria-label="Search"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight size={18} strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative mt-4 min-h-[42px]">
          {!activePanel && (
            <div className="flex flex-wrap gap-2">
              {HUB_QUICK_ACTIONS.map((action) => {
                const Icon = ACTION_ICONS[action.id];
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => toggleQuickActionPanel(action.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${action.pillClass}`}
                  >
                    <Icon size={14} style={{ color: action.iconColor }} strokeWidth={2.25} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}

          {activePanel && activePanelData && ActivePanelIcon && (
            <div
              ref={panelRef}
              role="dialog"
              aria-label={activePanelData.label}
              className="hub-quick-action-panel-enter absolute left-0 right-0 top-0 z-30 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ActivePanelIcon size={16} className="shrink-0 text-foreground" strokeWidth={2.25} />
                  <span className="text-sm font-semibold text-foreground">{activePanelData.label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  aria-label={`Close ${activePanelData.label}`}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X size={16} strokeWidth={2.25} />
                </button>
              </div>
              <ul>
                {activePanelData.items.map((item) => (
                  <li key={item} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => handlePanelItemClick(item)}
                      className="w-full px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className={`${hubCard} p-6 flex flex-col`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Popular this week</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Most opened in the last 7 days</p>
          </div>
          <button
            type="button"
            onClick={() => setTrendingDrawerOpen(true)}
            className="text-sm font-semibold text-primary hover:text-primary-text inline-flex items-center gap-0.5 shrink-0"
          >
            View all ({trendingTotal})
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
        <ul className="mt-2 divide-y divide-border">
          {trendingPreview.map((doc) => {
            const Icon = doc.type === 'pdf' ? FileText : File;
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() =>
                    onOpenDocument ? onOpenDocument(doc.id) : onNavigate('resourcesHub')
                  }
                  className="w-full flex items-center gap-2 py-2 text-left transition-colors hover:bg-muted/50 -mx-1 px-1 rounded-lg"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border">
                    <Icon size={15} className="text-primary" strokeWidth={2} />
                  </span>
                  <span className="flex-1 min-w-0 text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {doc.title}
                  </span>
                  <span className="text-xs font-bold text-foreground tabular-nums shrink-0">
                    {doc.views}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <TrendingThisWeekDrawer
        open={trendingDrawerOpen}
        onClose={() => setTrendingDrawerOpen(false)}
        documents={HUB_TRENDING_DOCUMENTS}
        onOpenDocument={onOpenDocument}
      />
    </div>
  );
}
