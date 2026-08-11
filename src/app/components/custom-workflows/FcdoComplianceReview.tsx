import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  FCDO_AUDIT_AREAS,
  FCDO_PROGRAMME_AUDITS,
  NOT_ASSESSED_META,
  PROGRAMME_STATUS_META,
  RAG_META,
  getProgrammeAuditById,
  sortProgrammeAudits,
  type CellRating,
  type ProgrammeAudit,
  type ProgrammeAuditStatus,
} from '../../data/customWorkflowsMock';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { PageScrollShell } from '../PageScrollShell';
import { gridTableHeaderClass, gridTableRowClass, tableText } from '../ui/table-styles';
import { cn } from '../ui/utils';
import { ProgrammeAuditDetail } from './ProgrammeAuditDetail';

interface FcdoComplianceReviewProps {
  onBack: () => void;
}

function RagCell({ rating, area }: { rating: CellRating; area: string }) {
  if (rating === null) {
    return (
      <div
        className={cn(
          'relative flex h-8 w-12 sm:h-9 sm:w-14 items-center justify-center rounded-[8px] overflow-hidden',
          NOT_ASSESSED_META.cellClass,
        )}
        title={`${area}: ${NOT_ASSESSED_META.label}`}
        aria-label={`${area}: ${NOT_ASSESSED_META.label}`}
      >
        {/* Intentionally no symbol/text; keeps layout consistent without the em-dash. */}
      </div>
    );
  }

  const meta = RAG_META[rating];
  return (
    <div
      className={cn(
        'relative flex h-8 w-12 sm:h-9 sm:w-14 items-center justify-center rounded-[8px] overflow-hidden',
        meta.cellClass,
      )}
      title={`${area}: ${meta.label}`}
      aria-label={`${area}: ${meta.label}`}
    >
      <span
        className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-[8px]', meta.accentClass)}
        aria-hidden
      />
      <span className={cn('text-xs font-semibold', meta.textClass)}>{rating}</span>
    </div>
  );
}

function StatusLabel({ status }: { status: ProgrammeAuditStatus }) {
  const meta = PROGRAMME_STATUS_META[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-medium', meta.textClass)}>
      <span className={cn('size-2 rounded-full', meta.dotClass)} aria-hidden />
      {meta.label}
    </span>
  );
}

function ProgrammeIdentity({ audit }: { audit: ProgrammeAudit }) {
  const progressLabel =
    audit.status === 'scanning' && audit.scanProgress
      ? `Scanning ${audit.scanProgress.assessed} of ${audit.scanProgress.total} areas`
      : null;

  return (
    <div className="min-w-0 space-y-1.5 pr-2">
      <h3 className="table-primary-text line-clamp-2 group-hover:text-primary transition-colors">
        {audit.title}
      </h3>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StatusLabel status={audit.status} />
        {progressLabel ? (
          <p className="text-sm font-medium text-muted-foreground">{progressLabel}</p>
        ) : (
          <p className="text-sm font-semibold tabular-nums text-foreground">{audit.score}%</p>
        )}
      </div>
    </div>
  );
}

const DESKTOP_GRID =
  'grid-cols-[minmax(0,1fr)_repeat(9,4.25rem)] gap-x-1.5';

export function FcdoComplianceReview({ onBack }: FcdoComplianceReviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);

  const audits = useMemo(() => sortProgrammeAudits(FCDO_PROGRAMME_AUDITS), []);
  const selectedProgramme = selectedProgrammeId
    ? getProgrammeAuditById(selectedProgrammeId)
    : undefined;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return audits;
    return audits.filter(
      (audit) =>
        audit.title.toLowerCase().includes(q) ||
        audit.fullTitle.toLowerCase().includes(q) ||
        audit.geography.toLowerCase().includes(q),
    );
  }, [audits, searchQuery]);

  if (selectedProgramme) {
    return (
      <ProgrammeAuditDetail
        programme={selectedProgramme}
        onBackToWorkflows={onBack}
        onBackToReview={() => setSelectedProgrammeId(null)}
      />
    );
  }

  return (
    <PageScrollShell>
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: 'Custom Workflows', onClick: onBack },
          { label: 'FCDO Compliance Review' },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-page-title mb-1">FCDO Compliance Review</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Programme-level outcomes against the 72-point evidence framework across nine compliance
            areas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            Last sync 2hrs ago
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            size={18}
          />
          <input
            type="text"
            placeholder="Search programmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-base sm:text-sm bg-card focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {(['G', 'A', 'R'] as const).map((rating) => {
            const meta = RAG_META[rating];
            return (
              <span key={rating} className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded',
                    meta.cellClass,
                  )}
                >
                  <span className={cn('text-[10px] font-semibold', meta.textClass)}>{rating}</span>
                </span>
                <span className={meta.textClass}>{meta.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div
              className={cn(
                gridTableHeaderClass,
                'grid items-end gap-y-0 px-4 sm:px-5 py-3',
                DESKTOP_GRID,
              )}
            >
              <div className={tableText.header}>Programme</div>
              {FCDO_AUDIT_AREAS.map((area) => (
                <div
                  key={area}
                  className={cn(
                    tableText.header,
                    'text-center text-[10px] leading-tight px-0.5',
                  )}
                >
                  {area}
                </div>
              ))}
            </div>

            <div>
              {filtered.map((audit) => (
                <button
                  key={audit.id}
                  type="button"
                  onClick={() => setSelectedProgrammeId(audit.id)}
                  className={cn(
                    'group w-full text-left',
                    gridTableRowClass.narrative,
                    'grid items-center gap-y-0 px-4 sm:px-5',
                    DESKTOP_GRID,
                    'last:border-b-0',
                  )}
                >
                  <ProgrammeIdentity audit={audit} />
                  {FCDO_AUDIT_AREAS.map((area) => (
                    <div key={area} className="flex justify-center">
                      <RagCell rating={audit.ratings[area]} area={area} />
                    </div>
                  ))}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No programmes found</p>
          </div>
        )}
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((audit) => (
          <button
            key={audit.id}
            type="button"
            onClick={() => setSelectedProgrammeId(audit.id)}
            className="w-full text-left rounded-xl border border-border bg-card p-4 space-y-4 hover:border-primary/30 transition-colors"
          >
            <ProgrammeIdentity audit={audit} />
            <p className="text-xs text-muted-foreground">Last audited {audit.lastAudited}</p>
            <div className="grid grid-cols-3 gap-x-1.5 gap-y-3">
              {FCDO_AUDIT_AREAS.map((area) => (
                <div key={area} className="flex flex-col items-center gap-1 min-w-0">
                  <RagCell rating={audit.ratings[area]} area={area} />
                  <span className="text-[10px] leading-tight text-center text-muted-foreground line-clamp-2">
                    {area}
                  </span>
                </div>
              ))}
            </div>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center rounded-xl border border-border bg-card">
            <p className="text-sm text-muted-foreground">No programmes found</p>
          </div>
        )}
      </div>
    </div>
    </PageScrollShell>
  );
}
