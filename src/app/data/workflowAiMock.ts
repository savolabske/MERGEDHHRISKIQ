import type {
  OutputTemplate,
  WorkflowDefinition,
  WorkflowPipelineStep,
  WorkflowPipelineStepKind,
  WorkflowRecipeId,
} from './workflowAdminMock';
import {
  DEFAULT_TRIGGER_SOURCES,
  LINKABLE_WORKFLOW_RESOURCES,
} from './workflowAdminMock';

export interface RecipeMeta {
  recipeId: WorkflowRecipeId;
  suggestedName: string;
  suggestedDescription: string;
  suggestedRecordType?: string;
  lowConfidence?: boolean;
}

export interface InterpretResult {
  definition: WorkflowDefinition;
  meta: RecipeMeta;
}

export type RagTone = 'G' | 'A' | 'R';

export interface DecisionBoardData {
  kpis: { label: string; value: string; delta?: string; tone: 'neutral' | 'good' | 'warn' | 'bad' }[];
  decisionsNeeded: { id: string; title: string; urgency: 'high' | 'medium' | 'low'; context: string }[];
  contextNotes: string;
}

export interface ScorecardData {
  overallScore: number;
  threshold: number;
  rag: RagTone;
  dimensions: { id: string; label: string; score: number; rag: RagTone; driver: string }[];
}

export interface BriefingData {
  sections: {
    id: string;
    heading: string;
    body: string;
    citations: { label: string; sourceType: 'resource' | 'link' | 'api' }[];
  }[];
}

export interface AssuranceMatrixData {
  areas: {
    id: string;
    label: string;
    status: 'compliant' | 'attention' | 'action_needed' | 'pending';
    clearCount: number;
    totalCount: number;
  }[];
  checksPreview: { areaId: string; title: string; status: 'clear' | 'gap' | 'pending' }[];
}

export interface ActionQueueData {
  items: {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    owner: string;
    status: 'open' | 'done' | 'escalated';
    dueLabel: string;
  }[];
}

export interface WorkflowOutputPayload {
  template: OutputTemplate;
  recipeId: WorkflowRecipeId;
  title: string;
  subtitle: string;
  lastUpdated: string;
  data: DecisionBoardData | ScorecardData | BriefingData | AssuranceMatrixData | ActionQueueData;
  linkedResources: { id: string; title: string }[];
  chatPrompt: string;
  incompleteHint?: string;
  secondary: {
    showMap: boolean;
    mapFocus?: string;
    showReport: boolean;
    reportTitle?: string;
    showDatatable: boolean;
    columns?: string[];
    showApi: boolean;
    datasetLabel?: string;
  };
  incomplete: boolean;
}

let stepSeq = 0;
function nextStepId(): string {
  stepSeq += 1;
  return `step-${Date.now()}-${stepSeq}`;
}

function step(
  kind: WorkflowPipelineStepKind,
  title: string,
  prompt: string,
  extras: Partial<WorkflowPipelineStep> = {},
): WorkflowPipelineStep {
  const base: WorkflowPipelineStep = {
    id: nextStepId(),
    kind,
    title,
    prompt,
    files: extras.files ?? [],
    links: extras.links ?? [],
    sources:
      extras.sources ??
      (kind === 'trigger' ? [...DEFAULT_TRIGGER_SOURCES] : undefined),
    configStatus: 'ready',
    ...extras,
  };
  return recomputeStepStatus(base);
}

export function stepNeedsSetup(s: WorkflowPipelineStep): boolean {
  if (!s.prompt.trim()) return true;
  if (s.kind === 'condition' && (!String(s.conditionYes ?? '').trim() || !String(s.conditionNo ?? '').trim())) {
    return true;
  }
  if (s.kind === 'action' && !String(s.notify ?? '').trim()) return true;
  return false;
}

export function recomputeStepStatus(s: WorkflowPipelineStep): WorkflowPipelineStep {
  return {
    ...s,
    configStatus: stepNeedsSetup(s) ? 'needs_setup' : 'ready',
  };
}

export function updatePipelineStep(
  definition: WorkflowDefinition,
  stepId: string,
  patch: Partial<WorkflowPipelineStep>,
): WorkflowDefinition {
  const steps = definition.steps ?? [];
  return {
    ...definition,
    steps: steps.map((s) => {
      if (s.id !== stepId) return s;
      return recomputeStepStatus({ ...s, ...patch });
    }),
  };
}

