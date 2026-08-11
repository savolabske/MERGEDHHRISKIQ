export type WorkflowStatus = 'live' | 'draft';
export type DocSlot = 'project' | 'checklist';

export type WorkflowAuditStatus = 'needs_doc' | 'scanning' | 'complete';

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

export interface ManagedWorkflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  updatedAt: string;
  audits: WorkflowAudit[];
  permissions: WorkflowPermission[];
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
        name: 'Galmudug Girls’ Education Access Programme',
        country: 'Somalia',
        description: 'Education access for girls across Galmudug, with an FCDO Somalia strand.',
        addedAt: 'Jan 12, 2026',
        projectDocId: '3',
        projectDocTitle: 'IPC Food Security Phase Classification Bay & Bakool',
        checklistDocId: '4',
        checklistDocTitle: 'WASH Cluster Assessment — Baidoa & Dollow',
        userGroups: ['Humanitarian Affairs'],
        published: true,
        auditStatus: 'complete',
        score: 61,
        summary: 'Multiple red areas blocking clearance ahead of the next donor checkpoint.',
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

const STORAGE_KEY = 'hh.managedWorkflows.v4';

const LEGACY_PROGRAMME_NAMES: Record<string, string> = {
  sharp: 'Somalia Humanitarian Assistance and Resilience Programme',
  gess: 'Galmudug Girls’ Education Access Programme',
  biyoole: 'Biyoole Water and Livelihoods Programme',
  damal: 'Damal Caafimaad Health Systems Programme',
  josp: 'Jubaland Stability Programme',
  hilp: 'Humanitarian Innovation and Learning Programme',
  SHARP: 'Somalia Humanitarian Assistance and Resilience Programme',
  GESS: 'Galmudug Girls’ Education Access Programme',
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
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    status: raw.status,
    updatedAt: raw.updatedAt,
    permissions: raw.permissions,
    audits: (raw.audits ?? []).map((a) => normalizeAudit(a, legacyChecklist)),
  };
}

export function loadManagedWorkflows(): ManagedWorkflow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WORKFLOWS;
    const parsed = JSON.parse(raw) as ManagedWorkflow[];
    return parsed.map(normalizeWorkflow);
  } catch {
    return DEFAULT_WORKFLOWS;
  }
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
] as const;
