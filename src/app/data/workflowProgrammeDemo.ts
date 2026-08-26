import type {
  AreaStatus,
  AuditCheck,
  CellRating,
  ComplianceAreaDetail,
  FcdoAuditArea,
  ProgrammeAudit,
  ProgrammeAuditStatus,
  TrendDirection,
} from './customWorkflowsMock';
import { FCDO_AUDIT_AREAS } from './customWorkflowsMock';
import type { ManagedWorkflow, WorkflowPipelineStep } from './workflowAdminMock';

/** Area ribbon segment used by wizard preview and portfolio cards. */
export type DemoAreaSegment = {
  id: string;
  shortLabel: string;
  fullLabel: string;
  status: AreaStatus;
};

const RAG_CYCLE: AreaStatus[] = [
  'compliant',
  'action_needed',
  'attention',
  'attention',
  'compliant',
  'compliant',
  'compliant',
  'compliant',
];

const FILLER_LABELS = [
  { short: 'Design', full: 'Programme design and logframe', area: 'Design' as FcdoAuditArea },
  { short: 'Approvals', full: 'Business case and approvals', area: 'Approvals' as FcdoAuditArea },
  { short: 'Finance', full: 'Financial management', area: 'Finance' as FcdoAuditArea },
  { short: 'Delivery', full: 'Delivery and results', area: 'Delivery' as FcdoAuditArea },
  { short: 'Risk', full: 'Risk management', area: 'Risk' as FcdoAuditArea },
  { short: 'VfM', full: 'Value for money', area: 'VfM' as FcdoAuditArea },
  { short: 'Safeguard', full: 'Safeguarding', area: 'Safeguarding' as FcdoAuditArea },
  { short: 'M&E', full: 'Monitoring and evaluation', area: 'M and E' as FcdoAuditArea },
  { short: 'Governance', full: 'Governance and oversight', area: 'Governance' as FcdoAuditArea },
] as const;

const MIN_RIBBON_SEGMENTS = 6;

export type SampleRecord = {
  title: string;
  code: string;
  iatiId: string;
  geography: string;
  budget: string;
};

export function shortLabelFromTitle(title: string): string {
  const cleaned = title
    .replace(/\s*&\s*/g, ' & ')
    .replace(/Compliance|Management|Capacity|Documentation/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/hact/i.test(title)) return 'HACT';
  if (/psea/i.test(title)) return 'PSEA';
  if (/m\s*&\s*e|monitoring|evidence/i.test(title)) return 'M&E';
  if (/partner/i.test(title)) return 'Partner';
  if (/govern/i.test(title)) return 'Governance';
  if (/financ/i.test(title)) return 'Finance';
  if (/risk/i.test(title)) return 'Risk';
  if (/design|document/i.test(title)) return 'Design';
  if (/safeguard/i.test(title)) return 'Safeguard';
  if (/approv/i.test(title)) return 'Approvals';
  if (/deliver/i.test(title)) return 'Delivery';
  if (/vfm|value/i.test(title)) return 'VfM';
  const first = cleaned.split(' ')[0] || title;
  return first.length > 12 ? `${first.slice(0, 10)}…` : first;
}

function matchFcdoArea(label: string, used: Set<FcdoAuditArea>): FcdoAuditArea {
  const candidates: Array<{ test: RegExp; area: FcdoAuditArea }> = [
    { test: /design|logframe|document/i, area: 'Design' },
    { test: /approv|business case/i, area: 'Approvals' },
    { test: /financ|hact|budget/i, area: 'Finance' },
    { test: /deliver|result|partner/i, area: 'Delivery' },
    { test: /risk/i, area: 'Risk' },
    { test: /vfm|value/i, area: 'VfM' },
    { test: /safeguard|psea/i, area: 'Safeguarding' },
    { test: /m\s*&\s*e|monitor|evidence/i, area: 'M and E' },
    { test: /govern/i, area: 'Governance' },
  ];
  for (const { test, area } of candidates) {
    if (test.test(label) && !used.has(area)) return area;
  }
  for (const area of FCDO_AUDIT_AREAS) {
    if (!used.has(area)) return area;
  }
  return 'Governance';
}