export function insertPipelineStepAfter(
  definition: WorkflowDefinition,
  afterStepId: string | null,
): WorkflowDefinition {
  const existing = definition.steps ?? [];
  const newStep = step('check', 'New step', '', { agent: 'Check', configStatus: 'needs_setup' });
  if (!afterStepId) {
    return { ...definition, steps: [newStep, ...existing] };
  }
  const idx = existing.findIndex((s) => s.id === afterStepId);
  if (idx < 0) return { ...definition, steps: [...existing, newStep] };
  const steps = [...existing];
  steps.splice(idx + 1, 0, newStep);
  return { ...definition, steps };
}

/** Removes a step. No-op when the pipeline would become empty. */
export function removePipelineStep(
  definition: WorkflowDefinition,
  stepId: string,
): WorkflowDefinition {
  const existing = definition.steps ?? [];
  if (existing.length <= 1) return definition;
  const steps = existing.filter((s) => s.id !== stepId);
  if (steps.length === existing.length) return definition;
  return { ...definition, steps };
}

export function setPipelineStepKind(
  definition: WorkflowDefinition,
  stepId: string,
  kind: WorkflowPipelineStepKind,
): WorkflowDefinition {
  return updatePipelineStep(definition, stepId, {
    kind,
    agent: kind === 'check' ? 'Check' : undefined,
    conditionYes: kind === 'condition' ? 'Send an alert' : undefined,
    conditionNo: kind === 'condition' ? 'Continue as normal' : undefined,
    notify: kind === 'action' ? '' : undefined,
  });
}

function projectComplianceDefinition(): WorkflowDefinition {
  return {
    recipeId: 'project_compliance',
    outputTemplate: 'assurance_matrix',
    steps: [
      step(
        'trigger',
        'New or updated project documents',
        'Watch each project’s linked folders and uploads. When a document is added or changed, start a review of the areas it affects.',
      ),
      step(
        'check',
        'Project Documentation & Design',
        'Check that each project has a signed concept note, a current logframe with baselines and targets, and recorded approvals. Mark it green if all three are present and current, amber if one is outdated, and red if any is missing.',
        { agent: 'Design Agent', files: ['Project Document Standards.pdf'] },
      ),
      step(
        'check',
        'HACT Compliance',
        'Check that the HACT micro-assessment is complete and valid within the last 3 years, that this cycle’s scheduled spot check has been completed, and that a risk rating is recorded with a justification. Treat an overdue spot check as red — it’s the most time-sensitive item.',
        { agent: 'HACT Agent', files: ['IOM HACT Framework.pdf'] },
      ),
      step(
        'check',
        'PSEA Compliance',
        'Check that a PSEA policy is signed, a focal point is named, a community referral pathway is documented, and staff training completion is at or above 90%. Rate amber between 75 and 89%, red below 75%, and red immediately if no focal point is named.',
        { agent: 'PSEA Agent', files: ['PSEA Compliance Checklist.pdf'] },
      ),
      step(
        'check',
        'Financial Management & Audit',
        'Check that quarterly financial reports reconcile against disbursements, that cash transfer amounts stay within the ceiling for the assigned HACT risk rating, and that prior audit findings are closed or have a credible corrective plan.',
        { agent: 'Finance Agent', files: ['Financial Compliance Checklist.xlsx'] },
      ),
      step(
        'check',
        'Risk Management',
        'Check that the risk register has been reviewed in the last 90 days and that every critical or high risk has a named owner and a documented mitigation.',
        { agent: 'Risk Agent' },
      ),
      step(
        'check',
        'Partner Capacity & Due Diligence',
        'Check that partner due diligence is valid within the last 2 years and that a capacity assessment covering financial and programmatic systems is on file.',
        { agent: 'Partner Agent', files: ['Partner Due Diligence Standard.pdf'] },
      ),
      step(
        'check',
        'Monitoring, Evidence & Reporting',
        'Check that a current monitoring and evaluation plan exists and that a data quality assessment was completed in the most recent reporting round.',
        { agent: 'Evidence Agent' },
      ),
      step(
        'check',
        'Governance & Accountability',
        'Check that the steering committee has met quarterly with minutes on file and that an accountable owner is named and documented.',
        { agent: 'Accountability Agent' },
      ),
      step(
        'condition',
        'Check the overall score',
        'If a project’s overall compliance score drops below 70%, alert country leadership and the PSEA network immediately. Otherwise continue to the dashboard on the normal cycle.',
        {
          conditionYes: 'Alert leadership + PSEA network',
          conditionNo: 'Continue to dashboard',
        },
      ),
      step(
        'output',
        'Combine into project dashboard',
        'Combine every step’s findings into the project dashboard, the compliance adviser chat, and leadership summaries.',
        {
          threshold: 70,
          outputToggles: {
            uploadEvidence: true,
            actionPlan: true,
            leadershipSummary: true,
            donorBriefing: false,
          },
        },
      ),
    ],
  };
}

