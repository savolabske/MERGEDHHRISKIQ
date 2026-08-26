import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  History,
  List,
  MessageSquare,
  MessageSquarePlus,
  Link2,
  Shield,
  Sparkles,
  Upload,
  Users,
  X,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AREA_STATUS_META,
  NOT_ASSESSED_META,
  PROGRAMME_STATUS_META,
  findCheckInProgramme,
  type AuditCheck,
  type ComplianceAreaDetail,
  type ProgrammeAudit,
  type ProgrammeAuditStatus,
  type ProgrammeScanProgress,
} from '../../data/customWorkflowsMock';
import {
  AID_FLOW_CHAT_PROMPT_THEME,
  ReportChatHeaderCollapse,
  ReportChatHistoryBackButton,
  ReportChatHistoryPanel,
  ReportChatLayout,
  ReportChatPromptInput,
  ReportChatScrollSync,
  ReportDetailShell,
  reportChatLayoutShellClassName,
  type ReportChatHistoryItem,
  type ReportChatLayoutHandle,
} from '../../features/insights/shared';
import { PageBreadcrumb } from '../ui/page-breadcrumb';
import { PageFooter } from '../PageFooter';
import { Button } from '../ui/button';
import { iconButtonSmClass } from '../ui/interaction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '../ui/sheet';
import { cn } from '../ui/utils';
import {
  ProgrammeAuditChatFeed,
  buildProgrammeAssistantReply,
  buildProgrammeSuggestedPrompts,
  type ProgrammeChatMessage,
} from './ProgrammeAuditChat';
import { ComplianceAreaCards } from './ComplianceAreaCards';

export { ComplianceAreaCards } from './ComplianceAreaCards';

interface ProgrammeAuditDetailProps {
  programme: ProgrammeAudit;
  onBackToWorkflows: () => void;
  onBackToReview: () => void;
  /** Expand this compliance area on open (e.g. from admin area cards). */
  initialExpandedAreaId?: string | null;
  breadcrumbRootLabel?: string;
  breadcrumbReviewLabel?: string;
  /** Heading above area cards / checklist (defaults to nine-area FCDO copy). */
  areasHeading?: string;
}

function ScoreRing({
  score,
  status,
  scanProgress,
}: {
  score: number | null;
  status: ProgrammeAuditStatus;
  scanProgress?: ProgrammeScanProgress;
}) {
  const size = 112;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isScanning = status === 'scanning' || score === null;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (isScanning) {
      setAnimatedScore(0);
      return;
    }

    const targetScore = Math.min(Math.max(score ?? 0, 0), 100);
    const durationMs = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out so it slows near the final score.
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(targetScore * eased));

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    setAnimatedScore(0);
    frame = window.requestAnimationFrame(tick);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [isScanning, score]);

  const progress = isScanning
    ? scanProgress
      ? scanProgress.assessed / scanProgress.total
      : 0
    : animatedScore / 100;
  const offset = circumference * (1 - progress);
  const color = PROGRAMME_STATUS_META[status].ringColor;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isScanning ? (
          <>
            <span className="text-[1.875rem] font-semibold leading-none tracking-[-0.02em] text-muted-foreground">
              {NOT_ASSESSED_META.symbol}
            </span>
            <span className="label-caps mt-1.5 tracking-[0.14em]">
              {scanProgress
                ? `${scanProgress.assessed} of ${scanProgress.total}`
                : 'Scanning'}
            </span>
          </>
        ) : (
          <>
            <span className="text-[1.875rem] font-semibold tabular-nums leading-none tracking-[-0.02em] text-foreground-emphasis">
              {animatedScore}
            </span>
            <span className="label-caps mt-1.5 tracking-[0.14em]">of 100</span>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ProgrammeAuditStatus }) {
  const meta = PROGRAMME_STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        meta.badgeClass,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden />
      {meta.label}
    </span>
  );
}

function CheckRow({
  check,
  isActive,
  onOpen,
}: {
  check: AuditCheck;
  isActive: boolean;
  onOpen: () => void;
}) {
  const meta = PROGRAMME_STATUS_META[check.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'w-full flex items-start gap-2.5 sm:gap-3 px-0 py-3 text-left transition-colors',
        isActive ? 'bg-primary-subtle/40' : 'hover:bg-muted/40',
      )}
    >
      <span className={cn('size-2.5 shrink-0 rounded-full mt-1.5', meta.dotClass)} aria-hidden />
      <span className="min-w-0 flex-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-sm font-medium tracking-tight text-foreground sm:min-w-0 sm:flex-1 sm:truncate">
          {check.title}
        </span>
        <span className={cn('text-xs font-semibold', meta.textClass)}>{meta.label}</span>
      </span>
      <ChevronDown size={16} className="shrink-0 -rotate-90 text-muted-foreground mt-0.5" />
    </button>
  );
}

