import React, { createContext, useContext, useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

export const reportChatAsideClassName = 'flex h-full min-h-0 w-full flex-col overflow-hidden';

interface ReportChatPanelContextValue {
  collapse: () => void;
  expand: () => void;
  collapsed: boolean;
}

const ReportChatPanelContext = createContext<ReportChatPanelContextValue | null>(null);

export function useReportChatPanel() {
  const ctx = useContext(ReportChatPanelContext);
  if (!ctx) {
    throw new Error('useReportChatPanel must be used within ReportChatLayout');
  }
  return ctx;
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
  const { collapse } = useReportChatPanel();

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

export function ReportChatLayout({
  children,
  chatPanel,
  chatLabel = 'Ask',
  mainClassName,
  className,
}: ReportChatLayoutProps) {
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const panelContext: ReportChatPanelContextValue = {
    collapsed: chatCollapsed,
    collapse: () => setChatCollapsed(true),
    expand: () => setChatCollapsed(false),
  };

  return (
    <ReportChatPanelContext.Provider value={panelContext}>
      <div className={cn('flex min-h-0 flex-1 flex-col xl:flex-row', className)}>
        <main
          className={cn(
            'min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain',
            mainClassName,
          )}
          data-report-scroll
        >
          {children}
        </main>

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
      </div>
    </ReportChatPanelContext.Provider>
  );
}
