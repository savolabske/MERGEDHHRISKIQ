import { useState } from 'react';
import { ChevronDown, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import type { ReportHubCardData } from './reportHubTypes';

interface ReportsHiddenSectionProps {
  reports: ReportHubCardData[];
  onShow: (id: string) => void;
  onShowAll?: () => void;
  className?: string;
}

export function ReportsHiddenSection({
  reports,
  onShow,
  onShowAll,
  className,
}: ReportsHiddenSectionProps) {
  const [expanded, setExpanded] = useState(true);

  if (reports.length === 0) return null;

  return (
    <div className={cn('mt-6', className)}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        aria-expanded={expanded}
      >
        <ChevronDown
          size={16}
          className={cn('transition-transform', !expanded && '-rotate-90')}
        />
        Hidden reports ({reports.length})
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{report.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {report.description}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onShow(report.id)}
                className="shrink-0"
              >
                <Eye size={14} />
                Show
              </Button>
            </div>
          ))}
        </div>
      )}

      {onShowAll && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Show all reports
        </button>
      )}
    </div>
  );
}
