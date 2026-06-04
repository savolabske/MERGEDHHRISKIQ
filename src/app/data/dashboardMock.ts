export const DASHBOARD_BRIEFING = {
  country: 'Somalia',
  lastSync: '4 min ago',
  summaryMeta: '→ Generated 09:38 EAT · 18 sources · 247 risks reviewed',
  activeRisksTotal: 247,
};

export const DASHBOARD_METRICS = [
  {
    id: 'active',
    label: 'ACTIVE RISKS',
    value: '247',
    trend: '▲ +12 this week',
    trendClass: 'text-destructive-text',
    tintFrom: 'var(--primary-subtle)',
    sparklineColor: 'var(--primary)',
    sparkline: [12, 18, 15, 22, 19, 26, 24, 28],
  },
  {
    id: 'critical',
    label: 'CRITICAL',
    value: '18',
    trend: '▲ +4 vs last week',
    trendClass: 'text-destructive-text',
    tintFrom: 'var(--destructive-subtle)',
    sparklineColor: 'var(--destructive-text)',
    sparkline: [8, 10, 9, 12, 14, 13, 16, 18],
  },
  {
    id: 'high',
    label: 'HIGH',
    value: '52',
    trend: '— stable',
    trendClass: 'text-text-subtle',
    tintFrom: 'var(--warning-subtle)',
    sparklineColor: 'var(--warning-strong)',
    sparkline: [48, 50, 51, 49, 52, 51, 52, 52],
  },
  {
    id: 'mitigated',
    label: 'MITIGATED · 30D',
    value: '63',
    trend: '▼ closed faster',
    trendClass: 'text-success',
    tintFrom: 'var(--success-subtle)',
    sparklineColor: 'var(--success)',
    sparkline: [42, 45, 48, 52, 55, 58, 61, 63],
  },
] as const;

export const DASHBOARD_CATEGORIES = [
  {
    id: 'security',
    label: 'Security',
    count: 79,
    iconColor: 'var(--destructive-text)',
    barFrom: 'var(--destructive-text)',
    barTo: 'var(--destructive)',
  },
  {
    id: 'operational',
    label: 'Operational',
    count: 54,
    iconColor: 'var(--warning-strong)',
    barFrom: 'var(--warning-strong)',
    barTo: 'var(--warning-strong)',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    count: 40,
    iconColor: 'var(--warning)',
    barFrom: 'var(--warning)',
    barTo: 'var(--warning)',
  },
  {
    id: 'financial',
    label: 'Financial',
    count: 30,
    iconColor: 'var(--primary)',
    barFrom: 'var(--primary)',
    barTo: 'var(--chart-2)',
  },
] as const;

export const CATEGORY_MAX_COUNT = 79;

export const DASHBOARD_EMERGING_RISKS = [
  {
    id: '1',
    rank: '01',
    level: 'CRITICAL',
    title: 'IED threat cluster on MSR-3 near Marka',
    description:
      '9 new convoy-related incidents detected within a 12-day window. Pattern matches prior pre-attack signaling.',
    footer: [
      { label: 'Lower Shabelle' },
      { label: '9 linked risks' },
    ],
    background: 'linear-gradient(135deg, var(--destructive-text) 0%, var(--destructive-text) 55%, var(--warning-strong) 100%)',
    borderClass: 'border-destructive-text/30',
  },
  {
    id: '2',
    rank: '02',
    level: 'HIGH',
    title: 'Vendor compliance gaps in active contracts',
    description:
      '4 contractors flagged for repeat delays and missing certifications. 2 currently servicing Banadir operations.',
    footer: [
      { label: 'Procurement' },
      { label: '4 vendors' },
    ],
    background: 'linear-gradient(135deg, var(--warning-text) 0%, var(--warning-strong) 55%, var(--warning) 100%)',
    borderClass: 'border-warning-strong/30',
  },
  {
    id: '3',
    rank: '03',
    level: 'WATCH',
    title: 'Funding shortfall risk widening into Q3',
    description:
      'Donor pipeline shows 22% shortfall risk for WASH and nutrition tracks. 6 programmes exposed.',
    footer: [
      { label: 'Bay region' },
      { label: '$4.2M exposed' },
    ],
    background: 'linear-gradient(135deg, var(--gradient-summary-start) 0%, var(--primary) 55%, var(--gradient-summary-end) 100%)',
    borderClass: 'border-primary/30',
  },
] as const;

/** One chart point — `label` is the human-readable x-axis tick for that range. */
export type DashboardRiskTrendPoint = {
  label: string;
  active: number;
  critical: number;
  mitigated: number;
};

