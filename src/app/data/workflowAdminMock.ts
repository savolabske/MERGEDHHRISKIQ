export type WorkflowStatus = 'live' | 'draft';
export type DocSlot = 'project' | 'checklist';

export type WorkflowAuditStatus = 'needs_doc' | 'scanning' | 'complete';

export type WorkflowKind = 'ai' | 'legacy';

export type WorkflowPipelineStepKind =
  | 'trigger'
  | 'check'
  | 'condition'
  | 'action'
  | 'output';

export type OutputTemplate =
  | 'decision_board'
  | 'scorecard'
  | 'briefing'
  | 'assurance_matrix'
  | 'action_queue';

export type WorkflowRecipeId =
  | 'project_compliance'
  | 'fraud_deactivations'
  | 'donor_reporting'
  | 'situational_brief'
  | 'assurance_matrix'
  | 'fallback';

export type WorkflowNodeConfigStatus = 'needs_setup' | 'ready';

export type WorkflowWizardStep = 1 | 2 | 3 | 4;

export interface WorkflowScanProgress {
  assessed: number;
  total: number;
}

export interface WorkflowAudit {
  id: string;
  name: string;
  country: string;
  description: string;
  addedAt: string;
  /** Resource linked as the project document for this programme */
  projectDocId: string | null;
  projectDocTitle: string | null;
  /** Checklist document for this programme (per-programme, not shared) */
  checklistDocId: string | null;
  checklistDocTitle: string | null;
  /** User groups that can access this programme audit */
  userGroups: string[];
  /** Whether this programme is visible in Custom Workflows */
  published: boolean;
  /** Admin-facing audit lifecycle */
  auditStatus: WorkflowAuditStatus;
  /** Null until the first sweep finishes */
  score: number | null;
  scanProgress?: WorkflowScanProgress;
  /** Area the agent is currently reviewing while scanning */
  currentArea?: string | null;
  /** Short admin summary once the sweep finishes */
  summary?: string | null;
}

export interface WorkflowPermission {
  groupId: string;
  groupName: string;
  canView: boolean;
  canEdit: boolean;
}

/** Default document sources for trigger steps (Upload / SharePoint / OneDrive). */
export const DEFAULT_TRIGGER_SOURCES = ['Upload', 'SharePoint', 'OneDrive'] as const;

/** Per-source details when a trigger source chip is on (kept when chip is turned off). */
export interface WorkflowTriggerSourceConfig {
  upload?: {
    resourceId?: string;
    title?: string;
    /** Extra file names from drag-drop, shown as chips */
    files?: string[];
  };
  sharepoint?: { links: string[] };
  onedrive?: { links: string[] };
  other?: { datasetId?: string; label?: string };
}

export interface WorkflowPipelineStep {
  id: string;
  kind: WorkflowPipelineStepKind;
  title: string;
  prompt: string;
  agent?: string;
  files?: string[];
  links?: string[];
  /** Trigger: toggled document sources (e.g. Upload, SharePoint, OneDrive). */
  sources?: string[];
  /** Trigger: resource/link/dataset config for each enabled source. */
  sourceConfig?: WorkflowTriggerSourceConfig;
  conditionYes?: string;
  conditionNo?: string;
  notify?: string;
  threshold?: number;
  outputToggles?: {
    uploadEvidence?: boolean;
    actionPlan?: boolean;
    leadershipSummary?: boolean;
    donorBriefing?: boolean;
  };
  configStatus: WorkflowNodeConfigStatus;
}

export interface WorkflowDefinition {
  recipeId: WorkflowRecipeId;
  steps: WorkflowPipelineStep[];
  outputTemplate: OutputTemplate;
}

export interface ManagedWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  updatedAt: string;
  audits: WorkflowAudit[];
  permissions: WorkflowPermission[];
  /** legacy = FCDO-style programmes; ai = AI builder workflows */
  kind?: WorkflowKind;
  masterPrompt?: string;
  definition?: WorkflowDefinition;
  /** When true and status live, appears in Custom Workflows catalog */
  publishedToCatalog?: boolean;
  /** User groups allowed to view published AI workflow (empty = everyone) */
  catalogUserGroups?: string[];
  /** AI wizard progress (1–4) */
  wizardStep?: WorkflowWizardStep;
  /** Record type from describe step, e.g. Project */
  recordType?: string;
  /** Rating display style from describe step, e.g. Red / Amber / Green */
  ratingStyle?: string;
  accessAdmins?: string[];
  accessEditors?: string[];
  accessViewers?: string[];
}

