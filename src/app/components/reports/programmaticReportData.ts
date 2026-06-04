import type { SectionNarrative } from './reportShared';

export const PROGRAMMATIC_REPORT_CREATED = 'March 1, 2026';

export const PROGRAMMATIC_KPIS = {
  partnersFlagged: 12,
  disbursementsUnderReview: 5.4,
  duplicationRate: 8,
  biometricCoverage: 68,
  cashPipelineM: 4.2,
  totalFlags2025: 38,
  frozenDisbursementsM: 1.2,
  sitesWithoutTpm: 23,
  enhancedDdPartners: 3,
};

export const PROGRAMMATIC_NOTES = {
  screening:
    'Screening hits require AFP-level investigation and donor notification before funds release.',
  detection:
    'More Q1 flags reflect stronger biometric and sanctions screening — not necessarily worsening partner behaviour.',
  cashModality:
    'Cash remains the highest-risk modality; KYC and mobile money provider compliance are portfolio-wide priorities.',
};

export const PROGRAMMATIC_RISK_TYPES = [
  { key: 'sanctions', label: 'Sanctions', color: 'var(--destructive-text)', definition: 'OFAC/UN sanctions screening hits and compliance failures.' },
  { key: 'ghost', label: 'Ghost beneficiaries', color: 'var(--chart-3)', definition: 'Duplicate, fictitious, or unverified beneficiary registrations.' },
  { key: 'capacity', label: 'Capacity gaps', color: 'var(--warning-strong)', definition: 'Partner staffing, systems, and operational capacity deficiencies.' },
  { key: 'cash', label: 'Cash / KYC', color: 'var(--primary)', definition: 'Mobile money, AML, and know-your-customer documentation gaps.' },
  { key: 'monitoring', label: 'Monitoring gaps', color: 'var(--muted-foreground)', definition: 'Absent or partial TPM and post-distribution monitoring.' },
];

