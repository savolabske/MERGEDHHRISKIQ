import { Plus } from 'lucide-react';

interface ReportSectionInsertProps {
  onInsert: () => void;
}

export function ReportSectionInsert({ onInsert }: ReportSectionInsertProps) {
  return (
    <div className="relative flex items-center justify-center py-2">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      <button
        type="button"
        onClick={onInsert}
        className="relative z-10 flex size-8 items-center justify-center rounded-full border border-dashed border-border bg-card text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-subtle transition-colors"
        title="Insert section"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