export const WORKFLOW_AUDIT_AREAS = [
  'Design',
  'Approvals',
  'Finance',
  'Delivery',
  'Risk',
  'VfM',
  'Safeguarding',
  'M and E',
  'Governance',
] as const;

const DEFAULT_PERMISSIONS: WorkflowPermission[] = [
  { groupId: 'admin', groupName: 'Administrators', canView: true, canEdit: true },
  { groupId: 'field-coordinators', groupName: 'Field Coordinators', canView: true, canEdit: false },
  { groupId: 'programme-managers', groupName: 'Programme Managers', canView: true, canEdit: false },
  { groupId: 'finance', groupName: 'Finance Team', canView: false, canEdit: false },
  { groupId: 'security', groupName: 'Security Officers', canView: false, canEdit: false },
];

const DEFAULT_WORKFLOWS: ManagedWorkflow[] = [
  {
    id: 'fcdo-compliance',
    name: 'FCDO Compliance Review',
    description: 'Compliance audit matrix for FCDO-funded programmes across Somalia',
    status: 'live',
    kind: 'legacy',
    updatedAt: 'Aug 10, 2026',
    audits: [
      {
        id: 'sharp',
        name: 'Somalia Humanitarian Assistance and Resilience Programme',
        country: 'Somalia',
        description: 'Nationwide humanitarian assistance and resilience support across Somalia.',
        addedAt: 'Jan 12, 2026',
        projectDocId: '2',
        projectDocTitle: 'Humanitarian Access Incident Tracker — regional annexes',
        checklistDocId: '4',
        checklistDocTitle: 'WASH Cluster Assessment — Baidoa & Dollow',
        userGroups: ['Humanitarian Affairs', 'Mission Leadership'],
        published: true,
        auditStatus: 'complete',
        score: 74,
        summary: 'Strong programme with one finance gap pulling the score down.',
      },
      {
        id: 'gess',
        name: 'Girls’ Education Somalia Programme',
        country: 'Somalia',
        description: 'Education access for girls across Puntland and Somaliland, with an FCDO Somalia strand.',
        addedAt: 'Jan 12, 2026',
        projectDocId: '3',
        projectDocTitle: 'IPC Food Security Phase Classification Bay & Bakool',
        checklistDocId: '4',
        checklistDocTitle: 'WASH Cluster Assessment — Baidoa & Dollow',
        userGroups: ['Humanitarian Affairs'],
        published: true,
        auditStatus: 'complete',
        score: 61,
        summary:
          'Below the 65% threshold. Safeguarding policy has lapsed and the annual review is overdue.',
      },
      {
        id: 'biyoole',
        name: 'Biyoole Water and Livelihoods Programme',
        country: 'Somalia',
        description: 'WASH and resilience programme in Bay and Bakool regions.',
        addedAt: 'Feb 3, 2026',
        projectDocId: '2',
        projectDocTitle: 'Humanitarian Access Incident Tracker — regional annexes',
        checklistDocId: '4',
        checklistDocTitle: 'WASH Cluster Assessment — Baidoa & Dollow',
        userGroups: ['WASH Cluster'],
        published: true,
        auditStatus: 'scanning',
        score: null,
        scanProgress: { assessed: 4, total: 9 },
        currentArea: 'Delivery',
        summary: null,
      },
      {
        id: 'damal',
        name: 'Damal Caafimaad Health Systems Programme',
        country: 'Somalia',
        description: 'Integrated community resilience and livelihoods programme.',
        addedAt: 'Feb 3, 2026',
        projectDocId: null,
        projectDocTitle: null,
        checklistDocId: null,
        checklistDocTitle: null,
        userGroups: [],
        published: false,
        auditStatus: 'needs_doc',
        score: null,
        summary: null,
      },
      {
        id: 'josp',
        name: 'Jubaland Stability Programme',
        country: 'Somalia',
        description: 'Joint operational support for stability and recovery in Jubaland.',
        addedAt: 'Mar 15, 2026',
        projectDocId: null,
        projectDocTitle: null,
        checklistDocId: null,
        checklistDocTitle: null,
        userGroups: ['Mission Leadership'],
        published: false,
        auditStatus: 'needs_doc',
        score: null,
        summary: null,
      },
      {
        id: 'hilp',
        name: 'Humanitarian Innovation and Learning Programme',
        country: 'Somalia',
        description: 'Innovation and learning support for humanitarian partners.',
        addedAt: 'Mar 15, 2026',
        projectDocId: null,
        projectDocTitle: null,
        checklistDocId: null,
        checklistDocTitle: null,
        userGroups: [],
        published: false,
        auditStatus: 'needs_doc',
        score: null,
        summary: null,
      },
    ],
    permissions: DEFAULT_PERMISSIONS,
  },
];