function fraudDeactivationsDefinition(): WorkflowDefinition {
  return {
    recipeId: 'fraud_deactivations',
    outputTemplate: 'action_queue',
    steps: [
      step(
        'trigger',
        'Daily contractor status refresh',
        'Every morning, watch the contractor / partner status feed for new deactivations.',
      ),
      step(
        'check',
        'Fraud deactivation filter',
        'From today’s records, keep only deactivations where reason contains fraud or financial misconduct. Extract organisation, individual, date, reason, and case reference.',
        { agent: 'Fraud Agent', files: ['Partner status & deactivation feed'] },
      ),
      step(
        'output',
        'Daily deactivation report',
        'Surface an actionable daily list of fraud deactivations for compliance and programme teams.',
        { threshold: 0 },
      ),
    ],
  };
}

function donorReportingDefinition(): WorkflowDefinition {
  return {
    recipeId: 'donor_reporting',
    outputTemplate: 'briefing',
    steps: [
      step(
        'trigger',
        'Upcoming submission window',
        'When a donor submission deadline is within 14 days, start a readiness review of the pack.',
      ),
      step(
        'check',
        'Report pack completeness',
        'Check that the report pack has narrative, results annex, financial annex, and signed cover note.',
        { agent: 'Pack Agent', files: ['Donor reporting pack — Q2 evidence folder'] },
      ),
      step(
        'check',
        'Portal alignment',
        'Compare pack totals against the donor portal feed for results indicators and geography wording.',
        { agent: 'Portal Agent', links: ['https://sharepoint.example/donor-portal'] },
      ),
      step(
        'output',
        'Leadership briefing',
        'Produce a short leadership briefing with gaps, risks, and a go / hold recommendation before send.',
      ),
    ],
  };
}

function situationalBriefDefinition(): WorkflowDefinition {
  return {
    recipeId: 'situational_brief',
    outputTemplate: 'decision_board',
    steps: [
      step(
        'trigger',
        'New incident or access update',
        'When incident tickets, corridor advisories, or Access Working Group notes update for the focus area, refresh the readiness brief.',
      ),
      step(
        'check',
        'Meeting cadence & AWG readiness',
        'Check that the Access Working Group has met on schedule, minutes are filed, and the next briefing pack has an owner.',
        { agent: 'AWG Agent' },
      ),
      step(
        'check',
        'Corridor & route status',
        'Review corridor updates and access constraints for the map focus area. Flag blocked or high-risk routes.',
        { agent: 'Corridor Agent', files: ['Humanitarian Access Incident Tracker — regional annexes'] },
      ),
      step(
        'check',
        'Partner reach',
        'Check which partners remain reachable along priority corridors and note any coverage gaps for the next movement window.',
        { agent: 'Partner Reach Agent' },
      ),
      step(
        'check',
        'Open access incidents',
        'Review open incident tickets for severity, age, and whether a mitigation or alternate route is documented.',
        { agent: 'Incident Agent' },
      ),
      step(
        'check',
        'Briefing blockers',
        'Flag anything blocking the next AWG briefing — missing corridor note, unresolved high-severity incident, or partner reach below threshold.',
        { agent: 'Briefing Agent' },
      ),
      step(
        'condition',
        'Escalate if severity is high',
        'If access severity is high or open incidents exceed the weekly threshold, alert mission leadership. Otherwise continue to the decision board.',
        {
          conditionYes: 'Alert mission leadership',
          conditionNo: 'Continue to decision board',
        },
      ),
      step(
        'output',
        'Field decision board',
        'Combine KPIs and open decisions for corridor, stock, and partner calls.',
      ),
    ],
  };
}

