import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  X,
  ChevronDown,
  Check,
  Sparkles,
  RefreshCw,
  MoreVertical,
  Eye,
  EyeOff,
  Search,
  Upload,
} from 'lucide-react';
import type { ManagedWorkflow, WorkflowAudit, WorkflowAuditStatus } from '../../data/workflowAdminMock';
import {
  LINKABLE_WORKFLOW_RESOURCES,
  WORKFLOW_AUDIT_AREAS,
  advanceProgrammeScan,
  createScanningProgramme,
} from '../../data/workflowAdminMock';
import { resolveAdminProgrammeAudit } from '../../data/customWorkflowsMock';
import { ComplianceAreaCards } from '../custom-workflows/ComplianceAreaCards';
import { ProgrammeAuditDetail } from '../custom-workflows/ProgrammeAuditDetail';
import { PageScrollShell } from '../PageScrollShell';
import { Button } from '../ui/button';
import { ListPageHeader, listHeaderActionClass, listRowClass } from '../ui/list-page';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';
import { ConfirmDeleteDialog } from '../ui/ConfirmDeleteDialog';
import { ReportUserGroupSelect } from '../manage-reports/ReportUserGroupSelect';

interface WorkflowConfigProps {
  workflow: ManagedWorkflow;
  onBack: () => void;
  onUpdate: (workflow: ManagedWorkflow) => void;
}

const AUDIT_STATUS_META: Record<
  WorkflowAuditStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  needs_doc: {
    label: 'Needs document',
    badgeClass: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
  scanning: {
    label: 'Auditing',
    badgeClass: 'bg-primary-subtle text-primary',
    dotClass: 'bg-primary animate-pulse',
  },
  complete: {
    label: 'Audited',
    badgeClass: 'bg-success-subtle text-success-text',
    dotClass: 'bg-success',
  },
};

function programmeHasRequiredDocs(audit: Pick<WorkflowAudit, 'projectDocId' | 'checklistDocId'>) {
  return Boolean(audit.projectDocId && audit.checklistDocId);
}

/** Keep audit idle until both docs are linked; then start the agent sweep. */
function withDocsReadyForAudit(
  audit: WorkflowAudit,
  options?: { restartWhenReady?: boolean },
): WorkflowAudit {
  const hasDocs = programmeHasRequiredDocs(audit);
  if (!hasDocs) {
    return {
      ...audit,
      auditStatus: 'needs_doc',
      score: null,
      scanProgress: undefined,
      currentArea: null,
      summary: null,
    };
  }
  if (audit.auditStatus === 'needs_doc' || options?.restartWhenReady) {
    return {
      ...audit,
      auditStatus: 'scanning',
      score: null,
      scanProgress: { assessed: 0, total: WORKFLOW_AUDIT_AREAS.length },
      currentArea: WORKFLOW_AUDIT_AREAS[0],
      summary: null,
    };
  }
  return audit;
}