/** Build ribbon segments from pipeline check steps (same logic as wizard preview). */
export function previewAreasFromSteps(steps: WorkflowPipelineStep[]): DemoAreaSegment[] {
  const checks = steps.filter((s) => s.kind === 'check');
  const source = checks.length > 0 ? checks : steps.filter((s) => s.kind !== 'output');
  const fromSteps: DemoAreaSegment[] = source.slice(0, 8).map((s, i) => ({
    id: s.id,
    shortLabel: shortLabelFromTitle(s.title),
    fullLabel: s.title,
    status: RAG_CYCLE[i % RAG_CYCLE.length],
  }));

  if (fromSteps.length === 0) return [];

  const used = new Set(fromSteps.map((a) => a.shortLabel.toLowerCase()));
  let padIndex = fromSteps.length;
  for (const filler of FILLER_LABELS) {
    if (fromSteps.length >= MIN_RIBBON_SEGMENTS) break;
    if (used.has(filler.short.toLowerCase())) continue;
    fromSteps.push({
      id: `pad-${filler.short}`,
      shortLabel: filler.short,
      fullLabel: filler.full,
      status: RAG_CYCLE[padIndex % RAG_CYCLE.length],
    });
    used.add(filler.short.toLowerCase());
    padIndex += 1;
  }

  return fromSteps;
}

export function sampleRecordsForWorkflow(workflow: ManagedWorkflow): [SampleRecord, SampleRecord] {
  const record = workflow.recordType?.trim() || 'Project';
  if (/partner/i.test(record)) {
    return [
      {
        title: 'Coastal Relief Network — Mogadishu',
        code: 'CRN-MOG',
        iatiId: 'GB-GOV-1-301188',
        geography: 'Banadir',
        budget: '£18.4m',
      },
      {
        title: 'Jubaland Health Partners Consortium',
        code: 'JHPC',
        iatiId: 'GB-GOV-1-301204',
        geography: 'Jubaland',
        budget: '£9.2m',
      },
    ];
  }
  if (/contractor/i.test(record)) {
    return [
      {
        title: 'Bay Livelihoods Consortium',
        code: 'BLC-01',
        iatiId: 'GB-GOV-1-300912',
        geography: 'Bay',
        budget: '£12.6m',
      },
      {
        title: 'Hirshabelle Infrastructure Alliance',
        code: 'HIA-22',
        iatiId: 'GB-GOV-1-300955',
        geography: 'Hirshabelle',
        budget: '£7.8m',
      },
    ];
  }
  return [
    {
      title: 'Durable Solutions Initiative — Baidoa',
      code: 'DSI-BAI',
      iatiId: 'GB-GOV-1-300441',
      geography: 'South West State',
      budget: '£24.5m',
    },
    {
      title: 'Somalia Humanitarian & Resilience Programme',
      code: 'SHARP',
      iatiId: 'GB-GOV-1-300123',
      geography: 'Nationwide',
      budget: '£142.0m',
    },
  ];
}

export function greenerDemoAreas(areas: DemoAreaSegment[]): DemoAreaSegment[] {
  return areas.map((area, i) => ({
    ...area,
    id: `${area.id}-g`,
    status: (i === 2 ? 'attention' : 'compliant') as AreaStatus,
  }));
}

export function statusFromDemoAreas(areas: DemoAreaSegment[]): {
  status: ProgrammeAuditStatus;
  score: number;
  trend: TrendDirection;
  trendPoints: number;
  summary: string;
  docsChanged: number;
} {
  const hasRed = areas.some((a) => a.status === 'action_needed');
  const hasAmber = areas.some((a) => a.status === 'attention');
  if (hasRed) {
    const redLabel = areas.find((a) => a.status === 'action_needed')?.shortLabel ?? 'Finance';
    return {
      status: 'attention',
      score: 74,
      trend: 'down',
      trendPoints: 6,
      summary: `Strong overall, but a **missing Q2 evidence pack** has pulled ${redLabel} to red and dragged the score down. One refresh would return this record to green.`,
      docsChanged: 2,
    };
  }
  if (hasAmber) {
    return {
      status: 'attention',
      score: 82,
      trend: 'flat',
      trendPoints: 0,
      summary:
        'Most checks are clear. **Two amber areas** need a light refresh before the next leadership review — nothing blocking publication.',
      docsChanged: 1,
    };
  }
  return {
    status: 'compliant',
    score: 91,
    trend: 'up',
    trendPoints: 3,
    summary:
      'All check steps are green. Evidence is current and the score has improved since the last sweep.',
    docsChanged: 0,
  };
}

