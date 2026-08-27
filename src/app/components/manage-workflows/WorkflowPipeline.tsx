import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileText,
  GitBranch,
  Hash,
  Link2,
  ListChecks,
  Mail,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type {
  WorkflowDefinition,
  WorkflowNotifyChannel,
  WorkflowNotifyConfig,
  WorkflowPipelineStep,
  WorkflowTriggerSourceConfig,
} from '../../data/workflowAdminMock';
import {
  DOCUMENT_SOURCE_OPTIONS,
  LINKABLE_WORKFLOW_RESOURCES,
  serializeNotifyConfig,
  WORKFLOW_NOTIFY_PEOPLE,
  WORKFLOW_SLACK_CHANNELS,
} from '../../data/workflowAdminMock';
import {
  insertPipelineStepAfter,
  pipelineAssumptions,
  removePipelineStep,
  setPipelineStepKind,
  stepNeedsSetup,
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

const SOURCE_OPTIONS = [...DOCUMENT_SOURCE_OPTIONS] as string[];

const NOTIFY_CHANNEL_OPTIONS: {
  id: WorkflowNotifyChannel;
  label: string;
  icon: typeof Users;
}[] = [
  { id: 'people', label: 'People', icon: Users },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'slack', label: 'Slack', icon: Hash },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeSlackChannel(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  return t.startsWith('#') ? t : `#${t}`;
}

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

function stepSources(step: WorkflowPipelineStep): string[] {
  return step.sources ?? [];
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
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!openId || steps.some((s) => s.id === openId)) return;
    setOpenId(null);
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

      {generating && !generationDone ? (
        <div className="mb-5 rounded-xl border border-border bg-white px-5 py-4">
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
        </div>
      ) : null}

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
}