const STORAGE_KEY = 'hh.managedWorkflows.v8';
const LEGACY_STORAGE_KEYS = [
  'hh.managedWorkflows.v7',
  'hh.managedWorkflows.v6',
  'hh.managedWorkflows.v5',
  'hh.managedWorkflows.v4',
] as const;

const LEGACY_PROGRAMME_NAMES: Record<string, string> = {
  sharp: 'Somalia Humanitarian Assistance and Resilience Programme',
  gess: 'Girls’ Education Somalia Programme',
  biyoole: 'Biyoole Water and Livelihoods Programme',
  damal: 'Damal Caafimaad Health Systems Programme',
  josp: 'Jubaland Stability Programme',
  hilp: 'Humanitarian Innovation and Learning Programme',
  SHARP: 'Somalia Humanitarian Assistance and Resilience Programme',
  GESS: 'Girls’ Education Somalia Programme',
  Biyoole: 'Biyoole Water and Livelihoods Programme',
  Damal: 'Damal Caafimaad Health Systems Programme',
  JOSP: 'Jubaland Stability Programme',
  HILP: 'Humanitarian Innovation and Learning Programme',
};

function normalizeAudit(
  raw: Partial<WorkflowAudit> & Pick<WorkflowAudit, 'id' | 'name'>,
  legacyWorkflowChecklist?: { id: string | null; title: string | null },
): WorkflowAudit {
  const hasDoc = Boolean(raw.projectDocId);
  const auditStatus: WorkflowAuditStatus =
    raw.auditStatus ?? (hasDoc ? 'complete' : 'needs_doc');
  const legacyName = LEGACY_PROGRAMME_NAMES[raw.id] ?? LEGACY_PROGRAMME_NAMES[raw.name];

  return {
    id: raw.id,
    name: legacyName ?? raw.name,
    country: raw.country ?? 'Somalia',
    description: raw.description ?? '',
    addedAt: raw.addedAt ?? '',
    projectDocId: raw.projectDocId ?? null,
    projectDocTitle: raw.projectDocTitle ?? null,
    checklistDocId: raw.checklistDocId ?? legacyWorkflowChecklist?.id ?? null,
    checklistDocTitle: raw.checklistDocTitle ?? legacyWorkflowChecklist?.title ?? null,
    userGroups: raw.userGroups ?? [],
    published: raw.published ?? auditStatus !== 'needs_doc',
    auditStatus,
    score: raw.score ?? (auditStatus === 'complete' ? 72 : null),
    scanProgress: raw.scanProgress,
    currentArea: raw.currentArea ?? null,
    summary: raw.summary ?? null,
  };
}

function normalizeWorkflow(raw: ManagedWorkflow & {
  checklistDocId?: string | null;
  checklistDocTitle?: string | null;
}): ManagedWorkflow {
  const legacyChecklist = {
    id: raw.checklistDocId ?? null,
    title: raw.checklistDocTitle ?? null,
  };
  const kind: WorkflowKind = raw.kind ?? (raw.definition ? 'ai' : 'legacy');
  const definition = normalizeDefinition(raw.definition);
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: raw.status,
    updatedAt: raw.updatedAt,
    permissions: raw.permissions ?? DEFAULT_PERMISSIONS,
    audits: (raw.audits ?? []).map((a) => normalizeAudit(a, legacyChecklist)),
    kind,
    masterPrompt: raw.masterPrompt,
    definition,
    publishedToCatalog: raw.publishedToCatalog ?? false,
    catalogUserGroups: raw.catalogUserGroups ?? [],
    wizardStep: raw.wizardStep ?? (definition ? 2 : undefined),
    recordType: raw.recordType ?? 'Project',
    ratingStyle: raw.ratingStyle ?? 'Red / Amber / Green',
    accessAdmins: raw.accessAdmins ?? ['Mission Leadership'],
    accessEditors: raw.accessEditors ?? ['Humanitarian Affairs', 'WASH Cluster'],
    accessViewers: raw.accessViewers ?? raw.catalogUserGroups ?? ['Security & Access'],
  };
}