function assuranceMatrixDefinition(): WorkflowDefinition {
  return {
    recipeId: 'assurance_matrix',
    outputTemplate: 'assurance_matrix',
    steps: [
      step(
        'trigger',
        'Continuous assurance cycle',
        'On each assurance cycle, refresh checklist evidence and live scores.',
      ),
      step(
        'check',
        'Design & documentation',
        'Confirm concept notes, logframes, and approvals are present for each programme area.',
        { agent: 'Design Agent' },
      ),
      step(
        'check',
        'Checklist pack',
        'Load the assurance checklist and evidence folder for each area.',
        { agent: 'Assurance Agent', files: ['WASH Cluster Assessment — Baidoa & Dollow'] },
      ),
      step(
        'check',
        'Live scores feed',
        'Pull the latest area scores from the assurance API and mark stale cells for refresh.',
        { agent: 'Scores Agent' },
      ),
      step(
        'check',
        'Action owners',
        'Confirm every attention or action-needed cell has a named owner and a dated next step.',
        { agent: 'Owners Agent' },
      ),
      step(
        'condition',
        'Escalate action-needed areas',
        'If any area is action-needed, alert the assurance lead. Otherwise continue to the matrix.',
        {
          conditionYes: 'Alert assurance lead',
          conditionNo: 'Continue to matrix',
        },
      ),
      step(
        'output',
        'Assurance matrix',
        'Show a live area / check matrix with compliant, attention, and action-needed states.',
      ),
    ],
  };
}

/** Low-confidence default: same rich multi-check shape as project compliance (not a 3-step stub). */
function fallbackDefinition(): WorkflowDefinition {
  return {
    ...projectComplianceDefinition(),
    recipeId: 'fallback',
  };
}

const RECIPE_META: Record<WorkflowRecipeId, Omit<RecipeMeta, 'recipeId' | 'lowConfidence'>> = {
  project_compliance: {
    suggestedName: 'IOM Project Compliance Monitor',
    suggestedDescription:
      'Track active projects and give leadership a live view of compliance health across HACT, PSEA, risk, partner due diligence, and audit findings.',
    suggestedRecordType: 'Project',
  },
  fraud_deactivations: {
    suggestedName: 'Contractor Fraud Deactivation Report',
    suggestedDescription:
      'A daily workflow that checks your contractor database for new fraud deactivations and surfaces them as an actionable list.',
    suggestedRecordType: 'Contractor',
  },
  donor_reporting: {
    suggestedName: 'Donor Reporting Readiness',
    suggestedDescription:
      'Pre-flight checks that a report pack is complete and consistent before submission.',
    suggestedRecordType: 'Submission',
  },
  situational_brief: {
    suggestedName: 'Situational Decision Brief',
    suggestedDescription:
      'Map- and evidence-backed board for field access, corridor, and incident decisions.',
    suggestedRecordType: 'Situation',
  },
  assurance_matrix: {
    suggestedName: 'Continuous Assurance Matrix',
    suggestedDescription:
      'Live area/check matrix fed by checklist resources and an API scores feed.',
    suggestedRecordType: 'Programme',
  },
  fallback: {
    suggestedName: 'IOM Project Compliance Monitor',
    suggestedDescription:
      'Track active projects and give leadership a live view of compliance health across HACT, PSEA, risk, partner due diligence, and audit findings.',
    suggestedRecordType: 'Project',
  },
};

export const WORKFLOW_CREATE_SUGGESTIONS = [
  {
    id: 'project_compliance',
    label: 'Partner due diligence',
    name: 'Partner Due Diligence Monitor',
    recordType: 'Partner',
    prompt:
      'Track implementing partners and flag any whose due diligence is older than 2 years or missing a capacity assessment covering financial and programmatic systems. Keep checking as teams upload evidence.',
  },
  {
    id: 'ocha_access',
    label: 'OCHA Access Working Group readiness',
    name: 'OCHA Access Working Group Readiness',
    recordType: 'Working group',
    prompt:
      'OCHA Access Working Group readiness: monitor meeting cadence, corridor updates, partner reach, and open access incidents. Flag anything blocking the next AWG briefing.',
  },
  {
    id: 'donor_reporting',
    label: 'Donor audit readiness',
    name: 'Donor Audit Readiness',
    recordType: 'Audit pack',
    prompt:
      'Donor audit readiness for an upcoming review—check the evidence pack and portal feed, build a completeness view, and produce a leadership briefing before we send.',
  },
] as const;

