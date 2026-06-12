import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { MessageSquareText, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

export const reportChatAsideClassName = 'flex h-full min-h-0 w-full flex-col overflow-hidden';

const XL_BREAKPOINT = 1280;

function useIsBelowXl() {
  const [isBelowXl, setIsBelowXl] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${XL_BREAKPOINT - 1}px)`);
    const onChange = () => setIsBelowXl(window.innerWidth < XL_BREAKPOINT);
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isBelowXl;
}

interface ReportChatPanelContextValue {
  collapse: () => void;
  expand: () => void;
  collapsed: boolean;
  variant: 'sidebar' | 'sheet';
  mobileChatOpen: boolean;
  closeMobileChat: () => void;
}

const ReportChatPanelContext = createContext<ReportChatPanelContextValue | null>(null);

export function useReportChatPanel() {
  const ctx = useContext(ReportChatPanelContext);
  if (!ctx) {
    throw new Error('useReportChatPanel must be used within ReportChatLayout');
  }
  return ctx;
}

export interface ReportChatLayoutHandle {
  openChat: () => void;
}

interface ReportChatLayoutProps {
  children: React.ReactNode;
  chatPanel: React.ReactNode;
  /** Shown vertically on the expand rail when the panel is collapsed (desktop). */
  chatLabel?: string;
  mainClassName?: string;
  className?: string;
}

export function ReportChatHeaderCollapse({
  className,
}: {
  className?: string;
}) {
  const { collapse, variant } = useReportChatPanel();

  if (variant === 'sheet') {
    return null;
  }

  return (
    <button
      type="button"
      onClick={collapse}
      aria-label="Collapse assistant panel"
      title="Collapse panel"
      className={cn(
        'ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-primary-text focus-visible:ring-3 focus-visible:ring-ring/25',
        className,
      )}
    >
      <PanelRightClose size={15} strokeWidth={2} />
    </button>
  );
}

function ReportChatExpandRail({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Open ${label}`}
      title={`Open ${label}`}
      className={cn(
        'flex h-full w-10 flex-col items-center gap-2.5 border-l border-border bg-card py-5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-primary-text focus-visible:ring-3 focus-visible:ring-ring/25',
        className,
      )}
    >
      <PanelRightOpen size={16} strokeWidth={2} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
    </button>
  );
}

export const ReportChatLayout = forwardRef<ReportChatLayoutHandle, ReportChatLayoutProps>(
  function ReportChatLayout(
    { children, chatPanel, chatLabel = 'Ask', mainClassName, className },
    ref,
  ) {
    const [chatCollapsed, setChatCollapsed] = useState(false);
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const isBelowXl = useIsBelowXl();

    const openChat = useCallback(() => {
      if (isBelowXl) {
        setMobileChatOpen(true);
      } else {
        setChatCollapsed(false);
      }
    }, [isBelowXl]);

    useImperativeHandle(ref, () => ({ openChat }), [openChat]);

    useEffect(() => {
      if (!isBelowXl) {
        setMobileChatOpen(false);
      }
    }, [isBelowXl]);

    const panelContext: ReportChatPanelContextValue = {
      collapsed: chatCollapsed,
      collapse: () => setChatCollapsed(true),
      expand: () => setChatCollapsed(false),
      variant: isBelowXl ? 'sheet' : 'sidebar',
      mobileChatOpen,
      closeMobileChat: () => setMobileChatOpen(false),
    };

    return (
      <ReportChatPanelContext.Provider value={panelContext}>
        <div className={cn('relative flex min-h-0 flex-1 flex-col xl:flex-row', className)}>
          <main
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain',
              mainClassName,
            )}
            data-report-scroll
          >
            {children}
          </main>

          {/* Desktop sidebar (xl+) */}
          <div
            className={cn(
              'hidden shrink-0 self-stretch overflow-hidden transition-[width] duration-200 ease-out xl:block',
              chatCollapsed ? 'w-10' : 'w-[320px]',
            )}
          >
            {chatCollapsed ? (
              <ReportChatExpandRail label={chatLabel} onClick={() => setChatCollapsed(false)} />
            ) : (
              <div className="relative h-full w-[320px]">{chatPanel}</div>
            )}
          </div>

          {/* Mobile/tablet FAB + bottom sheet (below xl) */}
          {isBelowXl && (
            <>
              {mobileChatOpen && (
                <button
                  type="button"
                  aria-label="Close chat overlay"
                  className="fixed inset-0 z-[1210] bg-black/40"
                  onClick={() => setMobileChatOpen(false)}
                />
              )}

              <div
                className={cn(
                  'fixed inset-x-0 bottom-0 z-[1220] flex h-[min(70dvh,600px)] max-h-[min(70dvh,600px)] flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl transition-transform duration-300 ease-out xl:hidden',
                  mobileChatOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full',
                )}
                aria-hidden={!mobileChatOpen}
              >
                {mobileChatOpen && (
                  <div className="flex shrink-0 flex-col items-center border-b border-border px-4 pb-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMobileChatOpen(false)}
                      aria-label="Minimize chat and show report"
                      className="flex flex-col items-center gap-1 py-0.5"
                    >
                      <span className="h-1 w-10 rounded-full bg-border" />
                      <span className="text-[10px] font-medium text-muted-foreground">Show report</span>
                    </button>
                  </div>
                )}
                <div className="min-h-0 flex-1 overflow-hidden">{chatPanel}</div>
              </div>

              {!mobileChatOpen && (
                <button
                  type="button"
                  onClick={() => setMobileChatOpen(true)}
                  aria-label={chatLabel}
                  className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[1230] inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 xl:hidden"
                >
                  <MessageSquareText size={16} />
                  {chatLabel}
                </button>
              )}
            </>
          )}
        </div>
      </ReportChatPanelContext.Provider>
    );
  },
);
