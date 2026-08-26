import {
  AREA_STATUS_META,
  PROGRAMME_STATUS_META,
  type AreaStatus,
  type ProgrammeAuditStatus,
  type TrendDirection,
} from '../../data/customWorkflowsMock';
import { cn } from '../ui/utils';

export type PortfolioAreaSegment = {
  id: string;
  shortLabel: string;
  fullLabel?: string;
  status: AreaStatus;
};

export type ProgrammePortfolioCardProps = {
  status: ProgrammeAuditStatus;
  title: string;
  /** Light metadata line, e.g. code · IATI · geography · budget */
  metaLine: string;
  score: number | null;
  trend: TrendDirection;
  trendPoints: number;
  scanProgress?: { assessed: number; total: number };
  summary: string;
  areas: PortfolioAreaSegment[];
  lastReviewRelative: string;
  docsChanged?: number;
  onOpen?: () => void;
};

function StatusBadge({ status }: { status: ProgrammeAuditStatus }) {
  const meta = PROGRAMME_STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        meta.badgeClass,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden />
      {meta.label}
    </span>
  );
}

function TrendMark({ trend, className }: { trend: TrendDirection; className?: string }) {
  if (trend === 'flat') {
    return (
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className={className} aria-hidden>
        <path d="M2 7H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  const d =
    trend === 'down'
      ? 'M1.5 3.5 L5 7.5 L8.5 5 L16.5 11.5'
      : 'M1.5 10.5 L5 6.5 L8.5 8 L16.5 2.5';

  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" className={className} aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p className="text-[15px] leading-relaxed text-muted-foreground break-words">
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

function ribbonLabel(shortLabel: string) {
  if (shortLabel === 'M and E') return 'M&E';
  if (shortLabel === 'Safeguarding') return 'Safeguard';
  return shortLabel;
}

function ComplianceRibbon({ areas }: { areas: PortfolioAreaSegment[] }) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 md:grid-cols-9 md:gap-2"
      role="list"
      aria-label="Compliance areas"
    >
      {areas.map((area) => {
        const meta = AREA_STATUS_META[area.status];
        return (
          <div
            key={area.id}
            role="listitem"
            className={cn(
              'relative flex min-h-[2.5rem] min-w-0 items-center justify-center rounded-none px-1.5 py-2',
              meta.cardClass,
            )}
            title={`${area.fullLabel ?? area.shortLabel}: ${meta.label}`}
          >
            <span
              className={cn('absolute inset-y-0 left-0 w-[3px]', meta.barClass)}
              aria-hidden
            />
            <span
              className={cn(
                'truncate pl-1 text-[11px] font-semibold leading-none sm:text-xs',
                meta.textClass,
              )}
            >
              {ribbonLabel(area.shortLabel)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ProgrammePortfolioCard({
  status,
  title,
  metaLine,
  score,
  trend,
  trendPoints,
  scanProgress,
  summary,
  areas,
  lastReviewRelative,
  docsChanged = 0,
  onOpen,
}: ProgrammePortfolioCardProps) {
  const isScanning = status === 'scanning' || score === null;
  const scoreTone =
    trend === 'down' || status === 'action_needed'
      ? 'text-destructive'
      : trend === 'up' || status === 'compliant'
        ? 'text-success-text'
        : 'text-warning-text';
  const deltaPart =
    trendPoints === 0 || trend === 'flat'
      ? 'no change since last review'
      : `${trend === 'down' ? '-' : '+'}${trendPoints} since last review`;

  const body = (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
          <StatusBadge status={status} />
          <div className="min-w-0 sm:pt-px">
            <h3 className="text-[1.125rem] font-semibold tracking-tight text-foreground text-balance sm:text-[1.25rem]">
              {title}
            </h3>
            {metaLine ? (
              <p className="mt-1.5 font-mono text-[12px] leading-5 tracking-tight text-muted-foreground break-words">
                {metaLine}
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 sm:pt-1 sm:text-right">
          {isScanning ? (
            <p className="text-sm font-medium tabular-nums text-muted-foreground">
              {scanProgress
                ? `Scanning ${scanProgress.assessed} of ${scanProgress.total}`
                : 'Scanning'}
            </p>
          ) : (
            <p
              className={cn(
                'inline-flex flex-wrap items-center gap-1.5 text-sm font-semibold tabular-nums',
                scoreTone,
              )}
            >
              <TrendMark trend={trend} />
              <span>
                {score}% · {deltaPart}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <SummaryText text={summary} />
      </div>

      {areas.length > 0 ? (
        <div className="mt-5">
          <ComplianceRibbon areas={areas} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {(
            [
              ['compliant', 'Green'],
              ['attention', 'Amber'],
              ['action_needed', 'Red'],
            ] as const
          ).map(([legendStatus, label]) => (
            <span key={legendStatus} className="inline-flex items-center gap-1.5">
              <span
                className={cn('size-1.5 rounded-full', PROGRAMME_STATUS_META[legendStatus].dotClass)}
                aria-hidden
              />
              {label}
            </span>
          ))}
        </div>
        <p className="font-mono text-[12px] text-muted-foreground">
          last review {lastReviewRelative}
          {docsChanged > 0 ? ` · ${docsChanged} doc${docsChanged === 1 ? '' : 's'} changed` : ''}
        </p>
      </div>
    </>
  );

  const shellClass =
    'w-full min-w-0 rounded-2xl border border-border bg-card p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] whitespace-normal sm:p-6';

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(shellClass, 'transition-colors hover:border-primary/25')}
      >
        {body}
      </button>
    );
  }

  return <div className={shellClass}>{body}</div>;
}
