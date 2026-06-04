import type { SectionNarrative } from './reportShared';

export const SECURITY_REPORT_CREATED = 'March 1, 2026';

export const SECURITY_KPIS = {
  activeIncidents: 23,
  criticalCount: 4,
  yoyChangePercent: 18.4,
  lowerShabelleShare: 40,
  iedSurgePercent: 33,
  totalIncidents2025: 78,
  criticalSharePercent: 17,
  missionsCancelled: 3,
};

export const SECURITY_NOTES = {
  iedDetection:
    'IED discoveries may reflect improved detection and reporting capacity, not only increased planting activity.',
  amisomDrawdown:
    'Post-drawdown security vacuum in Lower Shabelle may be contributing to increased IED and checkpoint activity — correlation does not imply causation.',
  kidnappingIntel:
    'Kidnapping cases in Galkayo may involve organized criminal networks distinct from Al-Shabaab operations in southern belts.',
};

export const SECURITY_THREAT_TYPES = [
  { key: 'ied', label: 'IED', color: 'var(--destructive-text)', definition: 'Improvised explosive devices — discovered, detonated, or attempted.' },
  { key: 'armedAssault', label: 'Armed assault', color: 'var(--warning-strong)', definition: 'Direct fire, ambush, or armed attack on personnel or assets.' },
  { key: 'checkpoint', label: 'Checkpoint', color: 'var(--chart-3)', definition: 'Unauthorized or armed checkpoints blocking humanitarian movement.' },
  { key: 'kidnapping', label: 'Kidnapping', color: 'var(--gradient-summary-start)', definition: 'Abduction or attempted abduction of humanitarian personnel.' },
  { key: 'crime', label: 'Crime', color: 'var(--muted-foreground)', definition: 'Opportunistic crime targeting aid operations or distribution points.' },
];

export const SECURITY_NARRATIVES = {
  highlights: {
    eyebrow: 'Security Incidents — Q1 2026',
    headline: '23 active incidents',
    headlineAccent: 'across operational zones',
    insight:
      'Incidents are up from last quarter, led by roadside bombs and convoy attacks. Most activity sits in Lower Shabelle—especially Afgooye and Marka—and four threats need immediate movement decisions.',
  },
  hotspots: {
    eyebrow: 'Incident Hotspots — Last 90 Days',
    headline: 'Threats cluster',
    headlineAccent: 'along southern corridors',
    insight:
      'Most recent incidents cluster on the Afgooye–Marka belt and the Mogadishu–Baidoa road. Bay remains the hardest region to reach by ground.',
  },
  top10Hotspots: {
    eyebrow: 'Top 10 Locations — 2025',
    headline: 'Southern belts dominate',
    headlineAccent: 'the annual picture',
    insight:
      'Afgooye and Marka led the year for reported incidents. IEDs and armed checkpoints concentrate along the Afgooye–Baidoa supply axis.',
    footnote: '*Data through Q1 2026; 2025 totals are provisional pending final verification.',
  },
  threatBreakdown: {
    eyebrow: 'Threat Type Breakdown',
    headline: 'Three threat types',
    headlineAccent: 'drive most incidents',
    insight:
      'IED, checkpoint, and kidnapping incidents show distinct geographic patterns — each requiring a different mitigation playbook.',
  },
  threatProfile: {
    eyebrow: 'Threat Profile — Q4 vs Q1',
    headline: 'IED activity is',
    headlineAccent: 'driving the surge',
    insight:
      'Roadside bombs jumped from five last quarter to eight this quarter—the main reason the overall count is rising. Checkpoints and crime around Mogadishu are also ticking up.',
    bullets: [
      'Afgooye corridor: 4 IED events in 3 weeks.',
      '3 humanitarian missions cancelled in Bay/Bakool in 14 days.',
      'Peri-urban Mogadishu: crime targeting aid ops up 22%.',
    ],
  },
  threatMix: {
    eyebrow: 'Threat Mix — 2025',
    headline: 'IED leads the',
    headlineAccent: '2025 threat landscape',
    insight:
      'Roadside bombs were the most common threat in 2025, followed by armed assaults and checkpoints. Together those three types drove most humanitarian security reports.',
  },
  iedCorridor: {
    eyebrow: 'IED Tracking — Afgooye Corridor',
    headline: 'Four IED events',
    headlineAccent: 'in three weeks',
    insight:
      'The Afgooye–Mogadishu road is the highest-risk convoy route right now. EOD teams safely handled three of the four recent devices before they could harm staff.',
    bullets: [
      'Feb 26: IED discovered near Afgooye checkpoint — safely detonated.',
      'Feb 19: Secondary device found 200m from first location.',
      'Feb 12: Route diversion added 4 hours to Baidoa convoy.',
      'Feb 5: UNHAS rotary escort requested for critical MEDEVAC.',
    ],
  },
  kidnappingWatch: {
    eyebrow: 'Kidnapping Risk — Q1 2026',
    headline: 'Abduction risk is',
    headlineAccent: 'rising in Mudug',
    insight:
      'Three abductions this quarter, including two national staff taken near Galkayo. Treat north–south travel through Mudug as very high risk until cases close.',
    bullets: [
      'March 4: Two national staff abducted en route to field site (case open).',
      'Feb 28: Failed abduction attempt against INGO driver in Galkayo.',
      'Feb 14: Mudug threat assessment upgraded to "very high".',
    ],
  },
  actors: {
    eyebrow: 'Actors & Attribution',
    headline: 'Al-Shabaab remains',
    headlineAccent: 'the primary actor',
    insight:
      'AS-linked incidents dominate rural belts. Clan militia checkpoints drive convoy delays; criminal groups target urban distribution points.',
  },
  escalation: {
    eyebrow: 'Escalation Trend',
    headline: 'The escalation window',
    headlineAccent: 'is widening',
    insight:
      'Reported incidents have risen five months in a row. A growing share are high-severity—plan for tighter movement controls, not business as usual.',
  },
  geographic: {
    eyebrow: 'Geographic View',
    headline: 'Incidents mapped',
    headlineAccent: 'across Somalia',
    insight:
      'See where incidents stack up and how severe they are—Afgooye, Marka, and the Baidoa corridor stand out for urgent review.',
  },
} satisfies Record<string, SectionNarrative>;

