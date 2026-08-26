import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  FCDO_PROGRAMME_AUDITS,
  sortProgrammeAudits,
  type ProgrammeAudit,
} from '../../data/customWorkflowsMock';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { PageScrollShell } from '../PageScrollShell';
import { ProgrammeAuditDetail } from './ProgrammeAuditDetail';
import { ProgrammePortfolioCard } from './ProgrammePortfolioCard';

export interface WorkflowPortfolioReviewProps {
  onBack: () => void;
  title: string;
  description: string;
  programmes: ProgrammeAudit[];
  /** Shown in the green sync pill; omit to hide. */
  syncBadge?: string;
  searchPlaceholder?: string;
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

function ProgrammeAuditCard({
  audit,
  onOpen,
}: {
  audit: ProgrammeAudit;
  onOpen: () => void;
}) {
  return (
    <ProgrammePortfolioCard
      status={audit.status}
      title={audit.title}
      metaLine={[audit.code, audit.iatiId, audit.geography, audit.budget]
        .filter(Boolean)
        .join(' · ')}
      score={audit.score}
      trend={audit.trend}
      trendPoints={audit.trendPoints}
      scanProgress={audit.scanProgress}
      summary={audit.summary}
      areas={audit.areas.map((area) => ({
        id: area.area,
        shortLabel: area.shortLabel,
        fullLabel: area.fullLabel,
        status: area.status,
      }))}
      lastReviewRelative={audit.lastReviewRelative}
      docsChanged={countChangedDocs(audit)}
      onOpen={onOpen}
    />
  );
}

/** Shared FCDO-style portfolio list → programme audit detail. */
export function WorkflowPortfolioReview({
  onBack,
  title,
  description,
  programmes,
  syncBadge,
  searchPlaceholder = 'Search programmes...',
}: WorkflowPortfolioReviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);

  const audits = useMemo(() => sortProgrammeAudits(programmes), [programmes]);
  const selectedProgramme = selectedProgrammeId
    ? audits.find((a) => a.id === selectedProgrammeId)
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
        breadcrumbReviewLabel={title}
        areasHeading={
          selectedProgramme.areas.length === 9
            ? 'The 9 compliance areas'
            : `The ${selectedProgramme.areas.length} compliance areas`
        }
      />
    );
  }

  return (
    <PageScrollShell>
      <div className="space-y-6">
        <PageBreadcrumb
          items={[{ label: 'Custom Workflows', onClick: onBack }, { label: title }]}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-page-title mb-1">{title}</h2>
            <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
          </div>
          {syncBadge ? (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-1 text-xs font-medium text-success-text">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                {syncBadge}
              </span>
            </div>
          ) : null}
        </div>

        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            size={18}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
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

interface FcdoComplianceReviewProps {
  onBack: () => void;
}

export function FcdoComplianceReview({ onBack }: FcdoComplianceReviewProps) {
  return (
    <WorkflowPortfolioReview
      onBack={onBack}
      title="FCDO Compliance Review"
      description="Programme-level outcomes against the 72-point evidence framework across nine compliance areas."
      programmes={FCDO_PROGRAMME_AUDITS}
      syncBadge="Last sync 2hrs ago"
    />
  );
}