function normalizeDefinition(
  raw: ManagedWorkflow['definition'] | (Record<string, unknown> & { steps?: WorkflowPipelineStep[] }) | undefined,
): WorkflowDefinition | undefined {
  if (!raw) return undefined;
  // Drop pre-v8 node/edge definitions — force re-create via wizard
  if (!Array.isArray(raw.steps) || raw.steps.length === 0) return undefined;
  return {
    recipeId: (raw.recipeId as WorkflowRecipeId) ?? 'fallback',
    outputTemplate: (raw.outputTemplate as OutputTemplate) ?? 'assurance_matrix',
    steps: raw.steps.map((s) => ({
      ...s,
      files: s.files ?? [],
      links: s.links ?? [],
      sources:
        s.sources ??
        (s.kind === 'trigger' ? [...DEFAULT_TRIGGER_SOURCES] : undefined),
      configStatus: s.configStatus ?? (String(s.prompt ?? '').trim() ? 'ready' : 'needs_setup'),
    })),
  };
}

function readStoredWorkflows(): ManagedWorkflow[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return (JSON.parse(raw) as ManagedWorkflow[]).map(normalizeWorkflow);

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (!legacyRaw) continue;
      const migrated = (JSON.parse(legacyRaw) as ManagedWorkflow[]).map(normalizeWorkflow);
      saveManagedWorkflows(migrated);
      return migrated;
    }
    return null;
  } catch {
    return null;
  }
}

export function loadManagedWorkflows(): ManagedWorkflow[] {
  return readStoredWorkflows() ?? DEFAULT_WORKFLOWS;
}

export function isAiWorkflow(workflow: ManagedWorkflow): boolean {
  return workflow.kind === 'ai';
}

export function workflowDefinitionComplete(definition: WorkflowDefinition | undefined): boolean {
  if (!definition?.steps?.length) return false;
  return definition.steps.every((s) => s.configStatus === 'ready' && Boolean(s.prompt.trim()));
}