export const q1IncidentsByType = [
  { type: 'IED', value: 8, fill: 'var(--destructive-text)' },
  { type: 'Armed assault', value: 5, fill: 'var(--warning-strong)' },
  { type: 'Checkpoint', value: 4, fill: 'var(--chart-3)' },
  { type: 'Kidnapping', value: 3, fill: 'var(--gradient-summary-start)' },
  { type: 'Crime', value: 3, fill: 'var(--muted-foreground)' },
];

export const securityAnnualComparison = [
  { name: 'IED', q4: 5, q1: 8 },
  { name: 'Armed', q4: 4, q1: 5 },
  { name: 'Checkpoint', q4: 3, q1: 4 },
  { name: 'Kidnap', q4: 2, q1: 3 },
  { name: 'Crime', q4: 2, q1: 3 },
];

export const securityHotspots = [
  { location: 'Afgooye (SWS)', ied: 4, armedAssault: 2, checkpoint: 1, kidnapping: 0, crime: 1, total: 8 },
  { location: 'Marka (SWS)', ied: 2, armedAssault: 2, checkpoint: 2, kidnapping: 1, crime: 0, total: 7 },
  { location: 'Baidoa corridor', ied: 1, armedAssault: 1, checkpoint: 4, kidnapping: 0, crime: 0, total: 6 },
  { location: 'Daynile (BN)', ied: 2, armedAssault: 0, checkpoint: 0, kidnapping: 1, crime: 2, total: 5 },
  { location: 'Jowhar (HS)', ied: 1, armedAssault: 2, checkpoint: 1, kidnapping: 0, crime: 1, total: 5 },
  { location: 'Kismayo (JL)', ied: 0, armedAssault: 1, checkpoint: 2, kidnapping: 1, crime: 1, total: 5 },
  { location: 'Galkayo (PL)', ied: 0, armedAssault: 1, checkpoint: 0, kidnapping: 2, crime: 1, total: 4 },
  { location: 'Mogadishu (BN)', ied: 1, armedAssault: 0, checkpoint: 0, kidnapping: 0, crime: 3, total: 4 },
];

export const top10SecurityHotspots = [
  { location: 'Afgooye (SWS)', ied: 12, armedAssault: 6, checkpoint: 4, kidnapping: 2, crime: 3, total: 27 },
  { location: 'Marka (SWS)', ied: 8, armedAssault: 5, checkpoint: 6, kidnapping: 3, crime: 2, total: 24 },
  { location: 'Baidoa corridor', ied: 4, armedAssault: 4, checkpoint: 10, kidnapping: 1, crime: 2, total: 21 },
  { location: 'Daynile (BN)', ied: 6, armedAssault: 2, checkpoint: 1, kidnapping: 3, crime: 5, total: 17 },
  { location: 'Jowhar (HS)', ied: 5, armedAssault: 4, checkpoint: 3, kidnapping: 1, crime: 3, total: 16 },
  { location: 'Mogadishu (BN)', ied: 3, armedAssault: 2, checkpoint: 1, kidnapping: 1, crime: 8, total: 15 },
  { location: 'Kismayo (JL)', ied: 2, armedAssault: 3, checkpoint: 5, kidnapping: 2, crime: 2, total: 14 },
  { location: 'Galkayo (PL)', ied: 1, armedAssault: 2, checkpoint: 1, kidnapping: 6, crime: 3, total: 13 },
  { location: 'Beledweyne (HS)', ied: 2, armedAssault: 3, checkpoint: 2, kidnapping: 0, crime: 2, total: 9 },
  { location: 'Dhusamareb (GM)', ied: 1, armedAssault: 2, checkpoint: 3, kidnapping: 1, crime: 1, total: 8 },
];

