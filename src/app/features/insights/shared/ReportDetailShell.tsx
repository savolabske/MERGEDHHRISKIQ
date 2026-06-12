import { type ReactNode } from 'react';
import { cn } from '../../../components/ui/utils';
import { useIsBelowLg } from './useIsBelowLg';

interface ReportDetailShellProps {
  children: ReactNode;
}

/** Mobile: single page-level scroll for header + dashboard. Desktop: height-constrained flex column. */
export function ReportDetailShell({ children }: ReportDetailShellProps) {
  const isBelowLg = useIsBelowLg();

  return (
    <div
      className={cn(
        'h-full min-h-0',
        isBelowLg
          ? 'overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]'
          : 'flex flex-col overflow-hidden',
      )}
      {...(isBelowLg ? { 'data-report-scroll': '' } : {})}
    >
      {children}
    </div>
  );
}