/** Last 7 days (Mon → Sun). */
export const DASHBOARD_RISK_TREND_WEEK: DashboardRiskTrendPoint[] = [
  { label: 'Mon', active: 232, critical: 15, mitigated: 58 },
  { label: 'Tue', active: 234, critical: 15, mitigated: 59 },
  { label: 'Wed', active: 236, critical: 16, mitigated: 59 },
  { label: 'Thu', active: 239, critical: 16, mitigated: 60 },
  { label: 'Fri', active: 241, critical: 17, mitigated: 61 },
  { label: 'Sat', active: 244, critical: 17, mitigated: 62 },
  { label: 'Sun', active: 247, critical: 18, mitigated: 63 },
];

/** Current calendar month, four weekly snapshots. */
export const DASHBOARD_RISK_TREND_MONTH: DashboardRiskTrendPoint[] = [
  { label: 'Wk 1', active: 218, critical: 14, mitigated: 48 },
  { label: 'Wk 2', active: 226, critical: 15, mitigated: 52 },
  { label: 'Wk 3', active: 239, critical: 17, mitigated: 59 },
  { label: 'Wk 4', active: 247, critical: 18, mitigated: 63 },
];

/** Year to date — one point per month. */
export const DASHBOARD_RISK_TREND_YEAR: DashboardRiskTrendPoint[] = [
  { label: 'Jan', active: 186, critical: 11, mitigated: 34 },
  { label: 'Feb', active: 198, critical: 12, mitigated: 38 },
  { label: 'Mar', active: 210, critical: 13, mitigated: 44 },
  { label: 'Apr', active: 228, critical: 16, mitigated: 55 },
  { label: 'May', active: 247, critical: 18, mitigated: 63 },
];

export const DASHBOARD_RISK_TREND = {
  week: DASHBOARD_RISK_TREND_WEEK,
  month: DASHBOARD_RISK_TREND_MONTH,
  year: DASHBOARD_RISK_TREND_YEAR,
} as const;

export type DashboardRiskTrendRange = keyof typeof DASHBOARD_RISK_TREND;

export const DASHBOARD_RISK_STATUS = [
  { id: 'critical', label: 'Open · Critical', percent: 14, count: 35, color: 'var(--destructive-text)' },
  { id: 'in-progress', label: 'In progress', percent: 28, count: 69, color: 'var(--warning-strong)' },
  { id: 'review', label: 'Under review', percent: 22, count: 54, color: 'var(--primary)' },
  { id: 'mitigated', label: 'Mitigated', percent: 26, count: 63, color: 'var(--success)' },
  { id: 'hold', label: 'On hold', percent: 10, count: 26, color: 'var(--text-subtle)' },
] as const;

export const DASHBOARD_BRIEFING_UPDATES = [
  {
    id: '1',
    dotColor: 'var(--destructive-text)',
    headline: 'Gu rainfall 40% below average in Bay & Bakool — drought risk upgraded',
    description:
      'CHIRPS and FEWS NET crossed early-action thresholds in six districts. Three WASH and nutrition programmes flagged supply exposure within 48 hours; pre-position before river levels drop.',
    relativeTime: '2h ago',
    absoluteTime: '09:14 EAT',
  },
  {
    id: '2',
    dotColor: 'var(--warning)',
    headline: 'WASH & nutrition donor pipeline shows 22% Q3 shortfall risk',
    description:
      'FTS pledges and internal portfolio reviews align on six exposed programmes. RiskIQ matched the gap pattern to last year\'s pre-HRP revision delays in Bay and Middle Shabelle.',
    relativeTime: '6h ago',
    absoluteTime: '03:42 EAT',
  },
  {
    id: '3',
    dotColor: 'var(--primary)',
    headline: 'IDP arrivals spike in Mogadishu peri-urban — 3 camps above capacity',
    description:
      'CCCM and protection partners logged concurrent displacement risks in 18 hours. RiskIQ clustered entries for inter-agency shelter, WASH, and MPCA coordination review.',
    relativeTime: '11h ago',
    absoluteTime: '22:36 EAT',
  },
  {
    id: '4',
    dotColor: 'var(--chart-3)',
    headline: 'Aid diversion allegations cluster in Banadir — gatekeeper pattern detected',
    description:
      'Partner reporting and beneficiary feedback matched three concurrent diversion flags in 14 days. Accountability cluster review recommended for MPCA distribution sites in Garasbaley and Wadajir.',
    relativeTime: '14h ago',
    absoluteTime: '19:10 EAT',
  },
] as const;