export const WORKFLOW_GENERATION_STEPS = [
  { id: 'read', label: 'Reading your description…' },
  { id: 'record', label: 'Identifying record type' },
  { id: 'map', label: 'Mapping out the workflow steps…' },
  { id: 'checks', label: 'Drafting check agents…' },
  { id: 'condition', label: 'Adding a threshold condition…' },
  { id: 'output', label: 'Connecting every step to the dashboard…' },
] as const;

export function interpretWorkflowPrompt(prompt: string, recordType?: string): InterpretResult {
  const q = prompt.trim().toLowerCase();

  const finalize = (
    definition: WorkflowDefinition,
    recipeId: WorkflowRecipeId,
    lowConfidence?: boolean,
  ): InterpretResult => ({
    definition: {
      ...definition,
      steps: (definition.steps ?? []).map(recomputeStepStatus),
    },
    meta: {
      recipeId,
      ...RECIPE_META[recipeId],
      suggestedRecordType: recordType?.trim() || RECIPE_META[recipeId].suggestedRecordType,
      lowConfidence,
    },
  });

  const match = (
    recipeId: WorkflowRecipeId,
    build: () => WorkflowDefinition,
    triggers: string[],
  ): InterpretResult | null => {
    if (!triggers.some((t) => q.includes(t))) return null;
    return finalize(build(), recipeId);
  };

  // Specialized recipes first (narrow keywords), then rich compliance / access drafts.
  // Low-confidence fallback uses the full project_compliance multi-check shape — never a 3-step stub.
  return (
    match('fraud_deactivations', fraudDeactivationsDefinition, [
      'fraud',
      'deactivat',
      'debar',
      'integrity',
      'diversion',
    ]) ??
    match('donor_reporting', donorReportingDefinition, [
      'donor',
      'report pack',
      'donor report',
      'donor reporting',
      'audit readiness',
      'submission window',
      'leadership briefing before we send',
    ]) ??
    match('situational_brief', situationalBriefDefinition, [
      'ocha',
      'access working',
      'working group',
      'awg',
      'corridor',
      'field decision',
      'situational',
      'incident',
      'access incident',
      'access severity',
    ]) ??
    match('project_compliance', projectComplianceDefinition, [
      'iom',
      'hact',
      'psea',
      'project compliance',
      'compliance health',
      'compliance',
      'micro-assessment',
      'spot check',
      'due diligence',
      'partner due',
      'partner',
      'partners',
      'implementing partner',
      'monitor',
      'monitoring',
      'assess',
      'assessing',
      'assessment',
      'project',
      'projects',
      'programme',
      'program',
      'audit finding',
      'risk register',
      'capacity assessment',
    ]) ??
    match('assurance_matrix', assuranceMatrixDefinition, [
      'assurance',
      'compliance matrix',
      'continuous review',
    ]) ??
    finalize(fallbackDefinition(), 'fallback', true)
  );
}

