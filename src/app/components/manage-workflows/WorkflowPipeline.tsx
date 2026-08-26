import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  Link2,
  ListChecks,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  WorkflowDefinition,
  WorkflowPipelineStep,
  WorkflowTriggerSourceConfig,
} from '../../data/workflowAdminMock';
import {
  DEFAULT_TRIGGER_SOURCES,
  LINKABLE_WORKFLOW_DATASETS,
  LINKABLE_WORKFLOW_RESOURCES,
} from '../../data/workflowAdminMock';
import {
  insertPipelineStepAfter,
  pipelineAssumptions,
  pipelineDraftSummary,
  removePipelineStep,
  setPipelineStepKind,
  updatePipelineStep,
  WORKFLOW_GENERATION_STEPS,
} from '../../data/workflowAiMock';
import { Button } from '../ui/button';
import { WizardStepHeader } from './WorkflowWizard';
import { cn } from '../ui/utils';

interface WorkflowPipelineProps {
  definition: WorkflowDefinition;
  generating: boolean;
  generationDone: boolean;
  recordType?: string;
  onChange: (definition: WorkflowDefinition) => void;
  onRegenerate: () => void;
}

const fieldLabelClass =
  'mb-1.5 mt-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const fieldInputClass =
  'w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary';

const TRIGGER_SOURCE_OPTIONS = [...DEFAULT_TRIGGER_SOURCES] as string[];
const CONNECT_OTHER_SOURCE = 'Connect another source';

function kindIcon(kind: WorkflowPipelineStep['kind']) {
  switch (kind) {
    case 'trigger':
      return Play;
    case 'condition':
      return GitBranch;
    case 'action':
      return Zap;
    case 'output':
      return ListChecks;
    default:
      return Shield;
  }
}

function kindBadge(step: WorkflowPipelineStep): string {
  if (step.kind === 'check') return step.agent || 'Check';
  return step.kind.toUpperCase();
}

function kindBadgeClass(kind: WorkflowPipelineStep['kind'], isOutput: boolean): string {
  if (isOutput) return 'bg-white/20 text-white';
  if (kind === 'condition') return 'bg-warning-subtle text-warning-text';
  return 'bg-primary/10 text-primary';
}

function kindIconWrapClass(kind: WorkflowPipelineStep['kind'], isOutput: boolean): string {
  if (isOutput) return 'bg-white/20 text-white';
  if (kind === 'condition') return 'bg-warning-subtle text-warning-text';
  if (kind === 'trigger') return 'bg-muted text-muted-foreground';
  return 'bg-primary/10 text-primary';
}

function triggerSources(step: WorkflowPipelineStep): string[] {
  return step.sources ?? [...DEFAULT_TRIGGER_SOURCES];
}

