import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { ChevronDown, ChevronUp, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { useIsBelowLg } from './useIsBelowLg';

export const reportChatAsideClassName = 'flex h-full min-h-0 w-full flex-col overflow-hidden';

interface ReportChatPanelContextValue {
  collapse: () => void;
  expand: () => void;
  collapsed: boolean;
  variant: 'sidebar' | 'sheet';
  mobileChatOpen: boolean;
  openMobileChat: () => void;
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
  chatHeader: React.ReactNode;
  chatFeed: React.ReactNode;
  promptInput: React.ReactNode;
  /** Shown vertically on the expand rail when the panel is collapsed (desktop). */
  chatLabel?: string;
  /** Chevron label when sheet is closed; defaults from messageCount. */
  dockHint?: string;
  messageCount?: number;
  mainClassName?: string;
  className?: string;
  sidebarClassName?: string;
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

function DesktopChatSidebar({
  chatHeader,
  chatFeed,
  promptInput,
  className,
}: {
  chatHeader: React.ReactNode;
  chatFeed: React.ReactNode;
  promptInput: React.ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn('flex h-full min-h-0 flex-col', className)}>
      {chatHeader}
      {chatFeed}
      <div className="shrink-0 border-t border-border bg-card p-3">{promptInput}</div>
    </aside>
  );
}

export const ReportChatLayout = forwardRef<ReportChatLayoutHandle, ReportChatLayoutProps>(
  function ReportChatLayout(
    {
      children,
      chatHeader,
      chatFeed,
      promptInput,
      chatLabel = 'Ask',
      dockHint,
      messageCount = 0,
      mainClassName,
      className,
      sidebarClassName,
    },
    ref,
  ) {
    const [chatCollapsed, setChatCollapsed] = useState(false);
    const [mobileChatOpen, setMobileChatOpen] = useState(false);
    const isBelowLg = useIsBelowLg();

    const openMobileChat = useCallback(() => setMobileChatOpen(true), []);
    const closeMobileChat = useCallback(() => setMobileChatOpen(false), []);

    const openChat = useCallback(() => {
      if (isBelowLg) {
        setMobileChatOpen(true);
      } else {
        setChatCollapsed(false);
      }
    }, [isBelowLg]);

    useImperativeHandle(ref, () => ({ openChat }), [openChat]);

    useEffect(() => {
      if (!isBelowLg) {
        setMobileChatOpen(false);
      }
    }, [isBelowLg]);

    const resolvedDockHint =
      dockHint ??
      (messageCount > 0
        ? `View analysis · ${messageCount} message${messageCount === 1 ? '' : 's'}`
        : 'Suggested prompts');

    const panelContext: ReportChatPanelContextValue = {
      collapsed: chatCollapsed,
      collapse: () => setChatCollapsed(true),
      expand: () => setChatCollapsed(false),
      variant: isBelowLg ? 'sheet' : 'sidebar',
      mobileChatOpen,
      openMobileChat,
      closeMobileChat,
    };

    return (
      <ReportChatPanelContext.Provider value={panelContext}>
        <div className={cn('relative flex min-h-0 flex-1 flex-col lg:flex-row', className)}>
          <main
            className={cn(
              'min-w-0 overscroll-contain',
              isBelowLg ? 'overflow-visible' : 'min-h-0 flex-1 overflow-y-auto',
              mainClassName,
            )}
            {...(!isBelowLg ? { 'data-report-scroll': '' } : {})}
          >
            {children}
          </main>

          {/* Desktop sidebar (lg+) */}
          <div
            className={cn(
              'hidden shrink-0 self-stretch overflow-hidden transition-[width] duration-200 ease-out lg:block',
              chatCollapsed ? 'w-10' : 'w-[320px]',
            )}
          >
            {chatCollapsed ? (
              <ReportChatExpandRail label={chatLabel} onClick={() => setChatCollapsed(false)} />
            ) : (
              <div className="relative h-full w-[320px]">
                <DesktopChatSidebar
                  chatHeader={chatHeader}
                  chatFeed={chatFeed}
                  promptInput={promptInput}
                  className={sidebarClassName}
                />
              </div>
            )}
          </div>

          {/* Mobile/tablet: bottom dock + sheet (below lg) */}
          {isBelowLg && (
            <>
              <div
                className={cn(
                  'fixed inset-x-0 bottom-0 z-[1220] flex h-[min(68dvh,560px)] max-h-[min(68dvh,560px)] flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl transition-transform duration-300 ease-out lg:hidden',
                  mobileChatOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full',
                )}
                aria-hidden={!mobileChatOpen}
              >
                {mobileChatOpen && (
                  <>
                    <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
                      <button
                        type="button"
                        onClick={closeMobileChat}
                        aria-label="Minimize chat and show report"
                        className="flex flex-1 flex-col items-center gap-1 py-0.5"
                      >
                        <span className="h-1 w-10 rounded-full bg-border" />
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                          <ChevronDown size={14} />
                          Show report
                        </span>
                      </button>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      {chatHeader}
                      {chatFeed}
                      <div className="shrink-0 border-t border-border bg-card p-3">{promptInput}</div>
                    </div>
                  </>
                )}
              </div>

              {!mobileChatOpen && (
                <div className="fixed inset-x-0 bottom-0 z-[1215] border-t border-border bg-card/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:hidden">
                  <button
                    type="button"
                    onClick={openMobileChat}
                    aria-label={`Open ${chatLabel}`}
                    className="mb-2 flex w-full items-center justify-center gap-1.5 text-[11px] font-medium text-muted-foreground"
                  >
                    <ChevronUp size={14} />
                    {resolvedDockHint}
                  </button>
                  {promptInput}
                </div>
              )}
            </>
          )}
        </div>
      </ReportChatPanelContext.Provider>
    );
  },
);