export function pipelineDraftSummary(definition: WorkflowDefinition): string {
  const counts = (definition.steps ?? []).reduce(
    (acc, s) => {
      acc[s.kind] = (acc[s.kind] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<WorkflowPipelineStepKind, number>>,
  );
  const parts: string[] = [];
  if (counts.trigger) parts.push(`${counts.trigger} trigger`);
  if (counts.check) parts.push(`${counts.check} check${counts.check === 1 ? '' : 's'}`);
  if (counts.condition) parts.push(`${counts.condition} condition`);
  if (counts.action) parts.push(`${counts.action} action`);
  if (counts.output) parts.push(`${counts.output} output`);
  return `Drafted ${(definition.steps ?? []).length} steps — ${parts.join(', ')}`;
}

export function pipelineAssumptions(recipeId: WorkflowRecipeId): string[] {
  if (recipeId === 'project_compliance' || recipeId === 'fallback') {
    return [
      'HACT micro-assessments are valid for 3 years and spot checks run annually — adjust the HACT step’s prompt if your cycle differs.',
      'PSEA training completion threshold is set at 90% in the PSEA step’s prompt — edit it if your network uses a different figure.',
      'Partner due diligence is valid for 2 years.',
    ];
  }
  if (recipeId === 'fraud_deactivations') {
    return [
      'Fraud filter looks for “fraud” or “financial misconduct” in the reason field — edit the check prompt if your codes differ.',
      'The daily report is ready after the morning feed run.',
    ];
  }
  if (recipeId === 'situational_brief') {
    return [
      'Access severity and weekly incident thresholds live in the condition step — edit them to match your AWG standing orders.',
      'Corridor and partner-reach checks use the linked incident tracker annex — attach your local pack before publish.',
    ];
  }
  return [
    'Each check step rates evidence red, amber, or green from its prompt.',
    'Edit prompts and attach reference documents before you publish.',
  ];
}

function decisionBoardData(recipeId: WorkflowRecipeId): DecisionBoardData {
  if (recipeId === 'situational_brief') {
    return {
      kpis: [
        { label: 'Access severity', value: 'High', delta: '+1 corridor', tone: 'bad' },
        { label: 'Open incidents', value: '14', delta: '-3 wow', tone: 'good' },
        { label: 'Partners reached', value: '8/11', tone: 'warn' },
        { label: 'Map focus', value: 'Lower Shabelle', tone: 'neutral' },
      ],
      decisionsNeeded: [
        {
          id: 'd1',
          title: 'Authorize alternate access corridor',
          urgency: 'high',
          context: 'Primary route blocked; two partners awaiting guidance.',
        },
        {
          id: 'd2',
          title: 'Reallocate rapid-response stock',
          urgency: 'medium',
          context: 'Baidoa warehouse can cover 72h if movement approved today.',
        },
      ],
      contextNotes:
        'Field checks synthesized access pressure and evidence into decisions that need a call within 24 hours.',
    };
  }
  return {
    kpis: [
      { label: 'Open decisions', value: '5', tone: 'warn' },
      { label: 'Checks ready', value: '3', tone: 'neutral' },
      { label: 'Attention items', value: '3', delta: '+1', tone: 'bad' },
      { label: 'Ready to act', value: '2', tone: 'good' },
    ],
    decisionsNeeded: [
      {
        id: 'd1',
        title: 'Confirm priority for leadership briefing',
        urgency: 'high',
        context: 'Two competing asks need a single owner before COB.',
      },
      {
        id: 'd2',
        title: 'Validate source coverage',
        urgency: 'medium',
        context: 'Decision board is live but one source still uses placeholders.',
      },
    ],
    contextNotes:
      'Starter decision board derived from your workflow description. Edit steps in Design if another shape fits better.',
  };
}

function scorecardData(evidenceTitle?: string): ScorecardData {
  const from = evidenceTitle ? `From ${evidenceTitle}. ` : '';
  return {
    overallScore: 74,
    threshold: 70,
    rag: 'G',
    dimensions: [
      { id: 'a', label: 'Coverage', score: 80, rag: 'G', driver: `${from}Primary sources linked.` },
      { id: 'b', label: 'Freshness', score: 66, rag: 'A', driver: 'One feed older than 14 days.' },
      { id: 'c', label: 'Consistency', score: 78, rag: 'G', driver: 'No major contradictions.' },
      { id: 'd', label: 'Actionability', score: 71, rag: 'G', driver: 'Clear owners on open items.' },
    ],
  };
}

function briefingData(recipeId: WorkflowRecipeId, evidenceTitle: string): BriefingData {
  if (recipeId === 'fraud_deactivations') {
    return {
      sections: [
        {
          id: 's1',
          heading: 'Today’s count',
          body: '7 fraud-related deactivations overnight — 4 organisations and 3 individuals.',
          citations: [{ label: evidenceTitle, sourceType: 'api' }],
        },
        {
          id: 's2',
          heading: 'Reasons',
          body: 'Top reasons: aid diversion (3), fictitious beneficiaries (2), forged documentation (1), conflict-of-interest concealment (1).',
          citations: [{ label: evidenceTitle, sourceType: 'api' }],
        },
        {
          id: 's3',
          heading: 'What to do',
          body: 'Open today’s list, confirm names against active awards, and escalate any hit to Partnerships before mid-day.',
          citations: [],
        },
      ],
    };
  }
  if (recipeId === 'donor_reporting') {
    return {
      sections: [
        {
          id: 's1',
          heading: 'Pack completeness',
          body: 'Three of four required artefacts are present. The financial annex is still draft and blocks submission.',
          citations: [{ label: evidenceTitle, sourceType: 'resource' }],
        },
        {
          id: 's2',
          heading: 'Portal alignment',
          body: 'Portal totals match the completeness table for results indicators; two narrative pages diverge on geography wording.',
          citations: [{ label: 'Donor portal feed', sourceType: 'link' }],
        },
        {
          id: 's3',
          heading: 'Recommendation',
          body: 'Hold submission 48 hours, finalize the annex, and re-run readiness before leadership sign-off.',
          citations: [],
        },
      ],
    };
  }
  return {
    sections: [
      {
        id: 's1',
        heading: 'Situation',
        body: 'Outputs from this workflow summarize the linked sources into a leadership-ready narrative.',
        citations: [{ label: evidenceTitle, sourceType: 'resource' }],
      },
      {
        id: 's2',
        heading: 'What changed',
        body: 'Key metrics and open decisions shifted since the last refresh.',
        citations: [],
      },
      {
        id: 's3',
        heading: 'Ask of leadership',
        body: 'Confirm priorities and owners before the next reporting window.',
        citations: [],
      },
    ],
  };
}

function assuranceMatrixData(): AssuranceMatrixData {
  return {
    areas: [
      { id: 'design', label: 'Design', status: 'compliant', clearCount: 7, totalCount: 8 },
      { id: 'hact', label: 'HACT', status: 'attention', clearCount: 5, totalCount: 8 },
      { id: 'psea', label: 'PSEA', status: 'compliant', clearCount: 6, totalCount: 7 },
      { id: 'finance', label: 'Finance', status: 'attention', clearCount: 5, totalCount: 8 },
      { id: 'risk', label: 'Risk', status: 'action_needed', clearCount: 3, totalCount: 6 },
      { id: 'partner', label: 'Partners', status: 'attention', clearCount: 4, totalCount: 6 },
      { id: 'me', label: 'M&E', status: 'pending', clearCount: 0, totalCount: 5 },
      { id: 'gov', label: 'Governance', status: 'compliant', clearCount: 5, totalCount: 5 },
    ],
    checksPreview: [
      { areaId: 'risk', title: 'Risk register updated within 90 days', status: 'gap' },
      { areaId: 'risk', title: 'Mitigations have owners', status: 'clear' },
      { areaId: 'hact', title: 'Spot check completed this cycle', status: 'gap' },
      { areaId: 'psea', title: 'Focal point named', status: 'clear' },
      { areaId: 'me', title: 'Baseline indicators loaded', status: 'pending' },
    ],
  };
}

function actionQueueData(recipeId: WorkflowRecipeId): ActionQueueData {
  if (recipeId === 'fraud_deactivations') {
    return {
      items: [
        {
          id: 'a1',
          title: 'Coastal Relief Network — deactivated (aid diversion)',
          priority: 'high',
          owner: 'Compliance',
          status: 'open',
          dueLabel: 'Deactivated today',
        },
        {
          id: 'a2',
          title: 'Amina Hassan — deactivated (fictitious beneficiaries)',
          priority: 'high',
          owner: 'Integrity',
          status: 'open',
          dueLabel: 'Deactivated today',
        },
        {
          id: 'a3',
          title: 'Bay Livelihoods Consortium — deactivated (financial misconduct)',
          priority: 'medium',
          owner: 'Compliance',
          status: 'open',
          dueLabel: 'Deactivated today',
        },
        {
          id: 'a4',
          title: 'Confirm no active awards against today’s fraud list',
          priority: 'high',
          owner: 'Programme',
          status: 'open',
          dueLabel: 'Due by mid-day',
        },
      ],
    };
  }
  return {
    items: [
      {
        id: 'a1',
        title: 'Assign owner to top decision',
        priority: 'high',
        owner: 'Unassigned',
        status: 'open',
        dueLabel: 'Due today',
      },
      {
        id: 'a2',
        title: 'Refresh linked sources',
        priority: 'low',
        owner: 'Knowledge',
        status: 'open',
        dueLabel: 'Due in 5 days',
      },
    ],
  };
}

export function buildWorkflowOutputPayload(
  definition: WorkflowDefinition,
  meta: { title: string; subtitle: string; lastUpdated?: string; template?: OutputTemplate },
): WorkflowOutputPayload {
  const template = meta.template ?? definition.outputTemplate;
  const steps = definition.steps ?? [];
  const incomplete = steps.some((s) => s.configStatus === 'needs_setup');

  const fileTitles = steps.flatMap((s) => s.files ?? []);
  const linkedResources = fileTitles.map((title, i) => {
    const known = LINKABLE_WORKFLOW_RESOURCES.find((r) => r.title === title);
    return { id: known?.id ?? `file-${i}`, title };
  });

  const evidenceTitle = linkedResources[0]?.title ?? 'Linked evidence';

  let data: WorkflowOutputPayload['data'];
  switch (template) {
    case 'decision_board':
      data = decisionBoardData(definition.recipeId);
      break;
    case 'scorecard':
      data = scorecardData(evidenceTitle);
      break;
    case 'briefing':
      data = briefingData(definition.recipeId, evidenceTitle);
      break;
    case 'assurance_matrix':
      data = assuranceMatrixData();
      break;
    case 'action_queue':
      data = actionQueueData(definition.recipeId);
      break;
  }

  return {
    template,
    recipeId: definition.recipeId,
    title: meta.title,
    subtitle: meta.subtitle,
    lastUpdated: meta.lastUpdated ?? 'Just now',
    data,
    linkedResources,
    chatPrompt:
      definition.recipeId === 'fraud_deactivations'
        ? 'Ask about today’s count, a specific reason, or whether a contractor is on the fraud deactivation list.'
        : 'Ask why an area is amber, what’s blocking a check, or what leadership should do next.',
    incompleteHint: incomplete
      ? 'Some steps still need a prompt — preview may use placeholders.'
      : undefined,
    secondary: {
      showMap: definition.recipeId === 'situational_brief',
      mapFocus: definition.recipeId === 'situational_brief' ? 'Lower Shabelle' : undefined,
      showReport: definition.recipeId === 'donor_reporting',
      reportTitle: definition.recipeId === 'donor_reporting' ? 'Readiness report' : undefined,
      showDatatable: false,
      showApi: definition.recipeId === 'fraud_deactivations',
      datasetLabel:
        definition.recipeId === 'fraud_deactivations'
          ? 'Partner status & deactivation feed'
          : undefined,
    },
    incomplete,
  };
}

export function consumptionChatReply(input: {
  template: OutputTemplate;
  userText: string;
  selectionLabel?: string;
  recipeId?: WorkflowRecipeId;
}): string {
  const t = input.userText.toLowerCase();
  const fraud = input.recipeId === 'fraud_deactivations';

  if (fraud && input.selectionLabel) {
    return `On “${input.selectionLabel}”: this row came from today’s fraud filter on the status feed. Confirm against your active awards before mid-day.`;
  }

  if (input.selectionLabel) {
    return `On “${input.selectionLabel}”: the linked sources and latest sweep put this in the amber/attention band. Prefer a concrete owner and a dated next step.`;
  }

  if (fraud && (t.includes('why') || t.includes('reason') || t.includes('count'))) {
    return 'Today’s report is 7 fraud-related deactivations (4 orgs, 3 people). Open today’s list for name-level detail.';
  }
  if (t.includes('amber') || t.includes('why')) {
    return 'Amber usually means a threshold miss or stale evidence—not a hard stop. Open the linked source, confirm the driver, then escalate only if the owner cannot close it this week.';
  }
  if (t.includes('next')) {
    return fraud
      ? 'Open today’s list, search your active awards for those names, and escalate any hit to Partnerships before mid-day.'
      : 'Start with the highest-urgency open item, assign an owner, and ask again once evidence is refreshed.';
  }
  return fraud
    ? 'I can explain today’s count, a reason on the list, or whether a name should block an award.'
    : 'I can explain scores, open decisions, or summarize sources. Select an item in the main view for a contextual answer.';
}

export const OUTPUT_TEMPLATE_OPTIONS: {
  id: OutputTemplate;
  label: string;
  blurb: string;
}[] = [
  { id: 'decision_board', label: 'Decision board', blurb: 'KPIs and calls to make' },
  { id: 'scorecard', label: 'Scorecard', blurb: 'Scores and RAG drivers' },
  { id: 'briefing', label: 'Briefing', blurb: 'Narrative with citations' },
  { id: 'assurance_matrix', label: 'Assurance matrix', blurb: 'Area/check grid' },
  { id: 'action_queue', label: 'Action queue', blurb: 'Prioritized follow-ups' },
];
