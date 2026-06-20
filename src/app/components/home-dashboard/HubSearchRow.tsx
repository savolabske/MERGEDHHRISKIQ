import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  FileText,
  GraduationCap,
  Lock,
  Search,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import {
  HUB_QUICK_ACTIONS,
  HUB_QUICK_ACTION_PANELS,
  type HubQuickActionId,
} from '../../data/homeDashboardMock';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../ui/utils';
import { HubKeyInsightsCard } from './HubKeyInsightsCard';
import { hubCard } from './hubStyles';

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

interface HubSearchOptions {
  extendedKnowledge?: boolean;
  privateToMe?: boolean;
}

interface HubSearchRowProps {
  onSearch: (query: string, options?: HubSearchOptions) => void;
  onOpenChat: (payload: DashboardChatPayload) => void;
}

export function HubSearchRow({ onSearch, onOpenChat }: HubSearchRowProps) {
  const [query, setQuery] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isExtendedKnowledge, setIsExtendedKnowledge] = useState(false);
  const [activePanel, setActivePanel] = useState<HubQuickActionId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const submitSearch = (searchQuery = query) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    onSearch(trimmed, {
      extendedKnowledge: isExtendedKnowledge,
      privateToMe: isPrivate,
    });
  };

  const toggleQuickActionPanel = (id: HubQuickActionId) => {
    setActivePanel((current) => (current === id ? null : id));
  };

  const handlePanelItemClick = (item: string) => {
    setQuery(item);
    setActivePanel(null);
    submitSearch(item);
  };

  const activePanelData = activePanel ? HUB_QUICK_ACTION_PANELS[activePanel] : null;
  const ActivePanelIcon = activePanel ? ACTION_ICONS[activePanel] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className={`${hubCard} p-6 flex flex-col relative overflow-visible ${activePanel ? 'z-20' : ''}`}>
        <h2 className="text-sm font-semibold text-foreground">What do you need today?</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Access Somalia humanitarian data and reports instantly
        </p>

        {/* Tall prompt bar — hover/focus matches add-resource form fields */}
        <div
          role="presentation"
          data-composite-field
          onClick={() => textareaRef.current?.focus()}
          className={cn(
            'mt-5 rounded-2xl border border-border bg-background p-4 min-h-[132px] flex flex-col cursor-text',
            'transition-colors hover:border-primary',
            'focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/10',
          )}
        >
          <div className="flex items-start gap-2.5 flex-1 min-h-[52px]">
            <Search
              size={18}
              className="text-muted-foreground shrink-0 mt-0.5"
              aria-hidden
            />
            <textarea
              ref={textareaRef}
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
              className="focus-ring-container-control flex-1 min-h-[44px] resize-none border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus:ring-0 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 mt-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={isPrivate}
                    onClick={(event) => {
                      event.stopPropagation();
                      const nextState = !isPrivate;
                      setIsPrivate(nextState);
                      toast.success(nextState ? 'Private to me is on' : 'Private to me is off');
                    }}
                    className={cn(
                      'inline-flex max-w-[170px] items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      isPrivate
                        ? 'border-primary bg-primary-subtle text-primary hover:bg-sidebar-accent'
                        : 'border-border bg-card text-foreground hover:bg-muted/30',
                    )}
                  >
                    <Lock size={12} strokeWidth={2.25} aria-hidden />
                    <span className="truncate ml-1.5">Private to me</span>
                    {isPrivate ? (
                      <span className="ml-1.5">
                        <X size={12} />
                      </span>
                    ) : null}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  variant="muted"
                  side="top"
                  sideOffset={8}
                  className="w-[280px] max-w-[280px] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-normal shadow-lg"
                >
                  When on, answers are drawn from your personal library — the resources and documents you&apos;ve added in My Resources.
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={isExtendedKnowledge}
                    onClick={(event) => {
                      event.stopPropagation();
                      const nextState = !isExtendedKnowledge;
                      setIsExtendedKnowledge(nextState);
                      toast.success(
                        nextState ? 'Extended Knowledge is on' : 'Extended Knowledge is off',
                      );
                    }}
                    className={cn(
                      'inline-flex max-w-[230px] items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      isExtendedKnowledge
                        ? 'border-primary bg-primary-subtle text-primary hover:bg-sidebar-accent'
                        : 'border-border bg-card text-foreground hover:bg-muted/30',
                    )}
                  >
                    <Sparkles size={12} />
                    <span className="truncate ml-1.5">
                      {isExtendedKnowledge ? 'Extended Knowledge ON' : 'Extended Knowledge'}
                    </span>
                    {isExtendedKnowledge ? (
                      <span className="ml-1.5">
                        <X size={12} />
                      </span>
                    ) : null}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  variant="muted"
                  side="top"
                  sideOffset={8}
                  className="w-[320px] max-w-[320px] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-normal shadow-lg"
                >
                  Enabling Extended Knowledge allows the model to enhance responses with its broader internal knowledge, providing additional context beyond your selected documents while still keeping answers grounded in your data.
                </TooltipContent>
              </Tooltip>
            </div>
            <button
              type="button"
              onClick={() => submitSearch()}
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

      <HubKeyInsightsCard onOpenChat={onOpenChat} />
    </div>
  );
}
