import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../ui/sheet';
import { listFilterTriggerClass } from '../ui/interaction';
import { cn } from '../ui/utils';
import { FraudReportStatusBadge } from './FraudReportStatusBadge';
import {
  FRAUD_STATUSES,
  fraudReporterLabel,
  updateFraudReportStatus,
  type FraudReport,
  type FraudReportStatus,
} from '../../data/fraudReportStore';

type FraudReportDrawerProps = {
  report: FraudReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function FraudReportDrawer({ report, open, onOpenChange }: FraudReportDrawerProps) {
  const [displayed, setDisplayed] = useState<FraudReport | null>(report);

  useEffect(() => {
    if (report) setDisplayed(report);
  }, [report]);

  const item = report ?? displayed;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[480px] [&>button.absolute]:hidden"
      >
        <SheetTitle className="sr-only">Fraud report</SheetTitle>
        <SheetDescription className="sr-only">
          Full report and review status
        </SheetDescription>

        {item && (
          <>
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                  Fraud report
                </p>
                <FraudReportStatusBadge status={item.status} />
              </div>
              <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                <X size={20} strokeWidth={1.75} aria-hidden />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <dl className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-muted-foreground">Reported by</dt>
                <dd className={cn('font-medium text-foreground', item.anonymous && 'text-muted-foreground')}>
                  {fraudReporterLabel(item)}
                </dd>
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="font-medium text-foreground">{formatSubmittedAt(item.submittedAt)}</dd>
              </dl>

              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                  What happened
                </p>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="border-t border-border px-5 py-4">
              <label htmlFor="fraud-report-status" className="mb-2 block text-sm font-medium text-foreground">
                Review status
              </label>
              <select
                id="fraud-report-status"
                value={item.status}
                onChange={(event) =>
                  updateFraudReportStatus(item.id, event.target.value as FraudReportStatus)
                }
                className={cn(listFilterTriggerClass, 'w-full')}
                aria-label="Update review status"
              >
                {FRAUD_STATUSES.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
