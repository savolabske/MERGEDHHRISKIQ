import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../ui/utils';

interface ReportBuilderSidePanelProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export function ReportBuilderSidePanel({
  children,
  onClose,
  className,
}: ReportBuilderSidePanelProps) {
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1290] bg-black/40 lg:hidden"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className={cn(
          'bg-card flex flex-col min-h-0 overflow-hidden border-border',
          // Mobile: bottom sheet over the canvas
          'fixed inset-x-0 bottom-0 z-[1300] max-h-[min(90dvh,720px)] rounded-t-2xl border-t shadow-2xl',
          // Desktop: docked sidebar
          'lg:relative lg:inset-auto lg:z-auto lg:max-h-none lg:h-full lg:w-[420px] lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-none',
          className,
        )}
      >
        <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-border lg:hidden" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 size-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors lg:hidden"
          aria-label="Close panel"
        >
          <X size={18} className="text-muted-foreground" />
        </button>
        {children}
      </aside>
    </>
  );
}
