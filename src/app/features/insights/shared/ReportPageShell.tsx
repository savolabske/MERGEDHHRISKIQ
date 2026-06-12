import { type ReactNode } from 'react';
import { cn } from '../../../components/ui/utils';
import { useIsBelowLg } from './useIsBelowLg';

interface ReportPageShellProps {
  className?: string;
  children: ReactNode;
}

/**
 * Report page layout shell.
 * Below lg: content flows naturally; parent ReportDetailShell owns page scroll.
 * lg+: fixed-height column for sidebar + main scroll split.
 */
export function ReportPageShell({ className, children }: ReportPageShellProps) {
  const isBelowLg = useIsBelowLg();

  return (
    <div className={cn(isBelowLg ? 'w-full' : 'flex h-full min-h-0 flex-col', className)}>
      <div
        className={cn(
          'mx-auto flex w-full max-w-[1780px] flex-col',
          !isBelowLg && 'h-full min-h-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}
