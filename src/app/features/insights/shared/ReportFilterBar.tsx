import React, { useEffect, useState } from 'react';
import { ChevronDown, Filter, X } from 'lucide-react';
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
  hasAppliedFilters?: boolean;
  onClearAll?: () => void;
  isApplyingFilters?: boolean;
  filtersAppliedPulse?: boolean;
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

function ClearAllButton({
  onClearAll,
  isApplyingFilters,
  filtersAppliedPulse,
  className,
}: {
  onClearAll: () => void;
  isApplyingFilters?: boolean;
  filtersAppliedPulse?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClearAll}
      className={cn(
        'inline-flex items-center text-[11px] font-medium transition',
        isApplyingFilters
          ? 'text-primary'
          : filtersAppliedPulse
            ? 'text-success'
            : 'text-muted-foreground hover:text-primary-text',
        className,
      )}
    >
      <X size={11} className="mr-1" />
      {isApplyingFilters ? 'Applying filters...' : 'Clear All Filters'}
    </button>
  );
}

export function ReportFilterBar({
  filterRef,
  mode,
  theme,
  onBackToReport,
  children,
  hasAppliedFilters = false,
  onClearAll,
  isApplyingFilters,
  filtersAppliedPulse,
}: ReportFilterBarProps) {
  const paused = mode !== 'explore';
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (paused) {
      setMobileOpen(false);
    }
  }, [paused]);

  const filterControlsClass = cn(
    paused && cn('pointer-events-none select-none opacity-45', theme.pausedPanelClass, 'px-2 py-1.5'),
  );

  return (
    <div ref={filterRef} className="relative flex w-full flex-col items-start gap-1.5 lg:w-auto lg:shrink-0 lg:items-end">
      {paused ? (
        <p
          className={cn(
            'whitespace-normal text-left text-xs leading-4 sm:whitespace-nowrap sm:text-right',
            theme.statusTextClass,
          )}
        >
          <ReportFilterStatus mode={mode} theme={theme} onBackToReport={onBackToReport} />
        </p>
      ) : null}

      {/* Mobile: single Filters control */}
      <div className="w-full sm:hidden">
        <button
          type="button"
          disabled={paused}
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className={cn(
            'inline-flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            hasAppliedFilters
              ? 'border-primary bg-primary-subtle text-primary'
              : 'border-border bg-card text-foreground',
          )}
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <Filter size={14} className="shrink-0" />
            <span className="truncate">Filters</span>
            {hasAppliedFilters ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Applied
              </span>
            ) : null}
          </span>
          <ChevronDown
            size={14}
            className={cn('shrink-0 transition-transform duration-200', mobileOpen && 'rotate-180')}
          />
        </button>

        {mobileOpen && !paused ? (
          <div className="report-mobile-filters mt-2 rounded-xl border border-border bg-card p-3 shadow-sm">
            {hasAppliedFilters && onClearAll ? (
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isApplyingFilters ? 'Applying…' : 'Active filters'}
                </span>
                <ClearAllButton
                  onClearAll={onClearAll}
                  isApplyingFilters={isApplyingFilters}
                  filtersAppliedPulse={filtersAppliedPulse}
                  className="shrink-0"
                />
              </div>
            ) : null}
            <div className={cn('flex flex-col gap-2', filterControlsClass)} aria-disabled={paused}>
              {children}
            </div>
          </div>
        ) : null}
      </div>

      {/* Desktop: inline filter chips */}
      <div
        className={cn(
          'hidden w-full sm:flex sm:flex-wrap sm:justify-end sm:gap-2 sm:rounded-xl',
          filterControlsClass,
        )}
        aria-disabled={paused}
      >
        {children}
        {hasAppliedFilters && onClearAll ? (
          <div className="flex items-center">
            <ClearAllButton
              onClearAll={onClearAll}
              isApplyingFilters={isApplyingFilters}
              filtersAppliedPulse={filtersAppliedPulse}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