export function WorkflowConfig({ workflow, onBack, onUpdate }: WorkflowConfigProps) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [deleteAuditId, setDeleteAuditId] = useState<string | null>(null);
  const [unpublishAuditId, setUnpublishAuditId] = useState<string | null>(null);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const workflowRef = useRef(workflow);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    workflowRef.current = workflow;
    onUpdateRef.current = onUpdate;
  }, [workflow, onUpdate]);

  const hasScanning = workflow.audits.some((a) => a.auditStatus === 'scanning');
  useEffect(() => {
    if (!hasScanning) return;

    const timer = window.setInterval(() => {
      const current = workflowRef.current;
      const nextAudits = current.audits.map(advanceProgrammeScan);
      const changed = nextAudits.some((a, i) => a !== current.audits[i]);
      if (changed) {
        onUpdateRef.current({ ...current, audits: nextAudits });
      }
    }, 1600);

    return () => window.clearInterval(timer);
  }, [hasScanning]);

  const handleStartAudit = (audit: WorkflowAudit) => {
    setShowAddProject(false);
    onUpdate({ ...workflow, audits: [audit, ...workflow.audits] });
    setSelectedAuditId(audit.id);
  };

  const handleRemoveAudit = (id: string) => {
    onUpdate({ ...workflow, audits: workflow.audits.filter((a) => a.id !== id) });
    if (selectedAuditId === id) setSelectedAuditId(null);
    setDeleteAuditId(null);
  };

  const handleUnpublish = (id: string) => {
    onUpdate({
      ...workflow,
      audits: workflow.audits.map((a) => (a.id === id ? { ...a, published: false } : a)),
    });
    setUnpublishAuditId(null);
  };

  const handlePublish = (id: string) => {
    onUpdate({
      ...workflow,
      audits: workflow.audits.map((a) => (a.id === id ? { ...a, published: true } : a)),
    });
  };

  const handlePatchAudit = (id: string, patch: Partial<WorkflowAudit>) => {
    onUpdate({
      ...workflow,
      audits: workflow.audits.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  };

  const handleUpdateAuditDoc = (
    auditId: string,
    resourceId: string | null,
    resourceTitle: string | null,
  ) => {
    onUpdate({
      ...workflow,
      audits: workflow.audits.map((a) => {
        if (a.id !== auditId) return a;
        const next = {
          ...a,
          projectDocId: resourceId,
          projectDocTitle: resourceTitle,
        };
        return withDocsReadyForAudit(next, { restartWhenReady: Boolean(resourceId) });
      }),
    });
  };

  const handleUpdateChecklist = (
    auditId: string,
    resourceId: string | null,
    resourceTitle: string | null,
  ) => {
    onUpdate({
      ...workflow,
      audits: workflow.audits.map((a) => {
        if (a.id !== auditId) return a;
        const next = {
          ...a,
          checklistDocId: resourceId,
          checklistDocTitle: resourceTitle,
        };
        return withDocsReadyForAudit(next);
      }),
    });
  };

  const deleteTarget = deleteAuditId ? workflow.audits.find((a) => a.id === deleteAuditId) : null;
  const unpublishTarget = unpublishAuditId
    ? workflow.audits.find((a) => a.id === unpublishAuditId)
    : null;
  const selectedAudit = selectedAuditId
    ? workflow.audits.find((a) => a.id === selectedAuditId) ?? null
    : null;

  return (
    <>
      {selectedAudit ? (
        <ProgrammeAdminDetail
          workflow={workflow}
          audit={selectedAudit}
          onBack={() => setSelectedAuditId(null)}
          onBackToManageWorkflows={onBack}
          onPatch={(patch) => handlePatchAudit(selectedAudit.id, patch)}
          onUpdateDoc={(id, title) => handleUpdateAuditDoc(selectedAudit.id, id, title)}
          onUpdateChecklist={(id, title) => handleUpdateChecklist(selectedAudit.id, id, title)}
          onPublish={() => handlePublish(selectedAudit.id)}
          onUnpublish={() => setUnpublishAuditId(selectedAudit.id)}
          onRemove={() => setDeleteAuditId(selectedAudit.id)}
        />
      ) : (
        <PageScrollShell innerClassName="space-y-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Manage Workflows
            </button>
            <span className="text-muted-foreground text-sm shrink-0">/</span>
            <span className="text-sm font-medium text-foreground truncate">{workflow.name}</span>
          </div>

          <ListPageHeader
            title={workflow.name}
            subtitle={workflow.description}
            action={
              <Button
                type="button"
                onClick={() => setShowAddProject(true)}
                className={listHeaderActionClass}
              >
                <Plus size={18} />
                Add Programme
              </Button>
            }
          />

          <ProgrammesList
            workflow={workflow}
            onOpenProgramme={(id) => setSelectedAuditId(id)}
            onDeleteProgramme={(id) => setDeleteAuditId(id)}
            onUnpublishProgramme={(id) => setUnpublishAuditId(id)}
            onPublishProgramme={handlePublish}
          />
        </PageScrollShell>
      )}

      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          onAdd={handleStartAudit}
        />
      )}

      <ConfirmDeleteDialog
        open={Boolean(deleteAuditId)}
        onOpenChange={(open) => !open && setDeleteAuditId(null)}
        onConfirm={() => deleteAuditId && handleRemoveAudit(deleteAuditId)}
        title="Remove programme?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from this workflow.`
            : 'This programme will be removed from the workflow.'
        }
        confirmLabel="Delete"
      />

      <ConfirmDeleteDialog
        open={Boolean(unpublishAuditId)}
        onOpenChange={(open) => !open && setUnpublishAuditId(null)}
        onConfirm={() => unpublishAuditId && handleUnpublish(unpublishAuditId)}
        title="Unpublish programme?"
        description={
          unpublishTarget
            ? `"${unpublishTarget.name}" will be hidden from Custom Workflows and moved to draft. You can publish it again later.`
            : 'This programme will be unpublished.'
        }
        confirmLabel="Unpublish"
      />
    </>
  );
}