export function formatWorkflowUpdatedAt(date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function createAiWorkflowDraft(input: {
  name: string;
  description: string;
  masterPrompt: string;
  recordType: string;
  ratingStyle?: string;
  definition?: WorkflowDefinition;
  wizardStep?: WorkflowWizardStep;
}): ManagedWorkflow {
  return {
    id: `ai-wf-${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    status: 'draft',
    kind: 'ai',
    updatedAt: formatWorkflowUpdatedAt(),
    audits: [],
    permissions: DEFAULT_PERMISSIONS,
    masterPrompt: input.masterPrompt,
    definition: input.definition,
    publishedToCatalog: false,
    catalogUserGroups: [],
    wizardStep: input.wizardStep ?? 1,
    recordType: input.recordType.trim() || 'Project',
    ratingStyle: input.ratingStyle?.trim() || 'Red / Amber / Green',
    accessAdmins: ['Mission Leadership'],
    accessEditors: ['Humanitarian Affairs', 'WASH Cluster'],
    accessViewers: ['Security & Access'],
  };
}

export function listPublishedAiWorkflows(workflows: ManagedWorkflow[]): ManagedWorkflow[] {
  return workflows.filter(
    (w) =>
      w.kind === 'ai' &&
      w.status === 'live' &&
      w.publishedToCatalog &&
      Boolean(w.definition),
  );
}

export function saveManagedWorkflows(workflows: ManagedWorkflow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  } catch {
    /* ignore */
  }
}

export function createScanningProgramme(input: {
  name: string;
  description: string;
  projectDocId: string | null;
  projectDocTitle: string | null;
  checklistDocId: string | null;
  checklistDocTitle: string | null;
  userGroups: string[];
}): WorkflowAudit {
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const hasDocs = Boolean(input.projectDocId && input.checklistDocId);

  return {
    id: `audit-${Date.now()}`,
    name: input.name.trim(),
    country: 'Somalia',
    description: input.description.trim(),
    addedAt: now,
    projectDocId: input.projectDocId,
    projectDocTitle: input.projectDocTitle,
    checklistDocId: input.checklistDocId,
    checklistDocTitle: input.checklistDocTitle,
    userGroups: input.userGroups,
    published: false,
    auditStatus: hasDocs ? 'scanning' : 'needs_doc',
    score: null,
    scanProgress: hasDocs ? { assessed: 0, total: WORKFLOW_AUDIT_AREAS.length } : undefined,
    currentArea: hasDocs ? WORKFLOW_AUDIT_AREAS[0] : null,
    summary: null,
  };
}

export function advanceProgrammeScan(audit: WorkflowAudit): WorkflowAudit {
  if (audit.auditStatus !== 'scanning' || !audit.scanProgress) return audit;

  const nextAssessed = Math.min(audit.scanProgress.assessed + 1, audit.scanProgress.total);
  const done = nextAssessed >= audit.scanProgress.total;

  if (done) {
    return {
      ...audit,
      auditStatus: 'complete',
      score: 78,
      scanProgress: { assessed: nextAssessed, total: audit.scanProgress.total },
      currentArea: null,
      summary: 'First sweep complete. Evidence mapped across all nine compliance areas.',
    };
  }

  return {
    ...audit,
    scanProgress: { assessed: nextAssessed, total: audit.scanProgress.total },
    currentArea: WORKFLOW_AUDIT_AREAS[nextAssessed] ?? null,
  };
}

// ── sessionStorage context for the cross-view doc-linking flow ────────────────

export interface WorkflowDocLinkContext {
  workflowId: string;
  /** Only set when linking a per-audit project doc; null when linking the checklist */
  auditId: string | null;
  slot: DocSlot;
}

export interface WorkflowReturnContext {
  workflowId: string;
  auditId: string | null;
  slot: DocSlot;
  resourceId: string;
  resourceTitle: string;
  toastMessage: string;
}

const DOC_LINK_CTX_KEY = 'hh.workflowDocLinkContext';
const RETURN_CTX_KEY = 'hh.workflowReturnContext';

export function saveWorkflowDocLinkContext(ctx: WorkflowDocLinkContext): void {
  try {
    sessionStorage.setItem(DOC_LINK_CTX_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function loadWorkflowDocLinkContext(): WorkflowDocLinkContext | null {
  try {
    const raw = sessionStorage.getItem(DOC_LINK_CTX_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkflowDocLinkContext;
  } catch {
    return null;
  }
}

export function clearWorkflowDocLinkContext(): void {
  try {
    sessionStorage.removeItem(DOC_LINK_CTX_KEY);
  } catch {
    /* ignore */
  }
}

export function saveWorkflowReturnContext(ctx: WorkflowReturnContext): void {
  try {
    sessionStorage.setItem(RETURN_CTX_KEY, JSON.stringify(ctx));
  } catch {
    /* ignore */
  }
}

export function loadWorkflowReturnContext(): WorkflowReturnContext | null {
  try {
    const raw = sessionStorage.getItem(RETURN_CTX_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkflowReturnContext;
  } catch {
    return null;
  }
}

export function clearWorkflowReturnContext(): void {
  try {
    sessionStorage.removeItem(RETURN_CTX_KEY);
  } catch {
    /* ignore */
  }
}

/** All resources available to be picked as project or checklist documents */
export const LINKABLE_WORKFLOW_RESOURCES = [
  { id: '2', title: 'Humanitarian Access Incident Tracker — regional annexes' },
  { id: '3', title: 'IPC Food Security Phase Classification Bay & Bakool' },
  { id: '4', title: 'WASH Cluster Assessment — Baidoa & Dollow' },
  { id: '5', title: 'Partner registry — Somalia implementing partners' },
  { id: '6', title: 'Donor reporting pack — Q2 evidence folder' },
  { id: '7', title: 'Contractor Management / FCDO' },
  { id: '8', title: 'HR Records / Implementing Partners' },
  { id: '9', title: 'Compliance / Vetting Database' },
] as const;

export const LINKABLE_WORKFLOW_URL_SOURCES = [
  { id: 'url-1', title: 'FSNAU early warning portal' },
  { id: 'url-2', title: 'OCHA Somalia reliefweb feed' },
  { id: 'url-3', title: 'FCDO partnership portal' },
] as const;

export const LINKABLE_WORKFLOW_DATASETS = [
  { id: 'api-1', title: 'IATI Somalia activities feed' },
  { id: 'api-2', title: 'Partner compliance scores API' },
  { id: 'api-3', title: 'Incident tickets — field ops' },
  { id: 'api-4', title: 'Partner status & deactivation feed' },
] as const;

export const WORKFLOW_MAP_FOCUSES = [
  'Lower Shabelle',
  'Banadir',
  'Bay & Bakool',
  'Lower Shabelle & Banadir',
  'Nationwide Somalia',
] as const;

export { DEFAULT_PERMISSIONS };
