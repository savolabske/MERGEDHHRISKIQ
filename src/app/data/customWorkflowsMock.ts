export type RagRating = 'G' | 'A' | 'R';

/** Null means the area has not been assessed yet. */
export type CellRating = RagRating | null;

export type ProgrammeAuditStatus =
  | 'compliant'
  | 'attention'
  | 'action_needed'
  | 'scanning';

export type AreaStatus = 'compliant' | 'attention' | 'action_needed' | 'pending';

export type TrendDirection = 'up' | 'down' | 'flat';

export type EvidenceBadge = 'current' | 'outdated' | 'missing';

export const FCDO_AUDIT_AREAS = [
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

export type FcdoAuditArea = (typeof FCDO_AUDIT_AREAS)[number];

export interface AuditCheckEvidence {
  fileName: string;
  source: string;
  updatedAt: string;
  badge: EvidenceBadge;
  badgeLabel: string;
}

export interface AuditCheckFix {
  kind: 'none' | 'required';
  title: string;
  description: string;
}

export interface AuditCheck {
  id: string;
  title: string;
  status: Exclude<ProgrammeAuditStatus, 'scanning'>;
  problem: string;
  evidence: AuditCheckEvidence | null;
  fix: AuditCheckFix;
}

export interface ComplianceAreaDetail {
  area: FcdoAuditArea;
  shortLabel: string;
  fullLabel: string;
  status: AreaStatus;
  clearCount: number;
  totalCount: number;
  summary: string;
  checks: AuditCheck[];
}

export interface ProgrammePriorityAction {
  checkId: string;
  title: string;
  description: string;
}

export interface ReviewHistoryItem {
  id: string;
  when: string;
  tone: ProgrammeAuditStatus;
  description: string;
}

export interface ProgrammeScanProgress {
  assessed: number;
  total: number;
}

export interface ProgrammeAudit {
  id: string;
  title: string;
  fullTitle: string;
  code: string;
  iatiId: string;
  geography: string;
  budget: string;
  status: ProgrammeAuditStatus;
  /** Null while the first sweep is still running. */
  score: number | null;
  trendPoints: number;
  trend: TrendDirection;
  lastAudited: string;
  lastReviewRelative: string;
  summary: string;
  priorityAction: ProgrammePriorityAction | null;
  scanProgress?: ProgrammeScanProgress;
  ratings: Record<FcdoAuditArea, CellRating>;
  areas: ComplianceAreaDetail[];
  history: ReviewHistoryItem[];
}

function compliantCheck(
  id: string,
  title: string,
  problem: string,
  evidence: AuditCheckEvidence,
): AuditCheck {
  return {
    id,
    title,
    status: 'compliant',
    problem,
    evidence,
    fix: {
      kind: 'none',
      title: 'Nothing outstanding.',
      description: 'Nothing to do. Evidence is complete and current.',
    },
  };
}

function attentionCheck(
  id: string,
  title: string,
  problem: string,
  evidence: AuditCheckEvidence,
  fix: AuditCheckFix,
): AuditCheck {
  return { id, title, status: 'attention', problem, evidence, fix };
}

function actionCheck(
  id: string,
  title: string,
  problem: string,
  evidence: AuditCheckEvidence | null,
  fix: AuditCheckFix,
): AuditCheck {
  return { id, title, status: 'action_needed', problem, evidence, fix };
}

function areaDetail(
  name: FcdoAuditArea,
  shortLabel: string,
  fullLabel: string,
  summary: string,
  checks: AuditCheck[],
): ComplianceAreaDetail {
  const clearCount = checks.filter((c) => c.status === 'compliant').length;
  const hasAction = checks.some((c) => c.status === 'action_needed');
  const hasAttention = checks.some((c) => c.status === 'attention');
  const status: AreaStatus = hasAction
    ? 'action_needed'
    : hasAttention
      ? 'attention'
      : 'compliant';

  return {
    area: name,
    shortLabel,
    fullLabel,
    status,
    clearCount,
    totalCount: checks.length,
    summary,
    checks,
  };
}

function pendingArea(
  name: FcdoAuditArea,
  shortLabel: string,
  fullLabel: string,
): ComplianceAreaDetail {
  return {
    area: name,
    shortLabel,
    fullLabel,
    status: 'pending',
    clearCount: 0,
    totalCount: 0,
    summary: 'This area has not been assessed yet. The first sweep is still running.',
    checks: [],
  };
}

function ratingsFromAreas(
  areas: ComplianceAreaDetail[],
): Record<FcdoAuditArea, CellRating> {
  const statusToRag: Record<Exclude<AreaStatus, 'pending'>, RagRating> = {
    compliant: 'G',
    attention: 'A',
    action_needed: 'R',
  };
  return Object.fromEntries(
    areas.map((item) => [
      item.area,
      item.status === 'pending' ? null : statusToRag[item.status],
    ]),
  ) as Record<FcdoAuditArea, CellRating>;
}

export function ragCounts(checks: AuditCheck[]): { g: number; a: number; r: number } {
  return checks.reduce(
    (acc, check) => {
      if (check.status === 'compliant') acc.g += 1;
      else if (check.status === 'attention') acc.a += 1;
      else acc.r += 1;
      return acc;
    },
    { g: 0, a: 0, r: 0 },
  );
}

export function formatRagSummary(checks: AuditCheck[]): string {
  const { g, a, r } = ragCounts(checks);
  const parts: string[] = [];
  if (r) parts.push(`${r}R`);
  if (a) parts.push(`${a}A`);
  if (g) parts.push(`${g}G`);
  return parts.join(' ') || '0G';
}

const SHARP_AREAS: ComplianceAreaDetail[] = [
  areaDetail(
    'Design',
    'Design',
    'Programme design and logframe',
    'Logframe is current and aligned. Theory of change and baselines are documented.',
    [
      compliantCheck(
        'sharp-design-toc',
        'Theory of change documented',
        'The theory of change is present and consistent with the approved business case.',
        {
          fileName: 'SHARP Concept Note v4.pdf',
          source: 'SharePoint',
          updatedAt: '12 Mar 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-design-baselines',
        'Logframe indicators have baselines',
        'All logframe indicators include baselines and milestones for the current phase.',
        {
          fileName: 'SHARP Logframe 2025.xlsx',
          source: 'SharePoint',
          updatedAt: '04 Feb 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-design-country-plan',
        'Results aligned to FCDO country plan',
        'Outcome statements map cleanly to the FCDO Somalia country plan priorities.',
        {
          fileName: 'Country plan alignment note.pdf',
          source: 'DevTracker',
          updatedAt: '18 Jan 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'Approvals',
    'Approvals',
    'Business case and approvals',
    'Addendum 3 has SRO sign-off but is missing the finance countersignature.',
    [
      compliantCheck(
        'sharp-approvals-sro',
        'SRO sign-off recorded',
        'Senior Responsible Owner approval is on file for the current phase.',
        {
          fileName: 'SRO approval memo.pdf',
          source: 'SharePoint',
          updatedAt: '20 Jan 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      attentionCheck(
        'sharp-approvals-addendum',
        'Addendum 3 approval signed',
        'Addendum 3, the budget extension, has SRO sign-off but is missing the finance countersignature that is required above £5m.',
        {
          fileName: 'Addendum 3, draft approval.pdf',
          source: 'SharePoint',
          updatedAt: '01 Mar 2025',
          badge: 'outdated',
          badgeLabel: 'Signed 2 of 3',
        },
        {
          kind: 'required',
          title: 'Required action',
          description:
            'Get the finance countersignature on Addendum 3. That moves this check to green.',
        },
      ),
      compliantCheck(
        'sharp-approvals-minutes',
        'Approval minutes filed',
        'Board and programme board minutes covering the latest approval cycle are present.',
        {
          fileName: 'Programme board minutes Feb 2025.pdf',
          source: 'SharePoint',
          updatedAt: '28 Feb 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'Finance',
    'Finance',
    'Financial management',
    'Q2 financial report is missing from every linked source, so the quarter cannot be reconciled.',
    [
      actionCheck(
        'sharp-finance-q2',
        'Q2 2025 financial report',
        'The Q2 2025 financial report is missing from SharePoint, DevTracker and the finance mailbox. Forecast figures are still based on Q1.',
        null,
        {
          kind: 'required',
          title: 'Required action',
          description:
            'Upload the Q2 2025 financial report from the implementing partner so the quarter can be reconciled.',
        },
      ),
      attentionCheck(
        'sharp-finance-forecast',
        'Forecast reconciled to spend',
        'Forecast still uses Q1 actuals. Once Q2 lands, re-run the reconciliation.',
        {
          fileName: 'Forecast pack Q1 2025.xlsx',
          source: 'SharePoint',
          updatedAt: '15 Feb 2025',
          badge: 'outdated',
          badgeLabel: 'Outdated',
        },
        {
          kind: 'required',
          title: 'Required action',
          description: 'Re-run forecast reconciliation after the Q2 report is uploaded.',
        },
      ),
      compliantCheck(
        'sharp-finance-audit',
        'Annual audit letter on file',
        'The latest external audit letter is present and within the required retention window.',
        {
          fileName: 'External audit letter 2024.pdf',
          source: 'SharePoint',
          updatedAt: '10 Nov 2024',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'Delivery',
    'Delivery',
    'Delivery and results',
    'Delivery milestones for the current quarter are evidenced and on track.',
    [
      compliantCheck(
        'sharp-delivery-milestones',
        'Quarterly milestones evidenced',
        'Milestone evidence packs for Q1 and the current period are complete.',
        {
          fileName: 'Milestone evidence Q1.pdf',
          source: 'SharePoint',
          updatedAt: '22 Feb 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-delivery-partner',
        'Partner delivery reports current',
        'Implementing partner narrative reports are filed for the last reporting cycle.',
        {
          fileName: 'Partner narrative Jan-Feb.pdf',
          source: 'SharePoint',
          updatedAt: '05 Mar 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'Risk',
    'Risk',
    'Risk management',
    'Risk register is current and residual ratings match the latest programme board review.',
    [
      compliantCheck(
        'sharp-risk-register',
        'Risk register updated',
        'The live risk register was refreshed within the last 30 days.',
        {
          fileName: 'SHARP risk register.xlsx',
          source: 'SharePoint',
          updatedAt: '08 Mar 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-risk-escalation',
        'Escalation path documented',
        'Escalation thresholds and owners are documented in the operations manual.',
        {
          fileName: 'Ops manual v3.pdf',
          source: 'SharePoint',
          updatedAt: '12 Dec 2024',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'VfM',
    'VfM',
    'Value for money',
    'Economy and efficiency are evidenced; one effectiveness measure needs an updated benchmark.',
    [
      compliantCheck(
        'sharp-vfm-economy',
        'Economy analysis complete',
        'Unit cost benchmarks for the main delivery lines are on file.',
        {
          fileName: 'VfM economy note.pdf',
          source: 'SharePoint',
          updatedAt: '14 Jan 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      attentionCheck(
        'sharp-vfm-effectiveness',
        'Effectiveness benchmark updated',
        'The effectiveness benchmark still references 2023 unit outcomes and should be refreshed for the current phase.',
        {
          fileName: 'VfM effectiveness note.pdf',
          source: 'SharePoint',
          updatedAt: '02 Sep 2024',
          badge: 'outdated',
          badgeLabel: 'Outdated',
        },
        {
          kind: 'required',
          title: 'Required action',
          description: 'Refresh the effectiveness benchmark with 2025 outcome data.',
        },
      ),
    ],
  ),
  areaDetail(
    'Safeguarding',
    'Safeguard',
    'Safeguarding',
    'Safeguarding policy and referral pathways are current.',
    [
      compliantCheck(
        'sharp-safe-policy',
        'Safeguarding policy current',
        'Policy version on file matches the organisational standard.',
        {
          fileName: 'Safeguarding policy 2025.pdf',
          source: 'SharePoint',
          updatedAt: '03 Jan 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-safe-referrals',
        'Referral pathway documented',
        'Referral contacts and SLAs are documented for all delivery locations.',
        {
          fileName: 'Referral pathway map.pdf',
          source: 'SharePoint',
          updatedAt: '19 Feb 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'M and E',
    'M and E',
    'Monitoring and evaluation',
    'MEAL plan and latest monitoring pack are complete.',
    [
      compliantCheck(
        'sharp-me-plan',
        'MEAL plan approved',
        'The MEAL plan for the current phase is approved and filed.',
        {
          fileName: 'MEAL plan 2025.pdf',
          source: 'SharePoint',
          updatedAt: '11 Jan 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-me-pack',
        'Latest monitoring pack filed',
        'The most recent monitoring pack includes indicator tables and narrative.',
        {
          fileName: 'Monitoring pack Feb 2025.pdf',
          source: 'SharePoint',
          updatedAt: '01 Mar 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
  areaDetail(
    'Governance',
    'Governance',
    'Governance and oversight',
    'Programme board cadence and decision log are in place.',
    [
      compliantCheck(
        'sharp-gov-board',
        'Programme board cadence met',
        'Board meetings are recorded for the last two quarters.',
        {
          fileName: 'Board pack Q4-Q1.pdf',
          source: 'SharePoint',
          updatedAt: '25 Feb 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
      compliantCheck(
        'sharp-gov-decisions',
        'Decision log maintained',
        'Key decisions from the programme board are logged with owners and dates.',
        {
          fileName: 'Decision log.xlsx',
          source: 'SharePoint',
          updatedAt: '25 Feb 2025',
          badge: 'current',
          badgeLabel: 'Current',
        },
      ),
    ],
  ),
];

function stubAreasFromTemplate(
  seed: string,
  overrides: Partial<Record<FcdoAuditArea, AreaStatus>>,
): ComplianceAreaDetail[] {
  return SHARP_AREAS.map((template) => {
    const status = overrides[template.area] ?? 'compliant';
    if (status === 'pending') {
      return pendingArea(template.area, template.shortLabel, template.fullLabel);
    }

    const clearFix = {
      kind: 'none' as const,
      title: 'Nothing outstanding.',
      description: 'Nothing to do. Evidence is complete and current.',
    };

    let checks: AuditCheck[];
    let summary = template.summary;

    if (status === 'compliant') {
      checks = template.checks.map((check) => ({
        ...check,
        id: `${seed}-${check.id}`,
        status: 'compliant' as const,
        fix: clearFix,
      }));
    } else if (status === 'attention') {
      const openCheck = template.checks[0];
      checks = template.checks.map((check, index) =>
        index === 0
          ? {
              ...check,
              id: `${seed}-${check.id}`,
              status: 'attention' as const,
              problem: `${check.title} evidence is outdated and needs a refresh before this area can clear.`,
              evidence: check.evidence
                ? {
                    ...check.evidence,
                    badge: 'outdated' as const,
                    badgeLabel: 'Outdated',
                  }
                : null,
              fix: {
                kind: 'required' as const,
                title: 'Required action',
                description: `Refresh ${check.title.toLowerCase()} evidence so ${template.fullLabel.toLowerCase()} can clear.`,
              },
            }
          : {
              ...check,
              id: `${seed}-${check.id}`,
              status: 'compliant' as const,
              fix: clearFix,
            },
      );
      summary = openCheck
        ? `${template.fullLabel} is mostly clear. One amber item remains open — ${openCheck.title}.`
        : template.summary;
    } else {
      const missingCheck = template.checks[0];
      checks = template.checks.map((check, index) =>
        index === 0
          ? {
              ...check,
              id: `${seed}-${check.id}`,
              status: 'action_needed' as const,
              evidence: null,
              problem: `Critical evidence for ${check.title.toLowerCase()} is missing.`,
              fix: {
                kind: 'required' as const,
                title: 'Required action',
                description: `Upload the missing evidence for ${check.title.toLowerCase()}.`,
              },
            }
          : index === 1
            ? {
                ...check,
                id: `${seed}-${check.id}`,
                status: 'attention' as const,
                problem: `${check.title} needs a refresh once the critical gap above is closed.`,
                evidence: check.evidence
                  ? {
                      ...check.evidence,
                      badge: 'outdated' as const,
                      badgeLabel: 'Outdated',
                    }
                  : null,
                fix: {
                  kind: 'required' as const,
                  title: 'Required action',
                  description: `Refresh ${check.title.toLowerCase()} after the missing evidence is uploaded.`,
                },
              }
            : {
                ...check,
                id: `${seed}-${check.id}`,
                status: 'compliant' as const,
                fix: clearFix,
              },
      );
      summary = missingCheck
        ? `${template.fullLabel} is blocked until ${missingCheck.title.toLowerCase()} evidence is uploaded.`
        : template.summary;
    }

    return areaDetail(
      template.area,
      template.shortLabel,
      template.fullLabel,
      summary,
      checks,
    );
  });
}

export const FCDO_PROGRAMME_AUDITS: ProgrammeAudit[] = [
  {
    id: 'sharp',
    title: 'Somalia Humanitarian & Resilience Programme',
    fullTitle: 'Somalia Humanitarian and Resilience Programme',
    code: 'SHARP',
    iatiId: 'GB-GOV-1-300123',
    geography: 'Nationwide',
    budget: '£142.0m',
    status: 'attention',
    score: 74,
    trendPoints: 6,
    trend: 'down',
    lastAudited: 'Mar 12, 2026',
    lastReviewRelative: '2 days ago',
    summary:
      'Strong overall, but a **missing Q2 financial report** has pulled Finance to red and dragged the score down. One approval countersignature and two refreshes would return this programme to green.',
    priorityAction: {
      checkId: 'sharp-finance-q2',
      title: 'Provide the Q2 2025 financial report.',
      description:
        'It is missing from every linked source, so the quarter cannot be reconciled and the forecast is running on old figures.',
    },
    areas: SHARP_AREAS,
    ratings: ratingsFromAreas(SHARP_AREAS),
    history: [
      {
        id: 'h1',
        when: '2 days ago',
        tone: 'attention',
        description: 'Full AI sweep completed. Score 74 out of 100. 1 area moved to red.',
      },
      {
        id: 'h2',
        when: '2 weeks ago',
        tone: 'attention',
        description:
          'Addendum 3 uploaded. Approvals moved to amber pending the finance countersignature.',
      },
      {
        id: 'h3',
        when: '6 weeks ago',
        tone: 'compliant',
        description:
          'Full review. Score 80 out of 100, all areas green or amber. Result cached and reused for 30 days.',
      },
    ],
  },
  {
    id: 'gess',
    title: 'Girls’ Education Somalia',
    fullTitle: 'Girls’ Education Somalia Programme',
    code: 'GESS',
    iatiId: 'GB-GOV-1-301045',
    geography: 'Puntland, Somaliland',
    budget: '£58.4m',
    status: 'action_needed',
    score: 61,
    trendPoints: 11,
    trend: 'down',
    lastAudited: 'Mar 12, 2026',
    lastReviewRelative: '1 day ago',
    summary:
      'Below the 65% threshold. **Safeguarding policy has lapsed its review date** and the annual review is overdue. Two critical actions needed before the next board.',
    priorityAction: {
      checkId: 'gess-sharp-safe-policy',
      title: 'Renew the safeguarding policy and close the overdue annual review.',
      description:
        'Safeguarding stays red until the policy review date is current and the annual review is filed.',
    },
    areas: stubAreasFromTemplate('gess', {
      Finance: 'attention',
      Delivery: 'attention',
      Risk: 'action_needed',
      Safeguarding: 'action_needed',
      'M and E': 'attention',
    }),
    ratings: {
      Design: 'G',
      Approvals: 'G',
      Finance: 'A',
      Delivery: 'A',
      Risk: 'R',
      VfM: 'G',
      Safeguarding: 'R',
      'M and E': 'A',
      Governance: 'G',
    },
    history: [
      {
        id: 'g1',
        when: '1 day ago',
        tone: 'action_needed',
        description:
          'Full AI sweep completed. Score 61 out of 100. Safeguarding and risk remain red.',
      },
      {
        id: 'g2',
        when: '3 weeks ago',
        tone: 'attention',
        description: 'Partial evidence pack uploaded. Score fell 11 points after policy lapse.',
      },
    ],
  },
  {
    id: 'biyooole',
    title: 'Biyoole Water & Livelihoods',
    fullTitle: 'Biyoole Water for Agro-pastoral Livelihoods',
    code: 'Biyoole',
    iatiId: 'GB-GOV-1-300812',
    geography: 'Puntland & Somaliland',
    budget: '£48.2m',
    status: 'compliant',
    score: 91,
    trendPoints: 0,
    trend: 'flat',
    lastAudited: 'Mar 4, 2026',
    lastReviewRelative: '1 week ago',
    summary:
      'Programme is largely clear. Risk still has one amber item — the **risk register evidence is outdated** and needs a refresh before the next programme board review.',
    priorityAction: null,
    areas: stubAreasFromTemplate('biyooole', { Risk: 'attention' }),
    ratings: {
      Design: 'G',
      Approvals: 'G',
      Finance: 'G',
      Delivery: 'G',
      Risk: 'A',
      VfM: 'G',
      Safeguarding: 'G',
      'M and E': 'G',
      Governance: 'G',
    },
    history: [
      {
        id: 'b1',
        when: '1 week ago',
        tone: 'compliant',
        description: 'Full AI sweep completed. Score 91 out of 100. Risk remains amber.',
      },
    ],
  },
  {
    id: 'damal',
    title: 'Damal Caafimaad Health Systems',
    fullTitle: 'Damal Caafimaad Health Systems Strengthening',
    code: 'Damal',
    iatiId: 'GB-GOV-1-301104',
    geography: 'South West State',
    budget: '£62.7m',
    status: 'attention',
    score: 78,
    trendPoints: 3,
    trend: 'down',
    lastAudited: 'Feb 28, 2026',
    lastReviewRelative: '10 days ago',
    summary:
      '**Safeguarding** is the main blocker. A delayed referral register has pulled the score down and left three adjacent areas amber.',
    priorityAction: {
      checkId: 'damal-sharp-safe-policy',
      title: 'Complete the safeguarding referral register for February.',
      description:
        'The register is incomplete across two partners, so safeguarding stays red until all cases are logged.',
    },
    areas: stubAreasFromTemplate('damal', {
      Finance: 'attention',
      Delivery: 'attention',
      Risk: 'attention',
      Safeguarding: 'action_needed',
      Governance: 'attention',
    }),
    ratings: {
      Design: 'G',
      Approvals: 'G',
      Finance: 'A',
      Delivery: 'A',
      Risk: 'A',
      VfM: 'G',
      Safeguarding: 'R',
      'M and E': 'G',
      Governance: 'A',
    },
    history: [
      {
        id: 'd1',
        when: '10 days ago',
        tone: 'attention',
        description: 'Safeguarding moved to red after referral register gap detected.',
      },
    ],
  },
  {
    id: 'josp',
    title: 'Jubaland Stability Programme',
    fullTitle: 'Jubaland Stability and Local Governance Programme',
    code: 'JOSP',
    iatiId: 'GB-GOV-1-301220',
    geography: 'Jubaland',
    budget: '£36.5m',
    status: 'compliant',
    score: 88,
    trendPoints: 2,
    trend: 'up',
    lastAudited: 'Feb 22, 2026',
    lastReviewRelative: '2 weeks ago',
    summary:
      'On track overall. Delivery still has one amber item — **quarterly milestone evidence** needs a refresh, with a recovery plan already in place.',
    priorityAction: null,
    areas: stubAreasFromTemplate('josp', { Delivery: 'attention' }),
    ratings: {
      Design: 'G',
      Approvals: 'G',
      Finance: 'G',
      Delivery: 'A',
      Risk: 'G',
      VfM: 'G',
      Safeguarding: 'G',
      'M and E': 'G',
      Governance: 'G',
    },
    history: [
      {
        id: 'j1',
        when: '2 weeks ago',
        tone: 'compliant',
        description: 'Full AI sweep completed. Score 88 out of 100. Delivery remains amber.',
      },
    ],
  },
];

// Fix GESS/DAMAL priority check IDs after stub id prefixing
FCDO_PROGRAMME_AUDITS.forEach((programme) => {
  if (programme.priorityAction) {
    const match = programme.areas
      .flatMap((area) => area.checks)
      .find(
        (check) =>
          check.status === 'action_needed' ||
          check.id === programme.priorityAction?.checkId,
      );
    if (match) {
      programme.priorityAction.checkId = match.id;
    }
  }
  programme.ratings = ratingsFromAreas(programme.areas);
});

type StatusVisualMeta = {
  label: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
  ringColor: string;
  cardClass: string;
  barClass: string;
};

export const PROGRAMME_STATUS_META: Record<ProgrammeAuditStatus, StatusVisualMeta> = {
  scanning: {
    label: 'Scanning',
    dotClass: 'bg-muted-foreground',
    textClass: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
    ringColor: 'var(--muted-foreground)',
    cardClass: 'bg-muted/50',
    barClass: 'bg-muted-foreground',
  },
  compliant: {
    label: 'Compliant',
    dotClass: 'bg-success',
    textClass: 'text-success-text',
    badgeClass: 'bg-success-subtle text-success-text',
    ringColor: 'var(--success)',
    cardClass: 'bg-success-subtle/60',
    barClass: 'bg-success',
  },
  attention: {
    label: 'Needs attention',
    dotClass: 'bg-warning',
    textClass: 'text-warning-text',
    badgeClass: 'bg-warning-subtle text-warning-text',
    ringColor: 'var(--warning)',
    cardClass: 'bg-warning-subtle/70',
    barClass: 'bg-warning',
  },
  action_needed: {
    label: 'Requires action',
    dotClass: 'bg-destructive',
    textClass: 'text-destructive-text',
    badgeClass: 'bg-destructive-subtle text-destructive-text',
    ringColor: 'var(--destructive)',
    cardClass: 'bg-destructive-subtle/70',
    barClass: 'bg-destructive',
  },
};

export const AREA_STATUS_META: Record<AreaStatus, StatusVisualMeta> = {
  compliant: PROGRAMME_STATUS_META.compliant,
  attention: PROGRAMME_STATUS_META.attention,
  action_needed: PROGRAMME_STATUS_META.action_needed,
  pending: {
    label: 'Not assessed',
    dotClass: 'bg-muted-foreground/60',
    textClass: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground',
    ringColor: 'var(--muted-foreground)',
    cardClass: 'bg-muted/40',
    barClass: 'bg-muted-foreground/50',
  },
};

export const RAG_META: Record<
  RagRating,
  { label: string; cellClass: string; textClass: string; accentClass: string }
> = {
  G: {
    label: 'Good',
    cellClass: 'bg-success-subtle',
    textClass: 'text-success-text',
    accentClass: 'bg-success',
  },
  A: {
    label: 'Attention needed',
    cellClass: 'bg-warning-subtle',
    textClass: 'text-warning-text',
    accentClass: 'bg-warning',
  },
  R: {
    label: 'Action needed',
    cellClass: 'bg-destructive-subtle',
    textClass: 'text-destructive-text',
    accentClass: 'bg-destructive',
  },
};

/** Legend / matrix cell for areas not yet assessed — not a RAG peer colour. */
export const NOT_ASSESSED_META = {
  symbol: '—',
  label: 'Not assessed',
  cellClass: 'bg-muted/30',
  textClass: 'text-muted-foreground',
} as const;

const STATUS_SORT_ORDER: Record<ProgrammeAuditStatus, number> = {
  compliant: 0,
  attention: 1,
  action_needed: 2,
  scanning: 3,
};

function countGreens(audit: ProgrammeAudit): number {
  return Object.values(audit.ratings).filter((rating) => rating === 'G').length;
}

export function sortProgrammeAudits(audits: ProgrammeAudit[]): ProgrammeAudit[] {
  return [...audits].sort((a, b) => {
    const byGreens = countGreens(b) - countGreens(a);
    if (byGreens !== 0) return byGreens;
    const byScore = (b.score ?? -1) - (a.score ?? -1);
    if (byScore !== 0) return byScore;
    return STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
  });
}

/** Admin Manage Workflows IDs that map onto Custom Workflows audit mock IDs. */
const PROGRAMME_AUDIT_ID_ALIASES: Record<string, string> = {
  biyoole: 'biyooole',
};

export const FCDO_AREA_LABELS: Array<{
  area: FcdoAuditArea;
  shortLabel: string;
  fullLabel: string;
}> = [
  { area: 'Design', shortLabel: 'Design', fullLabel: 'Programme design and logframe' },
  { area: 'Approvals', shortLabel: 'Approvals', fullLabel: 'Business case and approvals' },
  { area: 'Finance', shortLabel: 'Finance', fullLabel: 'Financial management' },
  { area: 'Delivery', shortLabel: 'Delivery', fullLabel: 'Delivery and results' },
  { area: 'Risk', shortLabel: 'Risk', fullLabel: 'Risk management' },
  { area: 'VfM', shortLabel: 'VfM', fullLabel: 'Value for money' },
  { area: 'Safeguarding', shortLabel: 'Safeguard', fullLabel: 'Safeguarding' },
  { area: 'M and E', shortLabel: 'M and E', fullLabel: 'Monitoring and evaluation' },
  { area: 'Governance', shortLabel: 'Governance', fullLabel: 'Governance and oversight' },
];

/** Stub nine-area cards when an admin programme has no linked ProgrammeAudit mock. */
export function buildPendingComplianceAreas(assessedCount = 0): ComplianceAreaDetail[] {
  return FCDO_AREA_LABELS.map((label, index) => {
    if (index < assessedCount) {
      return {
        area: label.area,
        shortLabel: label.shortLabel,
        fullLabel: label.fullLabel,
        status: 'compliant' as const,
        clearCount: 0,
        totalCount: 0,
        summary: 'Area marked complete in the admin sweep; detailed checks are not available yet.',
        checks: [],
      };
    }
    return pendingArea(label.area, label.shortLabel, label.fullLabel);
  });
}

export function getProgrammeAuditById(id: string): ProgrammeAudit | undefined {
  const resolvedId = PROGRAMME_AUDIT_ID_ALIASES[id] ?? id;
  return FCDO_PROGRAMME_AUDITS.find((audit) => audit.id === resolvedId);
}

/** Admin workflow programme IDs that differ from Custom Workflows catalog IDs. */
const ADMIN_PROGRAMME_ID_ALIASES: Record<string, string> = {
  biyoole: 'biyooole',
};

function pendingComplianceAreas(): ComplianceAreaDetail[] {
  return SHARP_AREAS.map((area) => pendingArea(area.area, area.shortLabel, area.fullLabel));
}

function areasWithScanProgress(
  sourceAreas: ComplianceAreaDetail[],
  assessed: number,
): ComplianceAreaDetail[] {
  return sourceAreas.map((area, index) =>
    index < assessed ? area : pendingArea(area.area, area.shortLabel, area.fullLabel),
  );
}

function statusFromScore(score: number | null): ProgrammeAuditStatus {
  if (score == null) return 'scanning';
  if (score < 70) return 'action_needed';
  if (score < 85) return 'attention';
  return 'compliant';
}

/**
 * Resolve rich ProgrammeAudit data for Manage Workflows admin views.
 * Prefers the Custom Workflows catalog when IDs match; otherwise builds
 * pending/scanning/complete area cards so admin never sees empty stubs.
 */
export function resolveAdminProgrammeAudit(input: {
  id: string;
  name: string;
  description?: string | null;
  country?: string;
  auditStatus: 'needs_doc' | 'scanning' | 'complete';
  score: number | null;
  scanProgress?: ProgrammeScanProgress;
  summary?: string | null;
}): ProgrammeAudit {
  const lookupId = ADMIN_PROGRAMME_ID_ALIASES[input.id] ?? input.id;
  const catalog = getProgrammeAuditById(lookupId);

  const identity = {
    id: input.id,
    title: catalog?.title ?? input.name,
    fullTitle: input.name || catalog?.fullTitle || input.name,
    code: catalog?.code ?? input.id.toUpperCase(),
    iatiId: catalog?.iatiId ?? `ADMIN-${input.id.toUpperCase()}`,
    geography: catalog?.geography ?? input.country ?? '—',
    budget: catalog?.budget ?? '—',
    trendPoints: catalog?.trendPoints ?? 0,
    trend: (catalog?.trend ?? 'flat') as TrendDirection,
    lastAudited: catalog?.lastAudited ?? '—',
    lastReviewRelative: catalog?.lastReviewRelative ?? '—',
  };

  if (input.auditStatus === 'needs_doc') {
    if (catalog) {
      return {
        ...catalog,
        id: input.id,
        fullTitle: input.name || catalog.fullTitle,
      };
    }
    const areas = pendingComplianceAreas();
    return {
      ...identity,
      status: 'scanning',
      score: null,
      summary: 'Link a project document and checklist document to start the compliance audit.',
      priorityAction: null,
      areas,
      ratings: ratingsFromAreas(areas),
      history: [],
    };
  }

  if (input.auditStatus === 'scanning') {
    const assessed = input.scanProgress?.assessed ?? 0;
    const total = input.scanProgress?.total ?? FCDO_AUDIT_AREAS.length;
    const sourceAreas = catalog?.areas ?? stubAreasFromTemplate(input.id, {});
    const areas = areasWithScanProgress(sourceAreas, assessed);
    return {
      ...identity,
      status: 'scanning',
      score: null,
      scanProgress: { assessed, total },
      summary:
        input.summary ??
        catalog?.summary ??
        'Compliance agent is reviewing evidence across the nine areas.',
      priorityAction: null,
      areas,
      ratings: ratingsFromAreas(areas),
      history: catalog?.history ?? [],
    };
  }

  if (catalog) {
    return {
      ...catalog,
      id: input.id,
      fullTitle: input.name || catalog.fullTitle,
      score: input.score ?? catalog.score,
      summary: input.summary ?? catalog.summary,
    };
  }

  const areas = stubAreasFromTemplate(input.id, {});
  return {
    ...identity,
    status: statusFromScore(input.score),
    score: input.score,
    summary: input.summary ?? 'Audit complete across all nine compliance areas.',
    priorityAction: null,
    areas,
    ratings: ratingsFromAreas(areas),
    history: [],
  };
}

export function findCheckInProgramme(
  programme: ProgrammeAudit,
  checkId: string,
): { area: ComplianceAreaDetail; check: AuditCheck } | undefined {
  for (const area of programme.areas) {
    const check = area.checks.find((item) => item.id === checkId);
    if (check) return { area, check };
  }
  return undefined;
}