function AreasAccordion({
  areas,
  expandedAreaId,
  activeCheckId,
  onToggleArea,
  onOpenCheck,
}: {
  areas: ComplianceAreaDetail[];
  expandedAreaId: string | null;
  activeCheckId: string | null;
  onToggleArea: (areaKey: string) => void;
  onOpenCheck: (checkId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {areas.map((area, index) => {
        const meta = AREA_STATUS_META[area.status];
        const areaKey = area.area;
        const isExpanded = expandedAreaId === areaKey;
        const isPending = area.status === 'pending';
        const clearSummary = isPending
          ? 'Not assessed yet'
          : `${area.clearCount} of ${area.totalCount} clear`;

        return (
          <div
            key={areaKey}
            className={cn(
              'rounded-xl border bg-card overflow-hidden',
              area.status === 'action_needed'
                ? 'border-destructive/20'
                : area.status === 'attention'
                  ? 'border-warning/20'
                  : 'border-border',
            )}
          >
            <button
              type="button"
              onClick={() => onToggleArea(areaKey)}
              className="w-full flex items-start sm:items-center gap-3 px-4 sm:px-5 py-4 text-left hover:bg-muted/30 transition-colors"
            >
              <span className="text-metadata tabular-nums w-6 shrink-0 mt-0.5 sm:mt-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={cn('size-2.5 rounded-full shrink-0 mt-1.5 sm:mt-0', meta.dotClass)} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-component-title tracking-tight text-balance">
                  {area.fullLabel}
                </span>
                <span className={cn('sm:hidden mt-1 block text-xs font-semibold', meta.textClass)}>
                  {meta.label}
                  <span className="font-normal text-muted-foreground"> — {clearSummary}</span>
                </span>
              </span>
              <span className={cn('hidden sm:inline text-xs font-semibold shrink-0', meta.textClass)}>
                {meta.label}
                <span className="font-normal text-muted-foreground"> — {clearSummary}</span>
              </span>
              <ChevronDown
                size={18}
                className={cn(
                  'shrink-0 text-muted-foreground transition-transform mt-0.5 sm:mt-0',
                  isExpanded && 'rotate-180',
                )}
              />
            </button>

            {isExpanded && (
              <div className="border-t border-border px-4 sm:px-5 pb-4 pt-3 space-y-3">
                <p className="text-description sm:pl-9 leading-relaxed">{area.summary}</p>
                {isPending || area.checks.length === 0 ? (
                  <div className="sm:ml-9 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
                    <p className="text-description">
                      Not assessed yet. Checks will appear once this area has been scanned.
                    </p>
                  </div>
                ) : (
                  <div className="sm:ml-9 divide-y divide-border">
                    {area.checks.map((check) => (
                      <CheckRow
                        key={check.id}
                        check={check}
                        isActive={activeCheckId === check.id}
                        onOpen={() => onOpenCheck(check.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EvidenceBadge({
  badge,
  label,
}: {
  badge: NonNullable<AuditCheck['evidence']>['badge'];
  label: string;
}) {
  const className =
    badge === 'current'
      ? 'bg-success-subtle text-success-text'
      : badge === 'outdated'
        ? 'bg-warning-subtle text-warning-text'
        : 'bg-destructive-subtle text-destructive-text';

  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', className)}>
      {label}
    </span>
  );
}

function CheckDetailSheet({
  programme,
  checkId,
  open,
  onOpenChange,
}: {
  programme: ProgrammeAudit;
  checkId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const selected = checkId ? findCheckInProgramme(programme, checkId) : undefined;
  const check = selected?.check;
  const area = selected?.area;
  const statusMeta = check ? PROGRAMME_STATUS_META[check.status] : null;
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  useEffect(() => {
    setAssessmentOpen(false);
  }, [check?.id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border bg-card p-0 sm:max-w-[440px] [&>button.absolute]:hidden"
      >
        <SheetTitle className="sr-only">{check?.title ?? 'Check detail'}</SheetTitle>
        <SheetDescription className="sr-only">
          Problem, evidence and fix for this compliance check
        </SheetDescription>

        {check && area && statusMeta && (
          <>
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                  {programme.id.toUpperCase()} · {area.fullLabel}
                </p>
                <h2 className="text-xl font-semibold text-foreground leading-snug">
                  {check.title}
                </h2>
                <StatusBadge status={check.status} />
              </div>
              <SheetClose className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <X size={20} strokeWidth={1.75} aria-hidden />
                <span className="sr-only">Close</span>
              </SheetClose>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <ol className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                <li className="relative pl-10">
                  <span className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground">
                    01
                  </span>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground mb-1.5">
                    The problem
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{check.problem}</p>
                </li>

                <li className="relative pl-10">
                  <span className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground">
                    02
                  </span>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                    The evidence
                  </p>
                  {check.evidence ? (
                    <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card border border-border text-primary">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {check.evidence.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {check.evidence.source} · {check.evidence.updatedAt}
                        </p>
                        <div className="mt-2">
                          <EvidenceBadge
                            badge={check.evidence.badge}
                            label={check.evidence.badgeLabel}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-destructive/30 bg-destructive-subtle/40 px-4 py-3 text-sm text-destructive-text">
                      No evidence found across linked sources.
                    </div>
                  )}
                </li>

                <li className="relative pl-10">
                  <span
                    className={cn(
                      'absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border text-xs font-semibold',
                      check.fix.kind === 'none'
                        ? 'border-success/30 bg-success-subtle text-success-text'
                        : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    03
                  </span>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                    The fix
                  </p>
                  {check.fix.kind === 'none' ? (
                    <div className="rounded-xl border border-success/20 bg-success-subtle px-4 py-3 flex items-start gap-2.5">
                      <Zap size={16} className="text-success-text mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-success-text">
                          {check.fix.title}
                        </p>
                        <p className="text-sm text-success-text/90 mt-0.5">
                          {check.fix.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-primary/15 bg-primary-subtle px-4 py-3.5 space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {check.fix.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {check.fix.description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          className="w-full sm:w-auto"
                          onClick={() => toast.message('Upload evidence')}
                        >
                          <Upload size={16} />
                          Upload evidence
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => toast.message('Assign to team')}
                        >
                          <Users size={16} />
                          Assign to team
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              </ol>

              <div className="rounded-xl border border-dashed border-border px-4 py-3.5 space-y-3">
                <button
                  type="button"
                  onClick={() => setAssessmentOpen((current) => !current)}
                  className="flex w-full items-center gap-2 text-left text-sm font-medium text-primary"
                >
                  <Link2 size={15} className="shrink-0" />
                  How this was assessed
                  <ChevronDown
                    size={16}
                    className={cn(
                      'ml-auto shrink-0 text-muted-foreground transition-transform',
                      assessmentOpen && 'rotate-180',
                    )}
                  />
                </button>

                {assessmentOpen && (
                  <div className="space-y-3 pt-1">
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                        <span>
                          <span className="font-semibold">Design agent</span> read the linked
                          documents and matched them to the evidence framework.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                        <span>
                          Result returned to the{' '}
                          <span className="font-semibold">delivery agent</span>, which set the
                          status and wrote this explanation.
                        </span>
                      </li>
                    </ul>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Last assessed {programme.lastReviewRelative}. A valid result is reused for 30
                      days unless a source document changes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function buildLeadershipSummary(programme: ProgrammeAudit) {
  const statusLabel = PROGRAMME_STATUS_META[programme.status].label.toLowerCase();
  const code = programme.id.toUpperCase();
  const actionAreas = programme.areas.filter((area) => area.status === 'action_needed');
  const attentionAreas = programme.areas.filter((area) => area.status === 'attention');
  const greenAreas = programme.areas.filter((area) => area.status === 'compliant');

  const intro =
    programme.score === null
      ? `${programme.fullTitle} is still being scanned (${programme.scanProgress?.assessed ?? 0} of ${programme.scanProgress?.total ?? 9} areas assessed).`
      : `${programme.fullTitle} sits at ${programme.score} out of 100 and is rated ${statusLabel}.`;

  const whyParts: string[] = [];
  if (programme.priorityAction) {
    whyParts.push(
      `${programme.priorityAction.title.replace(/\.$/, '')} — ${programme.priorityAction.description}`,
    );
  } else if (actionAreas.length > 0) {
    whyParts.push(
      `${actionAreas.map((a) => a.shortLabel).join(', ')} ${actionAreas.length === 1 ? 'is' : 'are'} red and blocking clearance.`,
    );
  }
  if (attentionAreas.length > 0) {
    whyParts.push(
      `${attentionAreas.length} amber item${attentionAreas.length === 1 ? '' : 's'} ${attentionAreas.length === 1 ? 'is' : 'are'} secondary: ${attentionAreas.map((a) => a.shortLabel).join(', ')}.`,
    );
  }
  const why =
    whyParts.join(' ').trim() ||
    'No red or amber drivers are open. The programme is clear on the current evidence base.';

  const ask = programme.priorityAction
    ? `Direct the responsible lead to action this first: ${programme.priorityAction.title} No board decision is required — this is a documentation gap, not a delivery failure.`
    : actionAreas.length > 0
      ? `Ask the programme team to clear ${actionAreas.map((a) => a.shortLabel).join(', ')} before the next donor checkpoint.`
      : attentionAreas.length > 0
        ? `Ask the team to clear the amber items in ${attentionAreas.map((a) => a.shortLabel).join(', ')} ahead of the next review.`
        : 'No executive decision is required. Keep the current evidence pack current for the next review cycle.';

  const closing =
    greenAreas.length > 0
      ? `${greenAreas.map((a) => a.shortLabel).join(', ')} ${greenAreas.length === 1 ? 'is' : 'are'} green. ${
          actionAreas.length > 0 || attentionAreas.length > 0
            ? 'This is an evidence gap, not a programme in trouble.'
            : 'The programme is clear on the current sweep.'
        }`
      : programme.summary;

  return { code, intro, why, ask, closing };
}

function buildActionPlanItems(programme: ProgrammeAudit) {
  const items = programme.areas.flatMap((area) =>
    area.checks
      .filter((check) => check.status === 'action_needed' || check.status === 'attention')
      .map((check) => ({
        id: check.id,
        areaLabel: area.shortLabel,
        title: check.title,
        status: check.status,
        description:
          check.fix.kind === 'required'
            ? check.fix.description
            : check.problem,
      })),
  );

  return items.sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'action_needed' ? -1 : 1;
  });
}

function ActionPlanDialog({
  programme,
  open,
  onOpenChange,
  onOpenCheck,
}: {
  programme: ProgrammeAudit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCheck: (checkId: string) => void;
}) {
  const items = useMemo(() => buildActionPlanItems(programme), [programme]);
  const code = programme.id.toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="space-y-0 px-4 sm:px-6 pt-6 pb-4 text-left">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
              <Shield size={16} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl font-semibold text-foreground">
                Action plan
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
                {items.length} open item{items.length === 1 ? '' : 's'} · {code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto px-4 sm:px-6 pb-5">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open actions. All assessed checks are clear.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {items.map((item, index) => {
                const meta = PROGRAMME_STATUS_META[item.status];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onOpenCheck(item.id);
                      }}
                      className="w-full rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                meta.badgeClass,
                              )}
                            >
                              <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden />
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            {item.areaLabel}
                          </p>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight size={16} className="mt-1 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LeadershipSummaryDialog({
  programme,
  open,
  onOpenChange,
}: {
  programme: ProgrammeAudit;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const summary = useMemo(() => buildLeadershipSummary(programme), [programme]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-overlay">
        <DialogHeader className="space-y-0 px-4 sm:px-6 pt-6 pb-5 text-left">
          <div className="flex items-start gap-3 pr-8">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Sparkles size={18} strokeWidth={2} />
            </div>
            <div className="min-w-0 pt-0.5">
              <DialogTitle className="text-page-title text-[1.35rem] leading-tight">
                Leadership summary
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs font-medium tracking-wide text-muted-foreground">
                One screen brief · {summary.code}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-0 px-4 sm:px-6 pb-6">
          <p className="text-sm leading-relaxed text-foreground">{summary.intro}</p>

          <div className="mt-5 border-t border-border pt-5 space-y-2.5">
            <h3 className="text-base font-semibold text-foreground">What is driving it</h3>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex shrink-0 rounded-md bg-primary-subtle px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                Why
              </span>
              <p className="text-sm leading-relaxed text-foreground">{summary.why}</p>
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-5 space-y-2.5">
            <h3 className="text-base font-semibold text-foreground">Decision needed</h3>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex shrink-0 rounded-md bg-primary-subtle px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                Ask
              </span>
              <p className="text-sm leading-relaxed text-foreground">{summary.ask}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{summary.closing}</p>
        </div>

        <DialogFooter className="border-t border-border bg-card px-4 sm:px-6 py-4">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => {
              toast.success('Leadership summary confirmed');
              onOpenChange(false);
            }}
          >
            <Check size={16} />
            Looks good
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProgrammeAuditDetail({
  programme,
  onBackToWorkflows,
  onBackToReview,
  initialExpandedAreaId = null,
  breadcrumbRootLabel = 'Custom Workflows',
  breadcrumbReviewLabel = 'FCDO Compliance Review',
  areasHeading = 'The 9 compliance areas',
}: ProgrammeAuditDetailProps) {
  const chatLayoutRef = useRef<ReportChatLayoutHandle>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimerRef = useRef<number | null>(null);
  const streamTimerRef = useRef<number | null>(null);
  const isQueryingRef = useRef(false);

  const suggestedPrompts = useMemo(
    () => buildProgrammeSuggestedPrompts(programme),
    [programme],
  );

  const auditHistoryReportId = `fcdo-audit-${programme.id}`;

  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(
    initialExpandedAreaId ?? null,
  );
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [leadershipSummaryOpen, setLeadershipSummaryOpen] = useState(false);
  const [actionPlanOpen, setActionPlanOpen] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [rescanFeedback, setRescanFeedback] = useState<string | null>(null);
  const [messages, setMessages] = useState<ProgrammeChatMessage[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(() => `audit-chat-${Date.now()}`);
  const [historyItems, setHistoryItems] = useState<
    ReportChatHistoryItem<ProgrammeChatMessage>[]
  >([]);
  const rescanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setExpandedAreaId(initialExpandedAreaId ?? null);
    setActiveCheckId(null);
    setSheetOpen(false);
    setLeadershipSummaryOpen(false);
    setActionPlanOpen(false);
    setIsRescanning(false);
    setRescanFeedback(null);
    setMessages([]);
    setPromptInput('');
    setIsQuerying(false);
    isQueryingRef.current = false;
    setThinkingPhase(null);
    setIsHistoryOpen(false);
    setIsChatOpen(false);
    setCurrentChatId(`audit-chat-${Date.now()}`);
    setHistoryItems([]);
    if (queryTimerRef.current) {
      window.clearTimeout(queryTimerRef.current);
      queryTimerRef.current = null;
    }
    if (streamTimerRef.current) {
      window.clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    if (rescanTimerRef.current) {
      window.clearTimeout(rescanTimerRef.current);
      rescanTimerRef.current = null;
    }
  }, [programme.id, initialExpandedAreaId]);

  useEffect(() => {
    if (!initialExpandedAreaId) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('areas-and-checks')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [programme.id, initialExpandedAreaId]);

  useEffect(() => {
    return () => {
      if (queryTimerRef.current) {
        window.clearTimeout(queryTimerRef.current);
      }
      if (streamTimerRef.current) {
        window.clearTimeout(streamTimerRef.current);
      }
      if (rescanTimerRef.current) {
        window.clearTimeout(rescanTimerRef.current);
      }
    };
  }, []);

  const persistCurrentChat = (nextMessages: ProgrammeChatMessage[]) => {
    if (nextMessages.length === 0) return;
    const firstUser = nextMessages.find((message) => message.role === 'user');
    const title = firstUser?.content?.trim() || 'Audit chat';
    const item: ReportChatHistoryItem<ProgrammeChatMessage> = {
      id: currentChatId,
      reportId: auditHistoryReportId,
      title: title.length > 72 ? `${title.slice(0, 69)}…` : title,
      timestamp: Date.now(),
      messageCount: nextMessages.length,
      queries: nextMessages.filter((m) => m.role === 'user').map((m) => m.content),
      messages: nextMessages,
    };
    setHistoryItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      const merged = existing
        ? { ...item, pinned: existing.pinned, pinnedAt: existing.pinnedAt }
        : item;
      return [merged, ...prev.filter((entry) => entry.id !== item.id)].sort((a, b) => {
        const aPinned = Boolean(a.pinned);
        const bPinned = Boolean(b.pinned);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        return b.timestamp - a.timestamp;
      });
    });
  };

  const clearGenerationTimers = () => {
    if (queryTimerRef.current) {
      window.clearTimeout(queryTimerRef.current);
      queryTimerRef.current = null;
    }
    if (streamTimerRef.current) {
      window.clearTimeout(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  };

  const stopGeneration = () => {
    clearGenerationTimers();
    isQueryingRef.current = false;
    setIsQuerying(false);
    setThinkingPhase(null);
    setMessages((current) => {
      persistCurrentChat(current);
      return current;
    });
  };

  const streamAssistantReply = (assistantId: string, fullText: string) => {
    const textParts = fullText.split(/(\s+)/).filter((part) => part.length > 0);
    let cursor = 0;

    const streamNextPart = () => {
      if (cursor >= textParts.length) {
        streamTimerRef.current = null;
        isQueryingRef.current = false;
        setIsQuerying(false);
        setMessages((current) => {
          persistCurrentChat(current);
          return current;
        });
        return;
      }

      const nextChunk = textParts[cursor];
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? { ...message, content: `${message.content}${nextChunk}` }
            : message,
        ),
      );
      cursor += 1;
      streamTimerRef.current = window.setTimeout(streamNextPart, 28);
    };

    streamNextPart();
  };

  const startNewChat = () => {
    clearGenerationTimers();
    isQueryingRef.current = false;
    if (messages.length > 0) {
      persistCurrentChat(messages);
    }
    setIsQuerying(false);
    setThinkingPhase(null);
    setIsHistoryOpen(false);
    setPromptInput('');
    setMessages([]);
    setCurrentChatId(`audit-chat-${Date.now()}`);
    chatLayoutRef.current?.openChat();
  };

  const openHistory = () => {
    if (messages.length > 0) {
      persistCurrentChat(messages);
    }
    setIsHistoryOpen(true);
    chatLayoutRef.current?.openChat();
  };

  const closeHistory = () => setIsHistoryOpen(false);

  const restoreHistoryItem = (item: ReportChatHistoryItem<ProgrammeChatMessage>) => {
    clearGenerationTimers();
    isQueryingRef.current = false;
    setIsQuerying(false);
    setThinkingPhase(null);
    setPromptInput('');
    setCurrentChatId(item.id);
    setMessages(item.messages ?? []);
    setIsHistoryOpen(false);
  };

  const deleteHistoryItem = (id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    if (currentChatId === id) {
      setMessages([]);
      setCurrentChatId(`audit-chat-${Date.now()}`);
    }
  };

  const togglePinHistoryItem = (id: string) => {
    setHistoryItems((prev) =>
      [...prev]
        .map((item) => {
          if (item.id !== id) return item;
          const pinned = !item.pinned;
          return {
            ...item,
            pinned,
            pinnedAt: pinned ? Date.now() : undefined,
          };
        })
        .sort((a, b) => {
          const aPinned = Boolean(a.pinned);
          const bPinned = Boolean(b.pinned);
          if (aPinned !== bPinned) return aPinned ? -1 : 1;
          return b.timestamp - a.timestamp;
        }),
    );
  };

  const startRescan = () => {
    if (isRescanning) return;
    setRescanFeedback(null);
    setIsRescanning(true);

    if (rescanTimerRef.current) {
      window.clearTimeout(rescanTimerRef.current);
    }

    rescanTimerRef.current = window.setTimeout(() => {
      setIsRescanning(false);
      setRescanFeedback(
        'No new evidence found. Linked sources are unchanged since the last review.',
      );
      toast.success('Scanning complete', {
        description: 'No new documents or evidence changes were found.',
      });
      rescanTimerRef.current = null;
    }, 2200);
  };

  const openProgrammeChat = () => {
    setSheetOpen(false);
    setActiveCheckId(null);
    chatLayoutRef.current?.openChat();
  };

  const runPrompt = (rawPrompt?: string) => {
    const prompt = (rawPrompt ?? promptInput).trim();
    if (!prompt || isQueryingRef.current) return;

    openProgrammeChat();
    setIsHistoryOpen(false);
    setPromptInput('');
    const userMessage: ProgrammeChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: prompt,
    };
    setMessages((current) => [...current, userMessage]);
    isQueryingRef.current = true;
    setIsQuerying(true);
    setThinkingPhase('Looking through knowledge base...');

    clearGenerationTimers();

    queryTimerRef.current = window.setTimeout(() => {
      setThinkingPhase('Preparing answer...');
      queryTimerRef.current = window.setTimeout(() => {
        const assistantId = `a-${Date.now()}`;
        const fullText = buildProgrammeAssistantReply(programme, prompt);
        setThinkingPhase(null);
        setMessages((current) => [
          ...current,
          { id: assistantId, role: 'assistant' as const, content: '' },
        ]);
        queryTimerRef.current = null;
        streamAssistantReply(assistantId, fullText);
      }, 700);
    }, 900);
  };

  const openCheck = (checkId: string) => {
    const found = findCheckInProgramme(programme, checkId);
    if (!found) return;
    setExpandedAreaId(found.area.area);
    setActiveCheckId(checkId);
    setSheetOpen(true);
    chatLayoutRef.current?.collapseChat();
  };

  return (
    <ReportDetailShell>
      <ReportChatLayout
        ref={chatLayoutRef}
        className={cn(reportChatLayoutShellClassName, 'bg-background')}
        mainClassName="px-4 sm:px-8 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10"
        chatLabel="Ask audit"
        dockHint={
          messages.length > 0
            ? `View chat · ${messages.length} message${messages.length === 1 ? '' : 's'}`
            : 'Ask about this audit'
        }
        sheetMinimizeLabel="Show audit"
        messageCount={messages.length}
        initialCollapsed
        sidebarWidthPx={420}
        sidebarClassName="border-l border-border bg-card"
        showPromptInput={!isHistoryOpen}
        onChatOpenChange={setIsChatOpen}
        chatHeader={
          <div className="shrink-0 border-b border-border px-4 py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {isHistoryOpen ? (
                  <ReportChatHistoryBackButton onClick={closeHistory} />
                ) : (
                  <button
                    type="button"
                    onClick={openHistory}
                    aria-label="View query history"
                    title="History"
                    className={cn(
                      iconButtonSmClass,
                      'border border-[#E5E7EB] text-[#6B7280] hover:border-[#1D4ED8] hover:bg-[#F9FAFB] hover:text-[#2463EB]',
                    )}
                  >
                    <History size={16} />
                  </button>
                )}
                {!isHistoryOpen && (
                  <button
                    type="button"
                    onClick={startNewChat}
                    aria-label="Start a new chat"
                    title="New chat"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#EFF6FF] px-3 text-[12px] font-medium leading-none text-[#2463EB] transition-colors hover:bg-[#E0EDFF]"
                  >
                    <MessageSquarePlus size={14} />
                    <span>New Chat</span>
                  </button>
                )}
              </div>
              <ReportChatHeaderCollapse />
            </div>
            {isHistoryOpen ? (
              <h3 className="text-[15px] font-semibold text-foreground">Chat history</h3>
            ) : null}
          </div>
        }
        chatFeed={
          <div
            ref={chatScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-card p-4"
          >
            {isHistoryOpen ? (
              <ReportChatHistoryPanel
                items={historyItems}
                onSelect={restoreHistoryItem}
                onDelete={deleteHistoryItem}
                onTogglePin={togglePinHistoryItem}
              />
            ) : (
              <>
                <ReportChatScrollSync
                  scrollRef={chatScrollRef}
                  deps={[messages, isQuerying, thinkingPhase]}
                />
                <ProgrammeAuditChatFeed
                  messages={messages}
                  isQuerying={isQuerying}
                  thinkingPhase={thinkingPhase}
                  suggestedPrompts={suggestedPrompts}
                  onPrompt={runPrompt}
                />
              </>
            )}
          </div>
        }
        promptInput={
          <ReportChatPromptInput
            value={promptInput}
            onChange={setPromptInput}
            onSubmit={() => runPrompt()}
            onStop={stopGeneration}
            isGenerating={isQuerying}
            placeholder="Ask about this audit…"
            theme={AID_FLOW_CHAT_PROMPT_THEME}
          />
        }
      >
        <div className="mx-auto max-w-[1280px] space-y-6">
          <PageBreadcrumb
            items={[
              { label: breadcrumbRootLabel, onClick: onBackToWorkflows },
              { label: breadcrumbReviewLabel, onClick: onBackToReview },
              { label: programme.title },
            ]}
          />

          <div
            className={cn(
              'flex flex-col gap-4',
              !isChatOpen && 'lg:flex-row lg:items-start lg:justify-between',
            )}
          >
            <div className="min-w-0">
              <h2 className="text-page-title tracking-tight text-balance">
                {programme.fullTitle}
              </h2>
            </div>
            <div
              className={cn(
                'flex flex-col gap-2 shrink-0 w-full',
                !isChatOpen && 'sm:w-auto sm:flex-row sm:flex-wrap',
              )}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto justify-center"
                onClick={() => setLeadershipSummaryOpen(true)}
              >
                <List size={16} />
                Leadership summary
              </Button>
              <Button
                type="button"
                className="w-full sm:w-auto justify-center"
                onClick={() => setActionPlanOpen(true)}
              >
                <Shield size={16} />
                Action plan
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 self-end sm:self-auto"
                aria-label="Ask about audit"
                onClick={openProgrammeChat}
              >
                <MessageSquare size={16} />
              </Button>
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
            <div className="space-y-4">
              <p className="label-caps">Audit health</p>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
                <ScoreRing
                  score={programme.score}
                  status={programme.status}
                  scanProgress={programme.scanProgress}
                />

                <div className="min-w-0 flex-1 space-y-3.5 pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <StatusBadge status={programme.status} />
                    <p className="text-supporting">
                      {programme.status === 'scanning' && programme.scanProgress
                        ? `Scanning ${programme.scanProgress.assessed} of ${programme.scanProgress.total} areas · ${programme.lastReviewRelative}`
                        : `Last full review ${programme.lastReviewRelative}`}
                    </p>
                  </div>
                  <p className="max-w-2xl text-[15px] sm:text-base font-medium leading-[1.55] tracking-[-0.01em] text-foreground-emphasis">
                    {programme.summary}
                  </p>
                </div>
              </div>
            </div>

            {programme.priorityAction && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/15 bg-primary-subtle px-4 py-3.5">
                <div className="min-w-0">
                  <p className="label-caps text-primary mb-1.5">Do this first</p>
                  <div className="space-y-1">
                    <p className="text-component-title">{programme.priorityAction.title}</p>
                    <p className="text-description">{programme.priorityAction.description}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => openCheck(programme.priorityAction!.checkId)}
                  className="w-full sm:w-auto shrink-0"
                >
                  Open the check
                  <ArrowRight size={16} />
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <ComplianceAreaCards
              areas={programme.areas}
              areasHeading={areasHeading}
              onOpenArea={(areaKey) => {
                setExpandedAreaId(areaKey);
                setActiveCheckId(null);
                const target = document.getElementById('areas-and-checks');
                if (target) {
                  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              onOpenCheck={openCheck}
            />
          </section>

          <section id="areas-and-checks" className="space-y-4 scroll-mt-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="text-section-title">{areasHeading}</h3>
              {isRescanning ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-subtle px-3 py-1 text-label font-medium text-primary">
                  <RefreshCw size={14} className="animate-spin" aria-hidden />
                  Scanning documents
                </span>
              ) : (
                <button
                  type="button"
                  onClick={startRescan}
                  className="text-label font-semibold text-primary hover:underline underline-offset-2"
                >
                  Re-scan now
                </button>
              )}
            </div>

            {rescanFeedback && !isRescanning && (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
                <p className="text-sm text-muted-foreground">{rescanFeedback}</p>
                <button
                  type="button"
                  onClick={() => setRescanFeedback(null)}
                  className="mt-1.5 text-xs font-medium text-primary hover:underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            <AreasAccordion
              areas={programme.areas}
              expandedAreaId={expandedAreaId}
              activeCheckId={activeCheckId}
              onToggleArea={(areaKey) =>
                setExpandedAreaId((current) => (current === areaKey ? null : areaKey))
              }
              onOpenCheck={openCheck}
            />
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <p className="label-caps mb-5">Review history</p>
            <ol className="relative space-y-5 before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
              {programme.history.map((item) => {
                const meta = PROGRAMME_STATUS_META[item.tone];
                return (
                  <li key={item.id} className="relative pl-6">
                    <span
                      className={cn(
                        'absolute left-0 top-1.5 size-2.5 rounded-full ring-4 ring-card',
                        meta.dotClass,
                      )}
                      aria-hidden
                    />
                    <p className="text-metadata mb-1">{item.when}</p>
                    <p className="text-description leading-relaxed">{item.description}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <PageFooter />
        </div>
      </ReportChatLayout>

      <CheckDetailSheet
        programme={programme}
        checkId={activeCheckId}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setActiveCheckId(null);
        }}
      />

      <LeadershipSummaryDialog
        programme={programme}
        open={leadershipSummaryOpen}
        onOpenChange={setLeadershipSummaryOpen}
      />

      <ActionPlanDialog
        programme={programme}
        open={actionPlanOpen}
        onOpenChange={setActionPlanOpen}
        onOpenCheck={openCheck}
      />
    </ReportDetailShell>
  );
}
