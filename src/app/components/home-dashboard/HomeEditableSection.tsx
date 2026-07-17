import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface DashboardEditableSectionProps {
  sectionId: string;
  isCustomizing: boolean;
  isActive: boolean;
  isRegenerating?: boolean;
  onEdit: (sectionId: string) => void;
  children: ReactNode;
  className?: string;
}

export function DashboardEditableSection({
  sectionId,
  isCustomizing,
  isActive,
  isRegenerating = false,
  onEdit,
  children,
  className,
}: DashboardEditableSectionProps) {
  return (
    <div
      className={cn(
        'relative transition-[opacity] duration-300',
        isCustomizing && 'rounded-2xl px-4 py-4 sm:px-5',
        isCustomizing &&
          (isActive
            ? 'border-2 border-dotted border-primary'
            : 'border-2 border-dotted border-primary/50'),
        isRegenerating && 'opacity-70 pointer-events-none',
        className,
      )}
      data-section-id={sectionId}
    >
      {isCustomizing && (
        <Button
          type="button"
          size="sm"
          variant={isActive ? 'default' : 'outline'}
          className="absolute top-4 right-4 z-30 shadow-sm"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(sectionId);
          }}
        >
          <Pencil size={14} strokeWidth={2.25} aria-hidden />
          Edit
        </Button>
      )}

      {isRegenerating && (
        <div
          className="absolute inset-0 z-20 rounded-2xl bg-background/40 backdrop-blur-[1px] flex items-center justify-center"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" aria-hidden />
            Updating section…
          </span>
        </div>
      )}

      <div className={cn(isCustomizing && 'pointer-events-none select-none')}>{children}</div>
    </div>
  );
}

/** @deprecated Use DashboardEditableSection */
export const HomeEditableSection = DashboardEditableSection;
