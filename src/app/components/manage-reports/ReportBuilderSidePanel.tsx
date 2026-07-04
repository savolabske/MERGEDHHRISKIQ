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
    <aside
      className={cn(
        'relative w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col min-h-0 overflow-hidden',
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 size-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors sm:hidden"
        aria-label="Close panel"
      >
        <X size={18} className="text-muted-foreground" />
      </button>
      {children}
    </aside>
  );
}