function compliantCheck(id: string, title: string, problem: string): AuditCheck {
  return {
    id,
    title,
    status: 'compliant',
    problem,
    evidence: {
      fileName: `${title.replace(/[^\w\s-]/g, '').slice(0, 28)}.pdf`,
      source: 'SharePoint',
      updatedAt: '12 Mar 2025',
      badge: 'current',
      badgeLabel: 'Current',
    },
    fix: {
      kind: 'none',
      title: 'Nothing outstanding.',
      description: 'Nothing to do. Evidence is complete and current.',
    },
  };
}

function attentionCheck(id: string, title: string, problem: string): AuditCheck {
  return {
    id,
    title,
    status: 'attention',
    problem,
    evidence: {
      fileName: `${title.replace(/[^\w\s-]/g, '').slice(0, 28)}.pdf`,
      source: 'SharePoint',
      updatedAt: '01 Mar 2025',
      badge: 'outdated',
      badgeLabel: 'Needs refresh',
    },
    fix: {
      kind: 'required',
      title: 'Required action',
      description: 'Refresh the linked evidence so this check can move back to green.',
    },
  };
}

function actionCheck(id: string, title: string, problem: string): AuditCheck {
  return {
    id,
    title,
    status: 'action_needed',
    problem,
    evidence: null,
    fix: {
      kind: 'required',
      title: 'Required action',
      description: 'Upload the missing evidence pack so this check can be cleared.',
    },
  };
}

function checksForArea(
  prefix: string,
  fullLabel: string,
  status: AreaStatus,
): AuditCheck[] {
  const base = fullLabel.replace(/^Check:\s*/i, '').trim() || 'Evidence pack';
  if (status === 'pending') return [];
  if (status === 'action_needed') {
    return [
      actionCheck(
        `${prefix}-missing`,
        `${base} — primary evidence`,
        `The primary evidence for ${base} is missing from linked sources.`,
      ),
      compliantCheck(
        `${prefix}-ok`,
        `${base} — secondary file`,
        `Secondary documentation for ${base} is present and current.`,
      ),
    ];
  }
  if (status === 'attention') {
    return [
      attentionCheck(
        `${prefix}-stale`,
        `${base} — currency check`,
        `Evidence for ${base} is on file but looks outdated relative to the last review cycle.`,
      ),
      compliantCheck(
        `${prefix}-ok`,
        `${base} — filed`,
        `${base} has a filed pack that still meets the baseline requirement.`,
      ),
    ];
  }
  return [
    compliantCheck(
      `${prefix}-a`,
      `${base} documented`,
      `${base} is documented and consistent with the approved framework.`,
    ),
    compliantCheck(
      `${prefix}-b`,
      `${base} filed`,
      `Supporting files for ${base} are filed and current.`,
    ),
    compliantCheck(
      `${prefix}-c`,
      `${base} aligned`,
      `${base} aligns with the linked programme plan.`,
    ),
  ];
}

function areaDetailFromSegment(
  segment: DemoAreaSegment,
  fcdoArea: FcdoAuditArea,
  programmeKey: string,
): ComplianceAreaDetail {
  const checks = checksForArea(`${programmeKey}-${segment.id}`, segment.fullLabel, segment.status);
  const clearCount = checks.filter((c) => c.status === 'compliant').length;
  return {
    area: fcdoArea,
    shortLabel: segment.shortLabel,
    fullLabel: segment.fullLabel,
    status: segment.status,
    clearCount,
    totalCount: checks.length,
    summary:
      segment.status === 'compliant'
        ? `${segment.fullLabel} is clear.`
        : segment.status === 'attention'
          ? `${segment.fullLabel} needs a light refresh.`
          : segment.status === 'action_needed'
            ? `${segment.fullLabel} is blocking — evidence is missing.`
            : 'This area has not been assessed yet.',
    checks,
  };
}