function PipelineStepCard({
  step,
  open,
  onToggle,
  onPatch,
  onSetKind,
  canRemove,
  onRemove,
}: PipelineStepCardProps) {
  const Icon = kindIcon(step.kind);
  const isOutput = step.kind === 'output';
  const needsSetup = stepNeedsSetup(step);
  const preview = step.prompt || 'Describe what this step should check or do…';
  const showTypeSwitch = step.kind === 'check' || step.kind === 'condition' || step.kind === 'action';
  const [uploadDragging, setUploadDragging] = useState(false);
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  const [spLinkDraft, setSpLinkDraft] = useState('');
  const [urlLinkDraft, setUrlLinkDraft] = useState('');
  const [peoplePickerOpen, setPeoplePickerOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [slackDraft, setSlackDraft] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(step.title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const resourcePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editingTitle) setTitleDraft(step.title);
  }, [step.title, editingTitle]);

  useEffect(() => {
    if (!editingTitle) return;
    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [editingTitle]);

  useEffect(() => {
    if (!resourcePickerOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (resourcePickerRef.current?.contains(e.target as Node)) return;
      setResourcePickerOpen(false);
      setResourceSearch('');
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [resourcePickerOpen]);

  const filteredLinkableResources = LINKABLE_WORKFLOW_RESOURCES.filter((r) =>
    r.title.toLowerCase().includes(resourceSearch.trim().toLowerCase()),
  );

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next && next !== step.title) onPatch({ title: next });
    else setTitleDraft(step.title);
    setEditingTitle(false);
  };

  const sources = stepSources(step);
  const sourceConfig = step.sourceConfig ?? {};
  const showDocumentSources = step.kind === 'trigger' || step.kind === 'check';

  const patchSourceConfig = (partial: Partial<WorkflowTriggerSourceConfig>) => {
    onPatch({
      sourceConfig: {
        ...step.sourceConfig,
        ...partial,
      },
    });
  };

  const toggleSource = (src: string) => {
    const current = stepSources(step);
    const next = current.includes(src)
      ? current.filter((s) => s !== src)
      : [...current, src];
    onPatch({ sources: next });
  };

  const attachUploadDrop = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const upload = step.sourceConfig?.upload ?? {};
    const existing = upload.files ?? [];
    const next = [...existing];
    Array.from(fileList).forEach((file) => {
      if (!next.includes(file.name)) next.push(file.name);
    });
    if (next.length === existing.length) return;
    patchSourceConfig({
      upload: { ...upload, files: next },
    });
  };

  const attachExistingResource = (id: string, title: string) => {
    const items = sourceConfig.existingResources?.items ?? [];
    if (items.some((r) => r.id === id)) return;
    patchSourceConfig({
      existingResources: { items: [...items, { id, title }] },
    });
  };

  const addSourceLink = (kind: 'sharepoint' | 'urlSources', raw: string) => {
    const v = raw.trim();
    if (!v) return;
    const existing = sourceConfig[kind]?.links ?? [];
    if (existing.includes(v)) return;
    patchSourceConfig({
      [kind]: { links: [...existing, v] },
    });
    if (kind === 'sharepoint') setSpLinkDraft('');
    else setUrlLinkDraft('');
  };

  const notifyConfig: WorkflowNotifyConfig = step.notifyConfig ?? { channels: [] };

  const patchNotifyConfig = (partial: Partial<WorkflowNotifyConfig>) => {
    const next: WorkflowNotifyConfig = {
      ...notifyConfig,
      ...partial,
      channels: partial.channels ?? notifyConfig.channels,
    };
    onPatch({
      notifyConfig: next,
      notify: serializeNotifyConfig(next),
    });
  };

  const toggleNotifyChannel = (channel: WorkflowNotifyChannel) => {
    const on = notifyConfig.channels.includes(channel);
    const channels = on
      ? notifyConfig.channels.filter((c) => c !== channel)
      : [...notifyConfig.channels, channel];
    patchNotifyConfig({ channels });
  };

  const toggleNotifyPerson = (id: string) => {
    const current = notifyConfig.people ?? [];
    const people = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    patchNotifyConfig({ people });
  };

  const addNotifyEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email || !isValidEmail(email)) return;
    const existing = notifyConfig.emails ?? [];
    if (existing.includes(email)) {
      setEmailDraft('');
      return;
    }
    patchNotifyConfig({ emails: [...existing, email] });
    setEmailDraft('');
  };

  const addNotifySlack = (raw: string) => {
    const channel = normalizeSlackChannel(raw);
    if (!channel || channel === '#') return;
    const existing = notifyConfig.slackChannels ?? [];
    if (existing.includes(channel)) {
      setSlackDraft('');
      return;
    }
    patchNotifyConfig({ slackChannels: [...existing, channel] });
    setSlackDraft('');
  };

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors',
        isOutput ? 'border-primary' : 'border-border',
      )}
    >
      <div
        className={cn(
          'flex w-full items-center gap-3 px-4 py-3.5 text-left',
          isOutput && 'bg-primary text-white',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            kindIconWrapClass(step.kind, isOutput),
          )}
          aria-label={open ? 'Collapse step' : 'Expand step'}
        >
          <Icon size={18} />
        </button>
        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitTitle();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  setTitleDraft(step.title);
                  setEditingTitle(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'w-full rounded-lg border px-2 py-1 text-sm font-semibold outline-none',
                isOutput
                  ? 'border-white/40 bg-white/15 text-white placeholder:text-white/60'
                  : 'border-primary/40 bg-white text-foreground',
              )}
              aria-label="Step title"
            />
          ) : (
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onToggle}
                className={cn(
                  'min-w-0 truncate text-left text-sm font-semibold',
                  isOutput ? 'text-white' : 'text-foreground',
                )}
              >
                {step.title}
              </button>
              <button
                type="button"
                aria-label="Edit step title"
                onClick={(e) => {
                  e.stopPropagation();
                  setTitleDraft(step.title);
                  setEditingTitle(true);
                }}
                className={cn(
                  'shrink-0 rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100',
                  isOutput
                    ? 'text-white/80 hover:bg-white/15 hover:text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'mt-0.5 block w-full truncate text-left text-xs',
              isOutput ? 'text-white/80' : 'text-muted-foreground',
            )}
          >
            {preview.slice(0, 100)}
            {preview.length > 100 ? '…' : ''}
          </button>
        </div>
        {needsSetup ? (
          <span
            className="shrink-0 text-destructive-text"
            title="This step needs setup"
            aria-label="This step needs setup"
          >
            <AlertTriangle size={16} />
          </span>
        ) : null}
        <button type="button" onClick={onToggle} className="shrink-0">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              kindBadgeClass(step.kind, isOutput),
            )}
          >
            {kindBadge(step)}
          </span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? 'Collapse step' : 'Expand step'}
          className="shrink-0"
        >
          <ChevronDown
            size={16}
            className={cn(
              'transition-transform',
              open && 'rotate-180',
              isOutput ? 'text-white/80' : 'text-muted-foreground',
            )}
          />
        </button>
      </div>

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

          {showDocumentSources ? (
            <div>
              <label className={fieldLabelClass}>Where documents come from</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((src) => {
                  const on = sources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => toggleSource(src)}
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
                    Upload files
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setUploadDragging(true);
                    }}
                    onDragLeave={() => setUploadDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setUploadDragging(false);
                      attachUploadDrop(e.dataTransfer.files);
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = () => attachUploadDrop(input.files);
                      input.click();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.onchange = () => attachUploadDrop(input.files);
                        input.click();
                      }
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
                      <span className="font-semibold text-primary">Click to upload</span> or drag a
                      file here
                    </p>
                  </div>
                  {(sourceConfig.upload?.files ?? []).length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
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

              {sources.includes('Existing resources') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Existing resources
                  </div>
                  <div className="relative" ref={resourcePickerRef}>
                    <div
                      className={cn(
                        'flex w-full items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm transition-colors',
                        resourcePickerOpen
                          ? 'border-primary bg-card'
                          : 'border-border bg-card hover:border-primary/50',
                      )}
                    >
                      <input
                        type="text"
                        value={resourceSearch}
                        placeholder="Select from resources…"
                        aria-label="Search resources"
                        aria-expanded={resourcePickerOpen}
                        onFocus={() => setResourcePickerOpen(true)}
                        onClick={() => setResourcePickerOpen(true)}
                        onChange={(e) => {
                          setResourceSearch(e.target.value);
                          setResourcePickerOpen(true);
                        }}
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      />
                      <ChevronDown
                        size={15}
                        className={cn(
                          'shrink-0 text-muted-foreground transition-transform',
                          resourcePickerOpen && 'rotate-180',
                        )}
                      />
                    </div>
                    {resourcePickerOpen ? (
                      <div className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-48 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-md">
                        {filteredLinkableResources.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">
                            No resources found.
                          </p>
                        ) : (
                          filteredLinkableResources.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                attachExistingResource(r.id, r.title);
                                setResourcePickerOpen(false);
                                setResourceSearch('');
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                            >
                              <FileText size={14} className="shrink-0 text-primary" />
                              <span className="truncate">{r.title}</span>
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                  {(sourceConfig.existingResources?.items ?? []).length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(sourceConfig.existingResources?.items ?? []).map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <FileText size={12} className="text-primary" />
                          {r.title}
                          <button
                            type="button"
                            aria-label={`Remove ${r.title}`}
                            onClick={() =>
                              patchSourceConfig({
                                existingResources: {
                                  items: (sourceConfig.existingResources?.items ?? []).filter(
                                    (x) => x.id !== r.id,
                                  ),
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

              {sources.includes('Url sources') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Url sources
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={urlLinkDraft}
                      onChange={(e) => setUrlLinkDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSourceLink('urlSources', urlLinkDraft);
                        }
                      }}
                      placeholder="Paste a URL (OneDrive, web link, etc.)"
                      className={fieldInputClass}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addSourceLink('urlSources', urlLinkDraft)}
                    >
                      Add
                    </Button>
                  </div>
                  {(sourceConfig.urlSources?.links ?? []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(sourceConfig.urlSources?.links ?? []).map((l) => (
                        <span
                          key={l}
                          className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <Link2 size={12} className="shrink-0 text-primary" />
                          <span className="truncate">{l}</span>
                          <button
                            type="button"
                            aria-label="Remove URL"
                            onClick={() =>
                              patchSourceConfig({
                                urlSources: {
                                  links: (sourceConfig.urlSources?.links ?? []).filter(
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
            </div>
          ) : null}

          {step.kind === 'condition' ? (
            <div className="mt-3.5">
              <p className="mb-2 text-[11.5px] text-muted-foreground">
                Describe what happens on each branch
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl bg-warning-subtle px-3.5 py-3">
                  <label
                    htmlFor={`condition-yes-${step.id}`}
                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-warning-text"
                  >
                    If yes
                  </label>
                  <input
                    id={`condition-yes-${step.id}`}
                    type="text"
                    value={step.conditionYes ?? ''}
                    onChange={(e) => onPatch({ conditionYes: e.target.value })}
                    className="w-full border-0 bg-transparent p-0 text-[12.5px] font-medium text-foreground outline-none ring-0 placeholder:text-warning-text/45"
                    placeholder="e.g. Alert leadership + PSEA network"
                  />
                </div>
                <div className="rounded-xl bg-success-subtle px-3.5 py-3">
                  <label
                    htmlFor={`condition-no-${step.id}`}
                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-wide text-success-text"
                  >
                    If no
                  </label>
                  <input
                    id={`condition-no-${step.id}`}
                    type="text"
                    value={step.conditionNo ?? ''}
                    onChange={(e) => onPatch({ conditionNo: e.target.value })}
                    className="w-full border-0 bg-transparent p-0 text-[12.5px] font-medium text-foreground outline-none ring-0 placeholder:text-success-text/45"
                    placeholder="e.g. Continue to dashboard"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step.kind === 'action' ? (
            <div>
              <label className={fieldLabelClass}>Notify</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {NOTIFY_CHANNEL_OPTIONS.map(({ id, label, icon: ChannelIcon }) => {
                  const on = notifyConfig.channels.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleNotifyChannel(id)}
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
                      <ChannelIcon size={13} />
                      {label}
                    </button>
                  );
                })}
              </div>

              {notifyConfig.channels.includes('people') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    People on the platform
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPeoplePickerOpen((v) => !v)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors',
                        peoplePickerOpen
                          ? 'border-primary bg-card'
                          : 'border-border bg-card hover:border-primary/50',
                        'text-muted-foreground',
                      )}
                    >
                      <span className="truncate">
                        {(notifyConfig.people?.length ?? 0) > 0
                          ? `${notifyConfig.people!.length} selected`
                          : 'Select people or groups…'}
                      </span>
                      <ChevronDown
                        size={15}
                        className={cn(
                          'shrink-0 text-muted-foreground transition-transform',
                          peoplePickerOpen && 'rotate-180',
                        )}
                      />
                    </button>
                    {peoplePickerOpen ? (
                      <div className="absolute bottom-full left-0 right-0 z-10 mb-1 max-h-56 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-md">
                        {WORKFLOW_NOTIFY_PEOPLE.map((person) => {
                          const selected = (notifyConfig.people ?? []).includes(person.id);
                          return (
                            <button
                              key={person.id}
                              type="button"
                              onClick={() => toggleNotifyPerson(person.id)}
                              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-foreground hover:bg-primary/5"
                            >
                              <span
                                className={cn(
                                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px]',
                                  selected
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-muted-foreground/40 bg-transparent',
                                )}
                              >
                                {selected ? <Check size={10} strokeWidth={3} /> : null}
                              </span>
                              <Users size={14} className="shrink-0 text-primary" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{person.name}</span>
                                {person.detail ? (
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {person.kind === 'group' ? 'Group · ' : ''}
                                    {person.detail}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                  {(notifyConfig.people ?? []).length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(notifyConfig.people ?? []).map((id) => {
                        const person = WORKFLOW_NOTIFY_PEOPLE.find((p) => p.id === id);
                        const label = person?.name ?? id;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                          >
                            <Users size={12} className="text-primary" />
                            {label}
                            <button
                              type="button"
                              aria-label={`Remove ${label}`}
                              onClick={() =>
                                patchNotifyConfig({
                                  people: (notifyConfig.people ?? []).filter((x) => x !== id),
                                })
                              }
                              className="ml-0.5 text-muted-foreground hover:text-destructive-text"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {notifyConfig.channels.includes('email') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Email addresses
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addNotifyEmail(emailDraft);
                        }
                      }}
                      placeholder="name@organisation.org"
                      className={fieldInputClass}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addNotifyEmail(emailDraft)}
                    >
                      Add
                    </Button>
                  </div>
                  {(notifyConfig.emails ?? []).length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(notifyConfig.emails ?? []).map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <Mail size={12} className="text-primary" />
                          {email}
                          <button
                            type="button"
                            aria-label={`Remove ${email}`}
                            onClick={() =>
                              patchNotifyConfig({
                                emails: (notifyConfig.emails ?? []).filter((x) => x !== email),
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

              {notifyConfig.channels.includes('slack') ? (
                <div className="mt-3 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Slack channels
                  </div>
                  <div className="mb-2.5 flex flex-wrap gap-1.5">
                    {WORKFLOW_SLACK_CHANNELS.map((ch) => {
                      const on = (notifyConfig.slackChannels ?? []).includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            const current = notifyConfig.slackChannels ?? [];
                            patchNotifyConfig({
                              slackChannels: on
                                ? current.filter((x) => x !== ch)
                                : [...current, ch],
                            });
                          }}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors',
                            on
                              ? 'border-primary/25 bg-primary/10 text-primary'
                              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                          )}
                        >
                          <Hash size={11} />
                          {ch.replace(/^#/, '')}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={slackDraft}
                      onChange={(e) => setSlackDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addNotifySlack(slackDraft);
                        }
                      }}
                      placeholder="Or type a channel, e.g. #alerts"
                      className={fieldInputClass}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addNotifySlack(slackDraft)}
                    >
                      Add
                    </Button>
                  </div>
                  {(notifyConfig.slackChannels ?? []).length > 0 ? (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {(notifyConfig.slackChannels ?? []).map((ch) => (
                        <span
                          key={ch}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs text-foreground"
                        >
                          <Hash size={12} className="text-primary" />
                          {ch}
                          <button
                            type="button"
                            aria-label={`Remove ${ch}`}
                            onClick={() =>
                              patchNotifyConfig({
                                slackChannels: (notifyConfig.slackChannels ?? []).filter(
                                  (x) => x !== ch,
                                ),
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
