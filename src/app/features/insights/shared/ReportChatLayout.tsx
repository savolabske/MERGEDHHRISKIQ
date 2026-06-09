import React from 'react';
import { cn } from '../../../components/ui/utils';

export const reportChatAsideClassName =
  'hidden h-full w-[320px] shrink-0 flex-col overflow-hidden self-stretch xl:flex';

interface ReportChatLayoutProps {
  children: React.ReactNode;
  chatPanel: React.ReactNode;
  mainClassName?: string;
  className?: string;
}

export function ReportChatLayout({
  children,
  chatPanel,
  mainClassName,
  className,
}: ReportChatLayoutProps) {
  return (
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
      {chatPanel}
    </div>
  );
}