function ratingsFromDemoAreas(
  areas: ComplianceAreaDetail[],
): Record<FcdoAuditArea, CellRating> {
  const statusToRag: Record<Exclude<AreaStatus, 'pending'>, 'G' | 'A' | 'R'> = {
    compliant: 'G',
    attention: 'A',
    action_needed: 'R',
  };
  const map = Object.fromEntries(
    FCDO_AUDIT_AREAS.map((area) => [area, null as CellRating]),
  ) as Record<FcdoAuditArea, CellRating>;
  for (const item of areas) {
    map[item.area] = item.status === 'pending' ? null : statusToRag[item.status];
  }
  return map;
}

function buildAreas(
  segments: DemoAreaSegment[],
  programmeKey: string,
): ComplianceAreaDetail[] {
  const used = new Set<FcdoAuditArea>();
  return segments.map((segment) => {
    const fcdoArea = matchFcdoArea(`${segment.shortLabel} ${segment.fullLabel}`, used);
    used.add(fcdoArea);
    return areaDetailFromSegment(segment, fcdoArea, programmeKey);
  });
}

function buildProgrammeAudit(input: {
  id: string;
  record: SampleRecord;
  segments: DemoAreaSegment[];
  lastReviewRelative: string;
}): ProgrammeAudit {
  const tone = statusFromDemoAreas(input.segments);
  const areas = buildAreas(input.segments, input.id);
  const amberOrRed = areas.find(
    (a) => a.status === 'action_needed' || a.status === 'attention',
  );
  const priorityCheck = amberOrRed?.checks.find((c) => c.status !== 'compliant');

  return {
    id: input.id,
    title: input.record.title,
    fullTitle: input.record.title,
    code: input.record.code,
    iatiId: input.record.iatiId,
    geography: input.record.geography,
    budget: input.record.budget,
    status: tone.status,
    score: tone.score,
    trendPoints: tone.trendPoints,
    trend: tone.trend,
    lastAudited: 'Aug 2026',
    lastReviewRelative: input.lastReviewRelative,
    summary: tone.summary,
    priorityAction:
      priorityCheck && amberOrRed
        ? {
            checkId: priorityCheck.id,
            title: priorityCheck.title,
            description: priorityCheck.fix.description,
          }
        : null,
    ratings: ratingsFromDemoAreas(areas),
    areas,
    history: [
      {
        id: `${input.id}-hist-1`,
        when: input.lastReviewRelative,
        tone: tone.status,
        description: `Full AI sweep completed. Score ${tone.score} out of 100.`,
      },
    ],
  };
}

/**
 * Demo programme audits for a published AI workflow — same FCDO portfolio → detail
 * shape as Custom Workflows FCDO Compliance Review.
 */
export function buildDemoProgrammeAuditsFromWorkflow(
  workflow: ManagedWorkflow,
): ProgrammeAudit[] {
  const steps = workflow.definition?.steps ?? [];
  const segments = previewAreasFromSteps(steps);
  if (segments.length === 0) {
    // Fallback: nine pending FCDO-style areas so the shell still renders.
    const pending: DemoAreaSegment[] = FILLER_LABELS.map((f, i) => ({
      id: `empty-${i}`,
      shortLabel: f.short,
      fullLabel: f.full,
      status: 'pending' as AreaStatus,
    }));
    const [primary] = sampleRecordsForWorkflow(workflow);
    return [
      buildProgrammeAudit({
        id: `${workflow.id}-rec-1`,
        record: primary,
        segments: pending,
        lastReviewRelative: 'just now',
      }),
    ];
  }

  const [primary, secondary] = sampleRecordsForWorkflow(workflow);
  return [
    buildProgrammeAudit({
      id: `${workflow.id}-rec-1`,
      record: primary,
      segments,
      lastReviewRelative: '2 days ago',
    }),
    buildProgrammeAudit({
      id: `${workflow.id}-rec-2`,
      record: secondary,
      segments: greenerDemoAreas(segments),
      lastReviewRelative: '5 days ago',
    }),
  ];
}