// ── Admin programme detail ────────────────────────────────────────────────────

function ProgrammeAdminDetail({
  workflow,
  audit,
  onBack,
  onBackToManageWorkflows,
  onPatch,
  onUpdateDoc,
  onUpdateChecklist,
  onPublish,
  onUnpublish,
  onRemove,
}: {
  workflow: ManagedWorkflow;
  audit: WorkflowAudit;
  onBack: () => void;
  onBackToManageWorkflows: () => void;
  onPatch: (patch: Partial<WorkflowAudit>) => void;
  onUpdateDoc: (resourceId: string | null, resourceTitle: string | null) => void;
  onUpdateChecklist: (resourceId: string | null, resourceTitle: string | null) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onRemove: () => void;
}) {
  const [focusedAreaId, setFocusedAreaId] = useState<string | null>(null);
  const [auditViewOpen, setAuditViewOpen] = useState(false);

  const meta = AUDIT_STATUS_META[audit.auditStatus];
  const progress = audit.scanProgress;
  const progressPct =
    progress && progress.total > 0 ? Math.round((progress.assessed / progress.total) * 100) : 0;
  const needsDocs = audit.auditStatus === 'needs_doc';

  const programmeAudit = useMemo(
    () =>
      resolveAdminProgrammeAudit({
        id: audit.id,
        name: audit.name,
        description: audit.description,
        country: audit.country,
        auditStatus: audit.auditStatus,
        score: audit.score,
        scanProgress: audit.scanProgress,
        summary: audit.summary,
      }),
    [audit],
  );
  // Reuse ProgrammeAuditDetail for any programme past the needs-doc stage —
  // resolveAdminProgrammeAudit already supplies area/check data for admin stubs.
  const canOpenAuditDetail = audit.auditStatus !== 'needs_doc';

  const openAuditDetail = (areaKey: string | null = null) => {
    setFocusedAreaId(areaKey);
    setAuditViewOpen(true);
  };

  if (auditViewOpen && canOpenAuditDetail) {
    return (
      <ProgrammeAuditDetail
        programme={programmeAudit}
        initialExpandedAreaId={focusedAreaId}
        breadcrumbRootLabel="Manage Workflows"
        breadcrumbReviewLabel={workflow.name}
        onBackToWorkflows={onBackToManageWorkflows}
        onBackToReview={() => {
          setAuditViewOpen(false);
          setFocusedAreaId(null);
        }}
      />
    );
  }

  const documentSections = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Project document</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evidence source for the compliance sweep. Replacing it restarts the audit.
          </p>
        </div>
        {audit.projectDocId ? (
          <LinkedDocCard
            title={audit.projectDocTitle}
            onChange={onUpdateDoc}
            onRemove={() => onUpdateDoc(null, null)}
            changeLabel="Replace document"
          />
        ) : (
          <ResourcePicker placeholder="Select project document" onSelect={onUpdateDoc} />
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Checklist document</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Checklist used to guide area-by-area review.
          </p>
        </div>
        {audit.checklistDocId ? (
          <LinkedDocCard
            title={audit.checklistDocTitle}
            onChange={onUpdateChecklist}
            onRemove={() => onUpdateChecklist(null, null)}
            changeLabel="Replace document"
          />
        ) : (
          <ResourcePicker placeholder="Select checklist document" onSelect={onUpdateChecklist} />
        )}
      </section>
    </div>
  );

  return (
    <PageScrollShell innerClassName="space-y-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="truncate max-w-[10rem] sm:max-w-[16rem]">{workflow.name}</span>
        </button>
        <span className="text-muted-foreground text-sm shrink-0">/</span>
        <span className="text-sm font-medium text-foreground truncate">{audit.name}</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <input
            type="text"
            value={audit.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            className="w-full text-page-title bg-transparent border-none outline-none focus:ring-0 p-0"
            placeholder="Programme name"
            aria-label="Programme name"
          />
          <input
            type="text"
            value={audit.description}
            onChange={(e) => onPatch({ description: e.target.value })}
            className="w-full text-sm text-muted-foreground bg-transparent border-none outline-none focus:ring-0 p-0"
            placeholder="Add a short description…"
            aria-label="Programme description"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
          {audit.published ? (
            <Button
              type="button"
              variant="outline"
              onClick={onUnpublish}
              className={listHeaderActionClass}
            >
              <EyeOff size={16} />
              Unpublish
            </Button>
          ) : (
            <Button type="button" onClick={onPublish} className={listHeaderActionClass}>
              <Upload size={16} />
              Publish
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onRemove}
            className={listHeaderActionClass}
          >
            <Trash2 size={16} />
            Remove
          </Button>
        </div>
      </div>

      {needsDocs ? (
        <>
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-warning-subtle text-warning-text">
                Draft
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                  meta.badgeClass,
                )}
              >
                <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden />
                {meta.label}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Select documents to start the audit
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                This programme is saved as a draft. Link a project document and checklist document —
                then the compliance agents will start working.
              </p>
            </div>
          </section>
          {documentSections}
        </>
      ) : (
        <>
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <AdminScoreRing audit={audit} />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                      audit.published
                        ? 'bg-success-subtle text-success-text'
                        : 'bg-warning-subtle text-warning-text',
                    )}
                  >
                    {audit.published ? 'Published' : 'Draft'}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                      meta.badgeClass,
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', meta.dotClass)} aria-hidden />
                    {audit.auditStatus === 'scanning' && progress
                      ? `Auditing ${progress.assessed} of ${progress.total}`
                      : meta.label}
                  </span>
                  {audit.auditStatus === 'scanning' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                      <RefreshCw size={12} className="animate-spin" aria-hidden />
                      Agent working
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-foreground leading-snug">
                  {audit.auditStatus === 'scanning'
                    ? `Compliance agent is reviewing ${audit.currentArea ?? 'evidence'}…`
                    : audit.summary ?? 'Audit complete across all nine compliance areas.'}
                </p>
                {audit.auditStatus === 'scanning' && progress && (
                  <div className="space-y-1.5 max-w-md">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progress.assessed} of {progress.total} areas assessed
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <ComplianceAreaCards
              areas={programmeAudit.areas}
              disabled={!canOpenAuditDetail}
              disabledHint="Detailed audit view is not available for this programme yet"
              onViewAudit={canOpenAuditDetail ? () => openAuditDetail(null) : undefined}
              onOpenArea={
                canOpenAuditDetail ? (areaKey) => openAuditDetail(areaKey) : undefined
              }
            />
          </section>

          {documentSections}
        </>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <ReportUserGroupSelect
          selected={audit.userGroups}
          onChange={(groups) => onPatch({ userGroups: groups })}
          helperText="Only selected groups can see this programme once published. Leave empty to make it visible to everyone with workflow access."
        />
      </section>
    </PageScrollShell>
  );
}

function LinkedDocCard({
  title,
  onChange,
  onRemove,
  changeLabel = 'Change',
}: {
  title: string | null;
  onChange: (resourceId: string | null, resourceTitle: string | null) => void;
  onRemove: () => void;
  changeLabel?: string;
}) {
  const [replacing, setReplacing] = useState(false);

  if (replacing) {
    return (
      <div className="space-y-2">
        <ResourcePicker
          placeholder="Select a replacement document"
          onSelect={(id, docTitle) => {
            onChange(id, docTitle);
            setReplacing(false);
          }}
        />
        <button
          type="button"
          onClick={() => setReplacing(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <div className="w-7 h-7 rounded-md bg-primary-subtle flex items-center justify-center shrink-0 mt-0.5">
        <FileText size={13} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={() => setReplacing(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            <RefreshCw size={10} />
            {changeLabel}
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive-text transition-colors"
          >
            <X size={10} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminScoreRing({ audit }: { audit: WorkflowAudit }) {
  const size = 112;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isScanning = audit.auditStatus === 'scanning';
  const progress = isScanning
    ? (audit.scanProgress?.assessed ?? 0) / (audit.scanProgress?.total ?? 9)
    : audit.auditStatus === 'complete'
      ? (audit.score ?? 0) / 100
      : 0;
  const offset = circumference * (1 - progress);
  const strokeColor =
    audit.auditStatus === 'complete'
      ? 'var(--success)'
      : audit.auditStatus === 'scanning'
        ? 'var(--primary)'
        : 'var(--muted-foreground)';

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
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isScanning ? (
          <>
            <RefreshCw size={22} className="animate-spin text-primary" aria-hidden />
            <span className="mt-1.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {audit.scanProgress
                ? `${audit.scanProgress.assessed}/${audit.scanProgress.total}`
                : 'Scan'}
            </span>
          </>
        ) : audit.auditStatus === 'complete' ? (
          <>
            <span className="text-3xl font-semibold tabular-nums text-foreground leading-none">
              {audit.score}
            </span>
            <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              of 100
            </span>
          </>
        ) : (
          <span className="text-xs font-medium text-muted-foreground text-center px-2">
            Awaiting doc
          </span>
        )}
      </div>
    </div>
  );
}

// ── Programmes List: Name | Status | Access | Actions ─────────────────────────

function ProgrammesList({
  workflow,
  onOpenProgramme,
  onDeleteProgramme,
  onUnpublishProgramme,
  onPublishProgramme,
}: {
  workflow: ManagedWorkflow;
  onOpenProgramme: (id: string) => void;
  onDeleteProgramme: (id: string) => void;
  onUnpublishProgramme: (id: string) => void;
  onPublishProgramme: (id: string) => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="hidden min-h-10 lg:grid grid-cols-12 gap-4 px-6 py-3 bg-muted/70 border-b border-border">
        <div className="col-span-6 table-header-label">Name</div>
        <div className="col-span-2 table-header-label">Status</div>
        <div className="col-span-2 table-header-label">Access</div>
        <div className="col-span-2 table-header-label text-right">Actions</div>
      </div>

      <div className="divide-y divide-border">
        {workflow.audits.map((audit, index) => (
          <ProjectRow
            key={audit.id}
            audit={audit}
            index={index}
            total={workflow.audits.length}
            onOpen={() => onOpenProgramme(audit.id)}
            onDelete={() => onDeleteProgramme(audit.id)}
            onUnpublish={() => onUnpublishProgramme(audit.id)}
            onPublish={() => onPublishProgramme(audit.id)}
          />
        ))}
      </div>

      {workflow.audits.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No programmes yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a programme to start tracking compliance
          </p>
        </div>
      )}
    </div>
  );
}

/** Lifecycle cue under Published/Draft — never a compliance score. */
function getProgrammeAuditCue(audit: WorkflowAudit): string | null {
  if (audit.auditStatus === 'scanning' && audit.scanProgress) {
    return `Auditing ${audit.scanProgress.assessed}/${audit.scanProgress.total}`;
  }
  if (audit.auditStatus === 'needs_doc') {
    return 'Needs document';
  }
  return null;
}

function ProgrammeStatusCell({
  audit,
  compact = false,
}: {
  audit: WorkflowAudit;
  compact?: boolean;
}) {
  const cue = getProgrammeAuditCue(audit);

  return (
    <div className="flex flex-col items-start gap-0.5 min-w-0">
      <span
        className={cn(
          'inline-flex w-fit rounded-full text-xs font-medium',
          compact ? 'px-2 py-0.5' : 'px-2.5 py-1',
          audit.published
            ? 'bg-success-subtle text-success-text'
            : 'bg-warning-subtle text-warning-text',
        )}
      >
        {audit.published ? 'Published' : 'Draft'}
      </span>
      {cue && (
        <span className="text-xs text-muted-foreground leading-tight truncate max-w-full">
          {cue}
        </span>
      )}
    </div>
  );
}

function ProjectRow({
  audit,
  index,
  total,
  onOpen,
  onDelete,
  onUnpublish,
  onPublish,
}: {
  audit: WorkflowAudit;
  index: number;
  total: number;
  onOpen: () => void;
  onDelete: () => void;
  onUnpublish: () => void;
  onPublish: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<'above' | 'below'>('below');

  const toggleMenu = (button: HTMLButtonElement) => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    const isLastRow = index === total - 1;
    const menuHeight = 3 * 36 + 8;
    const { bottom } = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bottom;
    setMenuPlacement(isLastRow || spaceBelow < menuHeight + 8 ? 'above' : 'below');
    setMenuOpen(true);
  };

  return (
    <div
      onClick={onOpen}
      className={cn(listRowClass, 'relative cursor-pointer grid-cols-1 lg:grid-cols-12')}
    >
      {/* Name */}
      <div className="lg:col-span-6 min-w-0 pr-10 lg:pr-0">
        <p className="table-primary-text">{audit.name}</p>
        {audit.auditStatus === 'scanning' && audit.currentArea && (
          <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
            <Sparkles size={10} />
            Reviewing {audit.currentArea}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2 lg:hidden">
          <ProgrammeStatusCell audit={audit} compact />
          <span className="table-metadata-text">
            {audit.userGroups.length === 0
              ? 'Everyone'
              : `${audit.userGroups.length} group${audit.userGroups.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="hidden lg:flex lg:col-span-2 items-center">
        <ProgrammeStatusCell audit={audit} />
      </div>

      {/* Access */}
      <div className="hidden lg:flex lg:col-span-2 items-center">
        <span className="table-supporting-text truncate">
          {audit.userGroups.length === 0
            ? 'Everyone'
            : `${audit.userGroups.length} group${audit.userGroups.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Actions */}
      <div
        className="absolute top-3 right-3 lg:static lg:col-span-2 flex items-center lg:justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu(e.currentTarget);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Programme actions"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-10"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <div
                className={cn(
                  'absolute right-0 z-20 w-44 bg-card border border-border rounded-lg shadow-lg py-1',
                  menuPlacement === 'above' ? 'bottom-full mb-1' : 'top-full mt-1',
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    onOpen();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <Eye size={14} />
                  View
                </button>
                {audit.published ? (
                  <button
                    type="button"
                    onClick={() => {
                      onUnpublish();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <EyeOff size={14} />
                    Unpublish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onPublish();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Upload size={14} />
                    Publish
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive-text hover:bg-destructive-subtle"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Resource Picker (with search) ─────────────────────────────────────────────

function ResourcePicker({
  placeholder,
  selectedId,
  onSelect,
}: {
  placeholder: string;
  selectedId?: string | null;
  onSelect: (id: string | null, title: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = LINKABLE_WORKFLOW_RESOURCES.find((r) => r.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LINKABLE_WORKFLOW_RESOURCES;
    return LINKABLE_WORKFLOW_RESOURCES.filter((r) => r.title.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => searchRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    setQuery('');
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left',
            open ? 'border-primary' : 'border-border hover:border-primary/50',
            selected ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          <span className="truncate">{selected ? selected.title : placeholder}</span>
          <ChevronDown
            size={15}
            className={cn(
              'shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={6}
        collisionPadding={12}
        className="z-[1500] w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 overflow-hidden"
      >
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-card focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {query.trim() ? 'No resources found.' : 'No resources available.'}
            </p>
          ) : (
            filtered.map((resource) => (
              <button
                key={resource.id}
                type="button"
                onClick={() => {
                  onSelect(resource.id, resource.title);
                  setOpen(false);
                  setQuery('');
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted transition-colors text-left',
                  selectedId === resource.id
                    ? 'bg-primary-subtle/50 text-primary font-medium'
                    : 'text-foreground',
                )}
              >
                <FileText size={14} className="text-muted-foreground shrink-0" />
                <span className="flex-1 min-w-0 leading-snug">{resource.title}</span>
                {selectedId === resource.id && (
                  <Check size={14} className="text-primary shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Add Programme Modal ───────────────────────────────────────────────────────

function AddProjectModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (audit: WorkflowAudit) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectDocId, setProjectDocId] = useState<string | null>(null);
  const [projectDocTitle, setProjectDocTitle] = useState<string | null>(null);
  const [checklistDocId, setChecklistDocId] = useState<string | null>(null);
  const [checklistDocTitle, setChecklistDocTitle] = useState<string | null>(null);
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [nameError, setNameError] = useState('');
  const hasRequiredDocs = Boolean(projectDocId && checklistDocId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Programme name is required');
      return;
    }
    onAdd(
      createScanningProgramme({
        name,
        description,
        projectDocId,
        projectDocTitle,
        checklistDocId,
        checklistDocTitle,
        userGroups,
      }),
    );
  };

  return (
    <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Add programme</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add a programme and start the compliance audit
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col min-h-0 flex-1">
          <div className="px-4 sm:px-6 py-5 space-y-4 overflow-y-auto flex-1 min-h-0">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name <span className="text-destructive-text">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError('');
                }}
                placeholder="e.g. Somalia Humanitarian Assistance and Resilience Programme"
                className={cn(
                  'w-full px-3 py-2.5 rounded-lg border bg-input-background text-sm text-foreground placeholder:text-text-subtle transition-colors focus:outline-none focus:border-primary',
                  nameError ? 'border-destructive-text' : 'border-border',
                )}
              />
              {nameError && <p className="mt-1 text-xs text-destructive-text">{nameError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the programme…"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-text-subtle transition-colors focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Project document
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (can be added later)
                </span>
              </label>
              <ResourcePicker
                placeholder="Select a resource"
                selectedId={projectDocId}
                onSelect={(id, title) => {
                  setProjectDocId(id);
                  setProjectDocTitle(title);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Checklist document
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (can be added later)
                </span>
              </label>
              <ResourcePicker
                placeholder="Select checklist document"
                selectedId={checklistDocId}
                onSelect={(id, title) => {
                  setChecklistDocId(id);
                  setChecklistDocTitle(title);
                }}
              />
            </div>

            <ReportUserGroupSelect
              selected={userGroups}
              onChange={setUserGroups}
              placement="above"
              helperText="Only selected groups can access this programme audit. Leave empty to make it visible to everyone with workflow access."
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-border bg-muted/40 rounded-b-2xl shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              {hasRequiredDocs ? (
                <>
                  <Sparkles size={16} />
                  Start audit
                </>
              ) : (
                'Add programme'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
