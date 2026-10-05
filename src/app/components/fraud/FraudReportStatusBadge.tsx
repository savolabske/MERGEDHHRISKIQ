import { cn } from '../ui/utils';
import { fraudStatusLabel, type FraudReportStatus } from '../../data/fraudReportStore';

const STATUS_CLASS: Record<FraudReportStatus, string> = {
  new: 'bg-destructive/10 text-destructive',
  reviewing: 'bg-warning-subtle text-warning-text',
  closed: 'bg-muted text-muted-foreground',
};

export function FraudReportStatusBadge({ status }: { status: FraudReportStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        STATUS_CLASS[status],
      )}
    >
      {fraudStatusLabel(status)}
    </span>
  );
}
