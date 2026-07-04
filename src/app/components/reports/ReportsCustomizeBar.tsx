import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface ReportsCustomizeBarProps {
  onDone: () => void;
  onCancel: () => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}

export function ReportsCustomizeBar({
  onDone,
  onCancel,
  onReset,
  showReset = false,
  className,
}: ReportsCustomizeBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Customizing your reports</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Drag to reorder · Hide reports you don&apos;t need
        </p>
        {showReset && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mt-1.5 text-xs font-medium text-primary hover:underline"
          >
            Reset to default
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