export const PROGRAMMATIC_NARRATIVES = {
  highlights: {
    eyebrow: 'Programmatic Risks — Q1 2026',
    headline: '12 partners flagged',
    headlineAccent: 'across the portfolio',
    insight:
      'Twelve partners are under review, including one sanctions hit that froze disbursements. Duplicate names on beneficiary lists and weak cash KYC are the main drivers this quarter.',
  },
  riskMix: {
    eyebrow: 'Portfolio Overview',
    headline: 'Ghost beneficiary flags',
    headlineAccent: 'lead the mix',
    insight:
      'Fake or duplicate registrations and sanctions hits made up most 2025 flags. Cash and KYC gaps are growing as mobile-money programmes expand.',
  },
  flagHotspots: {
    eyebrow: 'Flag Hotspots — Q1 2026',
    headline: 'Banadir and Bay',
    headlineAccent: 'concentrate exposure',
    insight:
      'Most new flags sit in Mogadishu HQ and Baidoa field offices. IDP camp distributions in Banadir are where ghost beneficiary patterns keep appearing.',
  },
  top10Hotspots: {
    eyebrow: 'Top 10 Locations — 2025',
    headline: 'Urban IDP belts',
    headlineAccent: 'dominate the map',
    insight:
      'Daynile, Kahda, and Mogadishu led annual flag volume. The Bay–Bakool corridor is seeing more capacity and delivery gaps as cash scales up.',
    footnote: 'Adjusted for one-off batch screening in Q4 2025.',
  },
  riskBreakdown: {
    eyebrow: 'Risk Type Breakdown',
    headline: 'Each risk type',
    headlineAccent: 'has distinct geography',
    insight:
      'Sanctions hits cluster at HQ level; ghost beneficiaries in IDP camps; cash/KYC gaps are nationwide but concentrated in 4 field offices.',
  },
  seasonalComparison: {
    eyebrow: 'Q4 2025 vs Q1 2026',
    headline: 'Detection is',
    headlineAccent: 'outpacing incidents',
    insight:
      'More flags this quarter largely reflect stronger biometric and sanctions screening—not proof that partner behaviour suddenly worsened.',
  },
  partners: {
    eyebrow: 'Partner Capacity & Due Diligence',
    headline: 'Due diligence gaps are',
    headlineAccent: 'concentrated in cash programs',
    insight:
      'Three partners are on enhanced due diligence; one local NGO sanctions match froze all payouts pending a forensic audit.',
    bullets: [
      'Partner A (LNGO): sanctions hit — $1.2M frozen.',
      'Partners B & C: ghost beneficiary patterns — enhanced DD.',
      'Partner D: capacity gaps in Bay/Bakool cash delivery.',
    ],
  },
  cash: {
    eyebrow: 'Cash & MPCA Pipeline',
    headline: '$4.2M cash pipeline',
    headlineAccent: 'exposed to KYC gaps',
    insight:
      'A large share of the cash pipeline has weak know-your-customer files in four field offices. Cash transfers remain the riskiest way to deliver aid in this portfolio.',
    bullets: [
      'KYC gaps in 4 of 11 field offices.',
      '$1.2M frozen pending partner audit.',
      'Biometric verification rollout at 68% coverage.',
    ],
  },
  biometric: {
    eyebrow: 'Biometric Verification',
    headline: 'Coverage reaches',
    headlineAccent: '68% of sites',
    insight:
      'Biometric checks are spreading fastest in Banadir IDP camps. Bay, Bakool, and Jubaland still lag—where ghost beneficiary issues keep surfacing.',
  },
  monitoring: {
    eyebrow: 'Monitoring & Verification',
    headline: 'Monitoring coverage is',
    headlineAccent: 'uneven',
    insight:
      'Nearly one in four active sites has no third-party or post-distribution monitoring. Those gaps line up with where duplicate beneficiary names show up.',
  },
  accountability: {
    eyebrow: 'Q3 vs Q4 2025',
    headline: 'Findings are rising',
    headlineAccent: 'but detection is improving',
    insight:
      'The rising flag count tracks better screening tools, not necessarily worse partner performance—read trends alongside monitoring coverage.',
    footnote: 'Adjusted for one-off batch screening in Q4.',
  },
  frozenFunds: {
    eyebrow: 'Disbursement Controls',
    headline: '$5.4M under',
    headlineAccent: 'active review',
    insight:
      'Funds on hold tie to sanctions work, cleaning beneficiary lists, and fixing KYC gaps. SHF and ECHO have been briefed on status and timelines.',
  },
  geographic: {
    eyebrow: 'Portfolio View',
    headline: 'Risk mapped',
    headlineAccent: 'by region',
    insight:
      'See which regions combine partner flags with heavy cash exposure—Mogadishu, Baidoa, and Banadir IDP belts need the closest oversight.',
  },
} satisfies Record<string, SectionNarrative>;

export const flagsByType = [
  { type: 'Sanctions', value: 2, fill: 'var(--destructive-text)' },
  { type: 'Ghost beneficiaries', value: 4, fill: 'var(--chart-3)' },
  { type: 'Capacity', value: 3, fill: 'var(--warning-strong)' },
  { type: 'Cash / KYC', value: 2, fill: 'var(--primary)' },
  { type: 'Monitoring', value: 1, fill: 'var(--muted-foreground)' },
];

export const flagsQ4vsQ1 = [
  { name: 'Sanctions', q4: 2, q1: 2 },
  { name: 'Ghost', q4: 3, q1: 4 },
  { name: 'Capacity', q4: 2, q1: 3 },
  { name: 'Cash', q4: 2, q1: 2 },
  { name: 'Monitor', q4: 1, q1: 1 },
];

export const flagsAnnualComparison = [
  { name: 'Sanctions', y2024: 1, y2025: 2 },
  { name: 'Ghost', y2024: 2, y2025: 4 },
  { name: 'Capacity', y2024: 3, y2025: 3 },
  { name: 'Cash', y2024: 1, y2025: 2 },
  { name: 'Monitor', y2024: 1, y2025: 1 },
];