export function WorkflowPipeline({
  definition,
  generating,
  generationDone,
  recordType,
  onChange,
  onRegenerate,
}: WorkflowPipelineProps) {
  const steps = definition.steps ?? [];
  const [openId, setOpenId] = useState<string | null>(
    steps.find((s) => s.kind === 'check')?.id ?? steps[0]?.id ?? null,
  );
  const [linkDraft, setLinkDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!openId || steps.some((s) => s.id === openId)) return;
    setOpenId(steps.find((s) => s.kind === 'check')?.id ?? steps[0]?.id ?? null);
  }, [steps, openId]);

  const patchStep = (id: string, patch: Partial<WorkflowPipelineStep>) => {
    onChange(updatePipelineStep(definition, id, patch));
  };

  const addAfter = (afterId: string) => {
    const next = insertPipelineStepAfter(definition, afterId);
    onChange(next);
    const inserted = next.steps.find((s, i) => {
      const prevIdx = steps.findIndex((p) => p.id === afterId);
      return i === prevIdx + 1;
    });
    if (inserted) setOpenId(inserted.id);
  };

  const canRemoveStep = steps.length > 1;

  const removeStep = (stepId: string) => {
    if (!canRemoveStep) return;
    if (!window.confirm('Remove this step from the workflow?')) return;
    onChange(removePipelineStep(definition, stepId));
  };

  return (
    <div>
      <WizardStepHeader
        step={2}
        title="Design the workflow"
        description={
          generationDone
            ? 'The AI mapped your description into steps. Click any step to edit its prompt and connect a data source — add steps or a condition anywhere with the +.'
            : 'The AI is mapping your description into steps. Click any step to edit its prompt and connect a data source.'
        }
      />

      <div className="mb-5 rounded-xl border border-border bg-muted/40 px-5 py-4">
        {generating && !generationDone ? (
          <div className="space-y-2">
            {WORKFLOW_GENERATION_STEPS.map((row, i) => (
              <GenerationRow
                key={row.id}
                label={
                  row.id === 'record' && recordType
                    ? `Identifying record type: ${recordType}`
                    : row.label
                }
                delayMs={i * 280}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-primary">{pipelineDraftSummary(definition)}</p>
        )}
      </div>

      {generationDone ? (
        <>
          <div className="space-y-0">
            {steps.map((s, index) => (
              <div key={s.id}>
                <PipelineStepCard
                  step={s}
                  open={openId === s.id}
                  onToggle={() => setOpenId(openId === s.id ? null : s.id)}
                  onPatch={(patch) => patchStep(s.id, patch)}
                  onSetKind={(kind) => onChange(setPipelineStepKind(definition, s.id, kind))}
                  canRemove={canRemoveStep}
                  onRemove={() => removeStep(s.id)}
                  linkDraft={linkDraft[s.id] ?? ''}
                  onLinkDraftChange={(v) => setLinkDraft((prev) => ({ ...prev, [s.id]: v }))}
                  onAddLink={() => {
                    const v = (linkDraft[s.id] ?? '').trim();
                    if (!v) return;
                    patchStep(s.id, { links: [...(s.links ?? []), v] });
                    setLinkDraft((prev) => ({ ...prev, [s.id]: '' }));
                  }}
                  onAddFile={(title) => {
                    if ((s.files ?? []).includes(title)) return;
                    patchStep(s.id, { files: [...(s.files ?? []), title] });
                  }}
                />
                {index < steps.length - 1 ? (
                  <div className="relative flex h-9 items-center justify-center">
                    <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-border" />
                    <button
                      type="button"
                      title="Add a step"
                      onClick={() => addAfter(s.id)}
                      className="relative z-[1] flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertTriangle size={16} />
              Assumptions — check these
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-amber-950/80">
              {pipelineAssumptions(definition.recipeId).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex justify-center">
            <Button type="button" variant="outline" onClick={onRegenerate}>
              <RefreshCw size={15} />
              Regenerate
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function GenerationRow({ label, delayMs }: { label: string; delayMs: number }) {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), delayMs);
    const tick = window.setTimeout(() => setDone(true), delayMs + 340);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(tick);
    };
  }, [delayMs]);

  const colon = label.indexOf(':');
  const before = colon >= 0 ? label.slice(0, colon + 1) : label;
  const after = colon >= 0 ? label.slice(colon + 1).trim() : '';

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 text-sm text-muted-foreground transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
      )}
    >
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted',
        )}
      >
        {done ? '✓' : null}
      </span>
      <span>
        {before}
        {after ? (
          <>
            {' '}
            <b className="font-semibold text-foreground">{after}</b>
          </>
        ) : null}
      </span>
    </div>
  );
}

interface PipelineStepCardProps {
  step: WorkflowPipelineStep;
  open: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<WorkflowPipelineStep>) => void;
  onSetKind: (kind: WorkflowPipelineStep['kind']) => void;
  canRemove: boolean;
  onRemove: () => void;
  linkDraft: string;
  onLinkDraftChange: (v: string) => void;
  onAddLink: () => void;
  onAddFile: (title: string) => void;
}

function PipelineStepCard({
  step,
  open,
  onToggle,
  onPatch,
  onSetKind,
  canRemove,
  onRemove,
  linkDraft,
  onLinkDraftChange,
  onAddLink,
  onAddFile,
}: PipelineStepCardProps) {
  const Icon = kindIcon(step.kind);
  const isOutput = step.kind === 'output';
  const isTrigger = step.kind === 'trigger';
  const preview = step.prompt || 'Describe what this step should check or do…';
  const showTypeSwitch = step.kind === 'check' || step.kind === 'condition' || step.kind === 'action';
  const showStepTitle = showTypeSwitch;
  const [dragging, setDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploadPickerOpen, setUploadPickerOpen] = useState(false);
  const [uploadDragging, setUploadDragging] = useState(false);
  const [otherPickerOpen, setOtherPickerOpen] = useState(false);
  const [spLinkDraft, setSpLinkDraft] = useState('');
  const [odLinkDraft, setOdLinkDraft] = useState('');

  const sources = triggerSources(step);
  const sourceConfig = step.sourceConfig ?? {};

  const patchSourceConfig = (partial: Partial<WorkflowTriggerSourceConfig>) => {
    onPatch({
      sourceConfig: {
        ...step.sourceConfig,
        ...partial,
      },
    });
  };

  const toggleSource = (src: string) => {
    const current = triggerSources(step);
    const next = current.includes(src)
      ? current.filter((s) => s !== src)
      : [...current, src];
    onPatch({ sources: next });
  };

  const attachFromDrop = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((file) => onAddFile(file.name));
  };

  const attachTriggerUpload = (title: string, resourceId?: string) => {
    const upload = step.sourceConfig?.upload ?? {};
    if (resourceId) {
      if (upload.resourceId === resourceId) return;
      patchSourceConfig({
        upload: { ...upload, resourceId, title },
      });
      return;
    }
    const files = upload.files ?? [];
    if (files.includes(title) || upload.title === title) return;
    patchSourceConfig({
      upload: { ...upload, files: [...files, title] },
    });
  };

  const attachTriggerUploadDrop = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const upload = step.sourceConfig?.upload ?? {};
    const existing = upload.files ?? [];
    const next = [...existing];
    Array.from(fileList).forEach((file) => {
      if (!next.includes(file.name) && upload.title !== file.name) next.push(file.name);
    });
    if (next.length === existing.length) return;
    patchSourceConfig({
      upload: { ...upload, files: next },
    });
  };

  const addSourceLink = (kind: 'sharepoint' | 'onedrive', raw: string) => {
    const v = raw.trim();
    if (!v) return;
    const existing = sourceConfig[kind]?.links ?? [];
    if (existing.includes(v)) return;
    patchSourceConfig({
      [kind]: { links: [...existing, v] },
    });
    if (kind === 'sharepoint') setSpLinkDraft('');
    else setOdLinkDraft('');
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors',
        isOutput ? 'border-primary' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3.5 text-left',
          isOutput && 'bg-primary text-white',
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            kindIconWrapClass(step.kind, isOutput),
          )}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold', isOutput ? 'text-white' : 'text-foreground')}>
            {step.title}
          </p>
          <p
            className={cn(
              'mt-0.5 truncate text-xs',
              isOutput ? 'text-white/80' : 'text-muted-foreground',
            )}
          >
            {preview.slice(0, 100)}
            {preview.length > 100 ? '…' : ''}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            kindBadgeClass(step.kind, isOutput),
          )}
        >
          {kindBadge(step)}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 transition-transform',
            open && 'rotate-180',
            isOutput ? 'text-white/80' : 'text-muted-foreground',
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-border bg-card px-4 pb-4 pt-1">
          {showTypeSwitch ? (
            <div className="mt-3 inline-flex rounded-lg bg-secondary p-1">
              {(['check', 'condition', 'action'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => onSetKind(k)}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-[11px] font-semibold capitalize transition-colors',
                    step.kind === k
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {k === 'check' ? 'Check step' : k}
                </button>
              ))}
            </div>
          ) : null}

          <label className={fieldLabelClass}>Prompt</label>
          <textarea
            rows={4}
            value={step.prompt}
            onChange={(e) => onPatch({ prompt: e.target.value })}
            placeholder="Describe what this step should check or do…"
            className={cn(fieldInputClass, 'min-h-[88px] resize-y leading-relaxed')}
          />

          {isTrigger ? (
            <div>
              <label className={fieldLabelClass}>Where documents come from</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {[...TRIGGER_SOURCE_OPTIONS, CONNECT_OTHER_SOURCE].map((src) => {
                  const on = sources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => {
                        const wasOn = sources.includes(src);
                        toggleSource(src);
                        if (!wasOn && src === CONNECT_OTHER_SOURCE) {
                          toast('Opens the data source connector');
                        }
                      }}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-[11px] border px-3 py-2 text-xs font-medium transition-colors',
                        on
                          ? 'border-primary/25 bg-primary/10 text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border-[1.5px]',
                          on
                            ? 'border-primary bg-primary text-white'
                            : 'border-muted-foreground/40 bg-transparent',
                        )}
                      >
                        {on ? <Check size={10} strokeWidth={3} /> : null}
                      </span>
                      {src}
                    </button>
                  );
                })}
              </div>

              {sources.includes('Upload') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Upload — select a resource
                  </div>
                  <div className="relative">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setUploadPickerOpen((v) => !v)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setUploadPickerOpen((v) => !v);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setUploadDragging(true);
                      }}
                      onDragLeave={() => setUploadDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setUploadDragging(false);
                        setUploadPickerOpen(false);
                        attachTriggerUploadDrop(e.dataTransfer.files);
                      }}
                      className={cn(
                        'cursor-pointer rounded-xl border-[1.5px] border-dashed px-4 py-3.5 text-center transition-colors',
                        uploadDragging
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary hover:bg-primary/5',
                      )}
                    >
                      <Upload size={18} className="mx-auto mb-1.5 text-muted-foreground" />
                      <p className="text-[12.5px] font-medium text-muted-foreground">
                        <span className="font-semibold text-primary">Click to select</span> or
                        drag a file here
                      </p>
                    </div>
                    {uploadPickerOpen ? (
                      <div className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-md">
                        {LINKABLE_WORKFLOW_RESOURCES.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              attachTriggerUpload(r.title, r.id);
                              setUploadPickerOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                          >
                            <FileText size={14} className="shrink-0 text-primary" />
                            <span className="truncate">{r.title}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {(sourceConfig.upload?.title || (sourceConfig.upload?.files ?? []).length > 0) ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {sourceConfig.upload?.title ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground">
                          <FileText size={12} className="text-primary" />
                          {sourceConfig.upload.title}
                          <button
                            type="button"
                            aria-label={`Remove ${sourceConfig.upload.title}`}
                            onClick={() =>
                              patchSourceConfig({
                                upload: {
                                  ...sourceConfig.upload,
                                  resourceId: undefined,
                                  title: undefined,
                                },
                              })
                            }
                            className="ml-0.5 text-muted-foreground hover:text-destructive-text"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ) : null}
                      {(sourceConfig.upload?.files ?? []).map((f) => (
                        <span
                          key={f}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <FileText size={12} className="text-primary" />
                          {f}
                          <button
                            type="button"
                            aria-label={`Remove ${f}`}
                            onClick={() =>
                              patchSourceConfig({
                                upload: {
                                  ...sourceConfig.upload,
                                  files: (sourceConfig.upload?.files ?? []).filter((x) => x !== f),
                                },
                              })
                            }
                            className="ml-0.5 text-muted-foreground hover:text-destructive-text"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {sources.includes('SharePoint') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    SharePoint — folder or site link
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spLinkDraft}
                      onChange={(e) => setSpLinkDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSourceLink('sharepoint', spLinkDraft);
                        }
                      }}
                      placeholder="Paste a SharePoint folder or site link"
                      className={fieldInputClass}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSourceLink('sharepoint', spLinkDraft)}
                    >
                      Add
                    </Button>
                  </div>
                  {(sourceConfig.sharepoint?.links ?? []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(sourceConfig.sharepoint?.links ?? []).map((l) => (
                        <span
                          key={l}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <Link2 size={12} className="shrink-0 text-primary" />
                          <span className="truncate">{l}</span>
                          <button
                            type="button"
                            aria-label="Remove SharePoint link"
                            onClick={() =>
                              patchSourceConfig({
                                sharepoint: {
                                  links: (sourceConfig.sharepoint?.links ?? []).filter(
                                    (x) => x !== l,
                                  ),
                                },
                              })
                            }
                            className="ml-0.5 shrink-0 text-muted-foreground hover:text-destructive-text"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {sources.includes('OneDrive') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    OneDrive — folder link
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={odLinkDraft}
                      onChange={(e) => setOdLinkDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSourceLink('onedrive', odLinkDraft);
                        }
                      }}
                      placeholder="Paste a OneDrive folder link"
                      className={fieldInputClass}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSourceLink('onedrive', odLinkDraft)}
                    >
                      Add
                    </Button>
                  </div>
                  {(sourceConfig.onedrive?.links ?? []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(sourceConfig.onedrive?.links ?? []).map((l) => (
                        <span
                          key={l}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <Link2 size={12} className="shrink-0 text-primary" />
                          <span className="truncate">{l}</span>
                          <button
                            type="button"
                            aria-label="Remove OneDrive link"
                            onClick={() =>
                              patchSourceConfig({
                                onedrive: {
                                  links: (sourceConfig.onedrive?.links ?? []).filter(
                                    (x) => x !== l,
                                  ),
                                },
                              })
                            }
                            className="ml-0.5 shrink-0 text-muted-foreground hover:text-destructive-text"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {sources.includes(CONNECT_OTHER_SOURCE) ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Connect another source — pick a dataset
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOtherPickerOpen((v) => !v)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors',
                        otherPickerOpen
                          ? 'border-primary bg-card'
                          : 'border-border bg-card hover:border-primary/50',
                        sourceConfig.other?.label
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      <span className="truncate">
                        {sourceConfig.other?.label ?? 'Select a linked dataset…'}
                      </span>
                      <ChevronDown
                        size={15}
                        className={cn(
                          'shrink-0 text-muted-foreground transition-transform',
                          otherPickerOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    {otherPickerOpen ? (
                      <div className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-md">
                        {LINKABLE_WORKFLOW_DATASETS.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              patchSourceConfig({
                                other: { datasetId: d.id, label: d.title },
                              });
                              setOtherPickerOpen(false);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                          >
                            <Zap size={14} className="shrink-0 text-primary" />
                            <span className="truncate">{d.title}</span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  {sourceConfig.other?.label ? (
                    <div className="mt-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground">
                        <Zap size={12} className="text-primary" />
                        {sourceConfig.other.label}
                        <button
                          type="button"
                          aria-label="Clear dataset"
                          onClick={() =>
                            patchSourceConfig({
                              other: { datasetId: undefined, label: undefined },
                            })
                          }
                          className="ml-0.5 text-muted-foreground hover:text-destructive-text"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11.5px] text-muted-foreground">
                      Or connect a custom API / feed via the connector dialog (mock).
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {step.kind === 'check' ? (
            <div>
              <label className={fieldLabelClass}>Reference checklist or framework</label>
              <div className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setPickerOpen((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPickerOpen((v) => !v);
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    setPickerOpen(false);
                    attachFromDrop(e.dataTransfer.files);
                  }}
                  className={cn(
                    'cursor-pointer rounded-xl border-[1.5px] border-dashed px-4 py-4 text-center transition-colors',
                    dragging
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/20 hover:border-primary hover:bg-primary/5',
                  )}
                >
                  <Upload size={20} className="mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-[12.5px] font-medium text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag a
                    file here
                  </p>
                </div>
                {pickerOpen ? (
                  <div className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-md">
                    {LINKABLE_WORKFLOW_RESOURCES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          onAddFile(r.title);
                          setPickerOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                      >
                        <FileText size={14} className="shrink-0 text-primary" />
                        <span className="truncate">{r.title}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              {(step.files ?? []).length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {(step.files ?? []).map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground"
                    >
                      <FileText size={12} className="text-primary" />
                      {f}
                      <button
                        type="button"
                        aria-label={`Remove ${f}`}
                        onClick={() =>
                          onPatch({ files: (step.files ?? []).filter((x) => x !== f) })
                        }
                        className="ml-0.5 text-muted-foreground hover:text-destructive-text"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              <label className={fieldLabelClass}>Where evidence comes from</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={linkDraft}
                  onChange={(e) => onLinkDraftChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddLink();
                    }
                  }}
                  placeholder="Paste a SharePoint or OneDrive link"
                  className={fieldInputClass}
                />
                <Button type="button" variant="outline" onClick={onAddLink}>
                  Add
                </Button>
              </div>
              {(step.links ?? []).length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(step.links ?? []).map((l) => (
                    <span
                      key={l}
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-foreground"
                    >
                      <Link2 size={12} className="shrink-0 text-primary" />
                      <span className="truncate">{l}</span>
                      <button
                        type="button"
                        aria-label="Remove link"
                        onClick={() =>
                          onPatch({ links: (step.links ?? []).filter((x) => x !== l) })
                        }
                        className="ml-0.5 shrink-0 text-muted-foreground hover:text-destructive-text"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {step.kind === 'condition' ? (
            <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-xl bg-warning-subtle px-3.5 py-3">
                <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-warning-text">
                  If yes
                </div>
                <input
                  type="text"
                  value={step.conditionYes ?? ''}
                  onChange={(e) => onPatch({ conditionYes: e.target.value })}
                  className="w-full border-0 bg-transparent text-[12.5px] font-medium text-foreground outline-none placeholder:text-warning-text/50"
                  placeholder="Send an alert"
                />
              </div>
              <div className="rounded-xl bg-success-subtle px-3.5 py-3">
                <div className="mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-success-text">
                  If no
                </div>
                <input
                  type="text"
                  value={step.conditionNo ?? ''}
                  onChange={(e) => onPatch({ conditionNo: e.target.value })}
                  className="w-full border-0 bg-transparent text-[12.5px] font-medium text-foreground outline-none placeholder:text-success-text/50"
                  placeholder="Continue as normal"
                />
              </div>
            </div>
          ) : null}

          {step.kind === 'action' ? (
            <div>
              <label className={fieldLabelClass}>Notify</label>
              <input
                type="text"
                value={step.notify ?? ''}
                onChange={(e) => onPatch({ notify: e.target.value })}
                placeholder="Who or what gets notified — an email, a Slack channel, a team"
                className={fieldInputClass}
              />
            </div>
          ) : null}

          {isOutput ? (
            <div className="mt-3 space-y-0 rounded-xl border border-border bg-muted/40 px-4">
              <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-sm text-foreground">
                <span className="font-medium">Alert threshold</span>
                <input
                  type="text"
                  value={`${step.threshold ?? 70}%`}
                  onChange={(e) => {
                    const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                    onPatch({ threshold: Number.isFinite(n) ? n : 70 });
                  }}
                  className="w-20 rounded-lg border border-border bg-white px-2 py-1 text-right text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              {(
                [
                  ['uploadEvidence', 'Upload evidence'],
                  ['actionPlan', 'Action plan'],
                  ['leadershipSummary', 'Leadership summary'],
                  ['donorBriefing', 'Donor briefing export'],
                ] as const
              ).map(([key, label], i, arr) => {
                const on = step.outputToggles?.[key] ?? key !== 'donorBriefing';
                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center justify-between gap-3 py-2.5 text-sm text-foreground',
                      i < arr.length - 1 && 'border-b border-border',
                    )}
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onPatch({
                          outputToggles: {
                            uploadEvidence: true,
                            actionPlan: true,
                            leadershipSummary: true,
                            donorBriefing: false,
                            ...step.outputToggles,
                            [key]: !on,
                          },
                        })
                      }
                      className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                        on
                          ? 'bg-primary text-white'
                          : 'border border-border bg-white text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {on ? 'On' : 'Turn on'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}

          {showStepTitle ? (
            <div className="mt-3">
              <label className={fieldLabelClass}>Step title</label>
              <input
                type="text"
                value={step.title}
                onChange={(e) => onPatch({ title: e.target.value })}
                className={fieldInputClass}
              />
            </div>
          ) : null}

          {canRemove ? (
            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                aria-label="Remove step"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-destructive-text hover:bg-destructive-subtle hover:text-destructive-text"
              >
                <Trash2 size={14} />
                Remove step
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
