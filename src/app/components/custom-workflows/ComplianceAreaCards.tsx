import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import {
  AREA_STATUS_META,
  type ComplianceAreaDetail,
} from '../../data/customWorkflowsMock';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

export function ComplianceAreaCards({
  areas,
  onOpenArea,
  onOpenCheck: _onOpenCheck,
  onViewAudit,
  disabled = false,
  disabledHint,
}: {
  areas: ComplianceAreaDetail[];
  onOpenArea?: (areaKey: string) => void;
  /** Kept for callers that open a check from elsewhere; grid cards open the area. */
  onOpenCheck?: (checkId: string) => void;
  /** Opens the full programme audit detail (reuse existing audit UI). */
  onViewAudit?: () => void;
  /** When true, cards are non-interactive (e.g. no linked audit detail). */
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [pulseActionCards, setPulseActionCards] = useState(true);

  useEffect(() => {
    setPulseActionCards(true);
    const timer = window.setTimeout(() => setPulseActionCards(false), 2400);
    return () => window.clearTimeout(timer);
  }, [areas]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1 min-w-0 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3">
          <p className="label-caps">The 9 compliance areas</p>
          <p className="text-supporting">
            {disabled
              ? disabledHint ?? 'Detailed audit view is not available for this programme yet'
              : 'Click a segment to open it'}
          </p>
        </div>
        {onViewAudit && !disabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onViewAudit}
            className="w-full sm:w-auto justify-center"
          >
            <Eye size={14} />
            View audit
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
        {areas.map((area, index) => {
          const meta = AREA_STATUS_META[area.status];
          const clearSummary =
            area.status === 'pending'
              ? 'Not assessed'
              : `${area.clearCount} of ${area.totalCount} clear`;
          const shouldPulse = !disabled && pulseActionCards && area.status === 'action_needed';
          const className = cn(
            'relative overflow-hidden rounded-md px-3 py-2.5 text-left transition-colors',
            meta.cardClass,
            disabled ? 'cursor-default opacity-90' : 'hover:brightness-[0.98]',
            shouldPulse && 'compliance-action-pulse',
          );

          const body = (
            <>
              <span
                className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-[2px]', meta.barClass)}
                aria-hidden
              />
              <p className="text-metadata tabular-nums tracking-wide">
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug tracking-tight text-foreground">
                {area.shortLabel}
              </p>
              <p className={cn('mt-2 text-xs font-semibold leading-none', meta.textClass)}>
                {meta.label}
              </p>
              <p className="mt-1.5 text-[11px] font-normal leading-tight text-muted-foreground">
                {clearSummary}
              </p>
            </>
          );

          if (disabled || !onOpenArea) {
            return (
              <div key={area.area} className={className} aria-disabled="true">
                {body}
              </div>
            );
          }

          return (
            <button
              key={area.area}
              type="button"
              onClick={() => onOpenArea(area.area)}
              className={className}
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
  );
}