export const flagsMix2025 = [
  { name: 'Ghost beneficiaries', value: 34, color: 'var(--chart-3)' },
  { name: 'Capacity gaps', value: 24, color: 'var(--warning-strong)' },
  { name: 'Sanctions', value: 18, color: 'var(--destructive-text)' },
  { name: 'Cash / KYC', value: 16, color: 'var(--primary)' },
  { name: 'Monitoring', value: 8, color: 'var(--muted-foreground)' },
];

export const flagsHotspotsQ1 = [
  { location: 'Mogadishu (BN)', sanctions: 2, ghost: 2, capacity: 1, cash: 1, monitoring: 0, total: 6 },
  { location: 'Baidoa (Bay)', sanctions: 0, ghost: 2, capacity: 2, cash: 1, monitoring: 1, total: 6 },
  { location: 'Daynile (BN)', sanctions: 0, ghost: 3, capacity: 0, cash: 0, monitoring: 1, total: 4 },
  { location: 'Kismayo (JL)', sanctions: 0, ghost: 1, capacity: 1, cash: 1, monitoring: 0, total: 3 },
  { location: 'Kahda (BN)', sanctions: 0, ghost: 2, capacity: 0, cash: 0, monitoring: 0, total: 2 },
  { location: 'Garowe (PL)', sanctions: 0, ghost: 0, capacity: 1, cash: 0, monitoring: 1, total: 2 },
  { location: 'Dhusamareb (GM)', sanctions: 0, ghost: 0, capacity: 1, cash: 0, monitoring: 0, total: 1 },
  { location: 'Hudur (Bakool)', sanctions: 0, ghost: 0, capacity: 1, cash: 1, monitoring: 0, total: 2 },
];

export const top10ProgrammaticHotspots = [
  { location: 'Mogadishu (BN)', sanctions: 4, ghost: 6, capacity: 4, cash: 3, monitoring: 2, total: 19 },
  { location: 'Daynile (BN)', sanctions: 1, ghost: 8, capacity: 1, cash: 2, monitoring: 3, total: 15 },
  { location: 'Baidoa (Bay)', sanctions: 2, ghost: 4, capacity: 5, cash: 3, monitoring: 2, total: 16 },
  { location: 'Kahda (BN)', sanctions: 0, ghost: 6, capacity: 1, cash: 1, monitoring: 2, total: 10 },
  { location: 'Kismayo (JL)', sanctions: 1, ghost: 2, capacity: 3, cash: 2, monitoring: 1, total: 9 },
  { location: 'Garowe (PL)', sanctions: 1, ghost: 1, capacity: 2, cash: 1, monitoring: 2, total: 7 },
  { location: 'Dhusamareb (GM)', sanctions: 0, ghost: 1, capacity: 2, cash: 0, monitoring: 1, total: 4 },
  { location: 'Hudur (Bakool)', sanctions: 0, ghost: 1, capacity: 3, cash: 2, monitoring: 0, total: 6 },
  { location: 'Beledweyne (HS)', sanctions: 0, ghost: 1, capacity: 1, cash: 1, monitoring: 1, total: 4 },
  { location: 'Afgooye (SWS)', sanctions: 0, ghost: 2, capacity: 1, cash: 0, monitoring: 1, total: 4 },
];

export const riskTypeMiniCharts = [
  {
    title: 'Sanctions Flags',
    color: 'var(--destructive-text)',
    data: [
      { location: 'Mogadishu HQ', value: 4 },
      { location: 'Baidoa', value: 2 },
      { location: 'Garowe', value: 1 },
      { location: 'Kismayo', value: 1 },
    ],
  },
  {
    title: 'Ghost Beneficiaries',
    color: 'var(--chart-3)',
    data: [
      { location: 'Daynile', value: 8 },
      { location: 'Kahda', value: 6 },
      { location: 'Baidoa', value: 4 },
      { location: 'Afgooye', value: 2 },
    ],
  },
  {
    title: 'Cash / KYC Gaps',
    color: 'var(--primary)',
    data: [
      { location: 'Nationwide', value: 6 },
      { location: 'Baidoa', value: 3 },
      { location: 'Mogadishu', value: 3 },
      { location: 'Hudur', value: 2 },
    ],
  },
];

