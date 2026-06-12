import React from 'react';
import { cn } from '../../../components/ui/utils';
import type { ReportFilterInteractionMode } from './useReportFilterMode';

export interface ReportFilterTheme {
  statusTextClass: string;
  linkClass: string;
  pausedPanelClass: string;
}

export const AID_FLOW_FILTER_THEME: ReportFilterTheme = {
  statusTextClass: 'text-muted-foreground',
  linkClass: 'text-primary-text hover:text-primary-text-hover hover:underline',
  pausedPanelClass: 'border-border bg-muted/80',
};

export const MIGRATION_FILTER_THEME: ReportFilterTheme = {
  statusTextClass: 'text-muted-foreground',
  linkClass: 'text-primary-text hover:text-primary-text-hover hover:underline',
  pausedPanelClass: 'border-border bg-muted/80',
};

export const SJF_FILTER_THEME: ReportFilterTheme = {
  statusTextClass: 'text-muted-foreground',
  linkClass: 'text-primary-text hover:text-primary-text-hover hover:underline',
  pausedPanelClass: 'border-border bg-muted/80',
};

interface ReportFilterBarProps {
  filterRef: React.RefObject<HTMLDivElement | null>;
  mode: ReportFilterInteractionMode;
  theme: ReportFilterTheme;
  onBackToReport?: () => void;
  children: React.ReactNode;
}

function ReportFilterStatus({
  mode,
  theme,
  onBackToReport,
}: {
  mode: Exclude<ReportFilterInteractionMode, 'explore'>;
  theme: ReportFilterTheme;
  onBackToReport?: () => void;
}) {
  if (mode === 'customizing') {
    return <>Building your custom view…</>;
  }

  return (
    <>
      Filters paused. Ask a follow-up in chat, or{' '}
      <button
        type="button"
        onClick={onBackToReport}
        className={cn(
          'inline border-0 bg-transparent p-0 text-xs font-normal leading-4 underline-offset-2',
          theme.linkClass,
        )}
      >
        go back to the main report
      </button>{' '}
      to filter.
    </>
  );
}

export function ReportFilterBar({
  filterRef,
  mode,
  theme,
  onBackToReport,
  children,
}: ReportFilterBarProps) {
  const paused = mode !== 'explore';

  return (
    <div ref={filterRef} className="relative flex shrink-0 flex-col items-end gap-1.5">
      {paused ? (
        <p
          className={cn(
            'whitespace-nowrap text-right text-xs leading-4',
            theme.statusTextClass,
          )}
        >
          <ReportFilterStatus mode={mode} theme={theme} onBackToReport={onBackToReport} />
        </p>
      ) : null}
      <div
        className={cn(
          'flex flex-wrap justify-end gap-2 rounded-xl transition-opacity duration-200',
          paused && cn('pointer-events-none select-none opacity-45', theme.pausedPanelClass, 'px-2 py-1.5'),
        )}
        aria-disabled={paused}
      >
        {children}
      </div>
    </div>
  );
}