export const threatTypeMiniCharts = [
  {
    title: 'IED Hotspots',
    threatKey: 'ied' as const,
    color: 'var(--destructive-text)',
    data: [
      { location: 'Afgooye', value: 12 },
      { location: 'Marka', value: 8 },
      { location: 'Daynile', value: 6 },
      { location: 'Jowhar', value: 5 },
    ],
  },
  {
    title: 'Checkpoint Hotspots',
    threatKey: 'checkpoint' as const,
    color: 'var(--chart-3)',
    data: [
      { location: 'Baidoa corridor', value: 10 },
      { location: 'Marka', value: 6 },
      { location: 'Kismayo', value: 5 },
      { location: 'Dhusamareb', value: 3 },
    ],
  },
  {
    title: 'Kidnapping Hotspots',
    threatKey: 'kidnapping' as const,
    color: 'var(--gradient-summary-start)',
    data: [
      { location: 'Galkayo', value: 6 },
      { location: 'Marka', value: 3 },
      { location: 'Daynile', value: 3 },
      { location: 'Kismayo', value: 2 },
    ],
  },
];

export const securityMix2025 = [
  { name: 'IED', value: 35, color: 'var(--destructive-text)' },
  { name: 'Armed assault', value: 22, color: 'var(--warning-strong)' },
  { name: 'Checkpoint', value: 18, color: 'var(--chart-3)' },
  { name: 'Kidnapping', value: 13, color: 'var(--gradient-summary-start)' },
  { name: 'Crime', value: 12, color: 'var(--muted-foreground)' },
];

export const iedCorridorWeekly = [
  { week: 'W1 Jan', discoveries: 0, detonations: 0 },
  { week: 'W2 Jan', discoveries: 1, detonations: 0 },
  { week: 'W3 Jan', discoveries: 0, detonations: 0 },
  { week: 'W4 Jan', discoveries: 1, detonations: 1 },
  { week: 'W1 Feb', discoveries: 2, detonations: 0 },
  { week: 'W2 Feb', discoveries: 1, detonations: 1 },
  { week: 'W3 Feb', discoveries: 2, detonations: 0 },
  { week: 'W4 Feb', discoveries: 1, detonations: 0 },
];

export const kidnappingByRegion = [
  { region: 'Mudug (Galkayo)', incidents: 6, fill: 'var(--gradient-summary-start)' },
  { region: 'Lower Shabelle', incidents: 3, fill: 'var(--chart-2)' },
  { region: 'Banadir', incidents: 3, fill: 'var(--chart-2)' },
  { region: 'Jubaland', incidents: 2, fill: '#93c5fd' },
  { region: 'Other', incidents: 1, fill: 'var(--border-muted)' },
];

export const securityActors = [
  { name: 'Al-Shabaab', count: 12 },
  { name: 'Clan militia', count: 5 },
  { name: 'Criminal', count: 3 },
  { name: 'Unknown', count: 2 },
  { name: 'Other armed', count: 1 },
];

export const securityTrendMonthly = [
  { month: 'Oct', incidents: 14, critical: 2, criticalPct: 14 },
  { month: 'Nov', incidents: 17, critical: 2, criticalPct: 12 },
  { month: 'Dec', incidents: 15, critical: 3, criticalPct: 20 },
  { month: 'Jan', incidents: 19, critical: 3, criticalPct: 16 },
  { month: 'Feb', incidents: 21, critical: 4, criticalPct: 19 },
  { month: 'Mar', incidents: 23, critical: 4, criticalPct: 17 },
];

export const humanitarianImpact = [
  { metric: 'Missions cancelled', value: 3 },
  { metric: 'Convoy delays (>4h)', value: 7 },
  { metric: 'Staff relocations', value: 2 },
  { metric: 'Routes suspended', value: 1 },
];

export const securityMapLocations = [
  { name: 'Afgooye (SWS)', lat: 2.14, lng: 45.12, count: 8, severity: 'critical' as const },
  { name: 'Marka (SWS)', lat: 1.71, lng: 44.77, count: 7, severity: 'critical' as const },
  { name: 'Baidoa corridor', lat: 3.11, lng: 43.65, count: 6, severity: 'high' as const },
  { name: 'Daynile (BN)', lat: 2.12, lng: 45.32, count: 5, severity: 'high' as const },
  { name: 'Jowhar (HS)', lat: 2.77, lng: 45.5, count: 5, severity: 'high' as const },
  { name: 'Galkayo (PL)', lat: 6.77, lng: 47.43, count: 4, severity: 'high' as const },
  { name: 'Mogadishu (BN)', lat: 2.05, lng: 45.34, count: 4, severity: 'moderate' as const },
];
