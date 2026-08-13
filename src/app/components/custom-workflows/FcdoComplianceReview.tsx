import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  AREA_STATUS_META,
  FCDO_PROGRAMME_AUDITS,
  PROGRAMME_STATUS_META,
  getProgrammeAuditById,
  sortProgrammeAudits,
  type ProgrammeAudit,
  type ProgrammeAuditStatus,
  type TrendDirection,
} from '../../data/customWorkflowsMock';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { PageScrollShell } from '../PageScrollShell';
import { cn } from '../ui/utils';
import { ProgrammeAuditDetail } from './ProgrammeAuditDetail';

interface FcdoComplianceReviewProps {
  onBack: () => void;
}

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
    <p className="text-[15px] leading-relaxed text-muted-foreground">
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

function countChangedDocs(audit: ProgrammeAudit): number {
  return audit.areas.reduce((total, area) => {
    return (
      total +
      area.checks.filter((check) => {
        if (!check.evidence) return check.status !== 'compliant';
        return check.evidence.badge === 'outdated' || check.evidence.badge === 'missing';
      }).length
    );
  }, 0);
}

function ComplianceRibbon({ audit }: { audit: ProgrammeAudit }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[680px] gap-2">
        {audit.areas.map((area) => {
          const meta = AREA_STATUS_META[area.status];
          return (
            <div
              key={area.area}
              className={cn(
                'relative flex min-h-[2.5rem] min-w-0 flex-1 items-center justify-center rounded-none px-1.5 py-2',
                meta.cardClass,
              )}
              title={`${area.fullLabel}: ${meta.label}`}
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
    </div>
  );
}

function ProgrammeAuditCard({
  audit,
  onOpen,
}: {
  audit: ProgrammeAudit;
  onOpen: () => void;
}) {
  const isScanning = audit.status === 'scanning' || audit.score === null;
  const docsChanged = countChangedDocs(audit);
  const scoreTone =
    audit.trend === 'down' || audit.status === 'action_needed'
      ? 'text-destructive'
      : audit.trend === 'up' || audit.status === 'compliant'
        ? 'text-success-text'
        : 'text-warning-text';
  const deltaPart =
    audit.trendPoints === 0 || audit.trend === 'flat'
      ? 'no change since last review'
      : `${audit.trend === 'down' ? '-' : '+'}${audit.trendPoints} since last review`;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-border bg-card p-5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-primary/25 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <StatusBadge status={audit.status} />
          <div className="min-w-0 pt-px">
            <h3 className="text-[1.25rem] font-semibold tracking-tight text-foreground">
              {audit.title}
            </h3>
            <p className="mt-1.5 font-mono text-[12px] leading-5 tracking-tight text-muted-foreground">
              {[audit.code, audit.iatiId, audit.geography, audit.budget]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
        </div>

        <div className="shrink-0 pt-1">
          {isScanning ? (
            <p className="text-sm font-medium tabular-nums text-muted-foreground">
              {audit.scanProgress
                ? `Scanning ${audit.scanProgress.assessed} of ${audit.scanProgress.total}`
                : 'Scanning'}
            </p>
          ) : (
            <p
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums',
                scoreTone,
              )}
            >
              <TrendMark trend={audit.trend} />
              <span>
                {audit.score}% · {deltaPart}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <SummaryText text={audit.summary} />
      </div>

      <div className="mt-5">
        <ComplianceRibbon audit={audit} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {(
            [
              ['compliant', 'Green'],
              ['attention', 'Amber'],
              ['action_needed', 'Red'],
            ] as const
          ).map(([status, label]) => (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span
                className={cn('size-1.5 rounded-full', PROGRAMME_STATUS_META[status].dotClass)}
                aria-hidden
              />
              {label}
            </span>
          ))}
        </div>
        <p className="font-mono text-[12px] text-muted-foreground">
          last review {audit.lastReviewRelative}
          {docsChanged > 0 ? ` · ${docsChanged} doc${docsChanged === 1 ? '' : 's'} changed` : ''}
        </p>
      </div>
    </button>
  );
}

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
        audit.code.toLowerCase().includes(q) ||
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
              Programme-level outcomes against the 72-point evidence framework across nine
              compliance areas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Last sync 2hrs ago
            </span>
          </div>
        </div>

        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            size={18}
          />
          <input
            type="text"
            placeholder="Search programmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-base transition-colors focus:border-primary focus:outline-none sm:text-sm"
          />
        </div>

        <div className="space-y-5">
          {filtered.map((audit) => (
            <ProgrammeAuditCard
              key={audit.id}
              audit={audit}
              onOpen={() => setSelectedProgrammeId(audit.id)}
            />
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card py-12 text-center">
              <p className="text-sm text-muted-foreground">No programmes found</p>
            </div>
          )}
        </div>
      </div>
    </PageScrollShell>
  );
}