export const partnerRiskScores = [
  { partner: 'Partner A (LNGO)', score: 92 },
  { partner: 'Partner B (INGO)', score: 78 },
  { partner: 'Partner C (LNGO)', score: 71 },
  { partner: 'Partner D (LNGO)', score: 65 },
  { partner: 'Partner E (INGO)', score: 58 },
  { partner: 'Partner F (LNGO)', score: 52 },
  { partner: 'Partner G (LNGO)', score: 48 },
  { partner: 'Partner H (INGO)', score: 42 },
];

export const cashTrackingMonthly = [
  { month: 'Oct', reach: 180000, flags: 2 },
  { month: 'Nov', reach: 165000, flags: 3 },
  { month: 'Dec', reach: 150000, flags: 3 },
  { month: 'Jan', reach: 140000, flags: 4 },
  { month: 'Feb', reach: 130000, flags: 5 },
  { month: 'Mar', reach: 120000, flags: 6 },
];

export const biometricCoverageTrend = [
  { month: 'Oct', coverage: 42 },
  { month: 'Nov', coverage: 48 },
  { month: 'Dec', coverage: 54 },
  { month: 'Jan', coverage: 58 },
  { month: 'Feb', coverage: 63 },
  { month: 'Mar', coverage: 68 },
];

export const flagsMonthly = [
  { month: 'Oct', flags: 4, critical: 1 },
  { month: 'Nov', flags: 5, critical: 1 },
  { month: 'Dec', flags: 6, critical: 2 },
  { month: 'Jan', flags: 8, critical: 2 },
  { month: 'Feb', flags: 10, critical: 3 },
  { month: 'Mar', flags: 12, critical: 3 },
];

export const monitoringCoverage = [
  { name: 'Full TPM', value: 52, color: 'var(--success)' },
  { name: 'Partial', value: 25, color: 'var(--chart-3)' },
  { name: 'None', value: 23, color: 'var(--destructive-text)' },
];

export const monitoringGapByRegion = [
  { region: 'Banadir', gap: 12 },
  { region: 'Bay/Bakool', gap: 28 },
  { region: 'Jubaland', gap: 22 },
  { region: 'Hiraan', gap: 18 },
  { region: 'Puntland', gap: 8 },
  { region: 'Somaliland', gap: 10 },
];

export const accountabilityQ3 = { sanctions: 1, ghost: 2, capacity: 2, cash: 1, monitoring: 1, total: 7 };
export const accountabilityQ4 = { sanctions: 2, ghost: 3, capacity: 2, cash: 2, monitoring: 1, total: 10 };

export const frozenFundsBreakdown = [
  { reason: 'Sanctions investigation', amount: 1.2 },
  { reason: 'Ghost beneficiary recovery', amount: 2.1 },
  { reason: 'KYC remediation', amount: 1.4 },
  { reason: 'Capacity review', amount: 0.7 },
];

export const programmaticMapLocations = [
  { name: 'Mogadishu (BN)', lat: 2.05, lng: 45.34, count: 6, severity: 'critical' as const },
  { name: 'Baidoa (Bay)', lat: 3.11, lng: 43.65, count: 6, severity: 'critical' as const },
  { name: 'Daynile (BN)', lat: 2.12, lng: 45.32, count: 4, severity: 'high' as const },
  { name: 'Kismayo (JL)', lat: -0.36, lng: 42.55, count: 3, severity: 'high' as const },
  { name: 'Kahda (BN)', lat: 2.08, lng: 45.38, count: 3, severity: 'high' as const },
  { name: 'Garowe (PL)', lat: 8.4, lng: 48.49, count: 2, severity: 'moderate' as const },
  { name: 'Hudur (Bakool)', lat: 4.18, lng: 43.06, count: 2, severity: 'moderate' as const },
];
