import type { SectionNarrative } from './reportShared';

export const CLIMATE_REPORT_CREATED = 'March 1, 2026';

export const CLIMATE_KPIS = {
  newlyDisplaced: 47000,
  ipcPhase4Districts: 4,
  choleraWoWPercent: 34,
  guRainProbability: 65,
  totalHazardEvents2025: 142,
  livestockMortalityBakool: 40,
  villagesUnreachable: 47,
  healthFacilitiesOffline: 3,
};

export const CLIMATE_NOTES = {
  forecast:
    'Forecast is indicative; localised variability expected. FAO-SWALIM and ICPAC advisories should be cross-checked weekly during Gu season.',
  ipc:
    'IPC classifications reflect integrated food security phase analysis — Phase 4 indicates emergency conditions requiring urgent scale-up.',
  choleraLinkage:
    'Cholera uptick correlates with flood-related WASH infrastructure damage and overcrowded IDP settlements — joint flood-disease response recommended.',
};

export const CLIMATE_HAZARD_TYPES = [
  { key: 'flood', label: 'Flash flooding', color: 'var(--primary)', definition: 'Riverine and flash flood events causing displacement and access loss.' },
  { key: 'drought', label: 'Drought', color: 'var(--warning-strong)', definition: 'Rainfall deficit, crop failure, livestock mortality, and IPC deterioration.' },
  { key: 'disease', label: 'Disease outbreak', color: 'var(--destructive-text)', definition: 'Cholera and waterborne disease clusters in camps and flood-affected areas.' },
  { key: 'forecast', label: 'Seasonal hazard', color: 'var(--success)', definition: 'Gu/Deyr seasonal forecasts and anticipatory action triggers.' },
];

export const CLIMATE_NARRATIVES = {
  highlights: {
    eyebrow: 'Climate Hazards — Q1 2026',
    headline: '47,000 newly displaced',
    headlineAccent: 'by flash flooding alone',
    insight:
      'Floods in Hiraan have displaced tens of thousands, drought is deepening in Bakool, and cholera is spreading in Baidoa camps—all at once this quarter.',
  },
  hazardMix: {
    eyebrow: 'Hazard Overview',
    headline: 'The full picture across',
    headlineAccent: 'four hazard types',
    insight:
      'Flash floods and displacement drive Q1. Drought is worsening in farm and pastoral belts, while disease outbreaks are smaller but picking up speed in camps.',
  },
  hazardHotspots: {
    eyebrow: 'Hazard Hotspots — Q1 2026',
    headline: 'Hiraan and Bakool',
    headlineAccent: 'bear the brunt',
    insight:
      'Beledweyne is bearing the heaviest flood load; Baidoa faces drought and disease together. Middle Shabelle river areas see both flood and dry-season stress.',
  },
  top10Hotspots: {
    eyebrow: 'Top 10 Locations — 2025',
    headline: 'Riverine belts dominate',
    headlineAccent: 'the annual hazard map',
    insight:
      'Beledweyne, Jowhar, and the Baidoa belt logged the most hazard events in 2025. Cholera and other outbreaks clustered in IDP settlements around Mogadishu and Bay.',
    footnote: '*Hazard impact score combines displacement, IPC phase, and outbreak intensity.',
  },
  hazardBreakdown: {
    eyebrow: 'Hazard Type Breakdown',
    headline: 'Each hazard type',
    headlineAccent: 'has distinct geography',
    insight:
      'Flooding concentrates in Hiraan; drought in Bakool and Bay; cholera in Banadir IDP camps. Mitigation requires hazard-specific playbooks.',
  },
  seasonalComparison: {
    eyebrow: 'Q4 2025 vs Q1 2026',
    headline: 'Flooding is',
    headlineAccent: 'accelerating fastest',
    insight:
      'Flooding is accelerating fastest versus last quarter. Drought levels stay dangerously high in Bakool, while camp disease cases are climbing quickly.',
  },
  drought: {
    eyebrow: 'Drought — Bakool & Bay',
    headline: 'Livestock mortality hits',
    headlineAccent: '40% in Bakool',
    insight:
      'Pastoral communities in Bakool are losing herds at an alarming rate and most farm zones report failed crops. The Baidoa belt remains in emergency-level food insecurity.',
    bullets: [
      'Feb 28: Livestock mortality reaches 40% in pastoral Bakool.',
      'Feb 15: Crop failure confirmed across 70% of agricultural zones.',
      'Feb 8: Acute malnutrition rates exceed emergency thresholds in Hudur.',
    ],
  },
  flooding: {
    eyebrow: 'Flooding — Hiraan & Shabelle',
    headline: 'Riverine districts are',
    headlineAccent: 'cut off',
    insight:
      'Beledweyne is largely cut off—the airstrip is underwater and dozens of villages cannot be reached by road. Three health facilities are offline.',
    bullets: [
      'Shabelle overflow cut Mogadishu road link.',
      '47 villages unreachable by ground transport.',
      'Anticipatory WASH pre-positioning activated.',
    ],
  },
  cholera: {
    eyebrow: 'Disease Outbreaks',
    headline: 'Baidoa camps show',
    headlineAccent: '34% week-on-week rise',
    insight:
      'Confirmed cholera cases are rising fast in Baidoa-area camps. Daynile and Kahda settlements need urgent WASH support and treatment capacity.',
    bullets: [
      'March 3: 34% week-on-week increase in confirmed cholera cases.',
      'Feb 28: Two treatment centres at 85% bed capacity.',
      'Feb 20: OCV campaign requested for 120,000 people.',
    ],
  },
  forecast: {
    eyebrow: 'FAO-SWALIM Forecast',
    headline: 'Above-average Gu rains',
    headlineAccent: 'elevate flood risk',
    insight:
      'Above-average Gu rains are likely—good for pastures but risky for riverine towns. Plan for more flooding, road cuts, and secondary displacement along the Shabelle.',
    footnote: 'Forecast is indicative; localised variability expected.',
  },
  anticipatory: {
    eyebrow: 'Anticipatory Action',
    headline: 'Contingency stocks',
    headlineAccent: 'are pre-positioned',
    insight:
      'Four hubs are pre-stocked for Gu season with cash triggers and shelter kits in place. Teams can release stocks early if flood or drought thresholds trip.',
  },
  geographic: {
    eyebrow: 'Geographic View',
    headline: 'Hazard zones mapped',
    headlineAccent: 'across Somalia',
    insight:
      'Compare drought stress, flood exposure, and outbreak sites in one view to plan movements, pre-positioning, and health responses by region.',
  },
} satisfies Record<string, SectionNarrative>;

export const hazardMix2025 = [
  { name: 'Flash flooding', value: 42, color: 'var(--primary)' },
  { name: 'Drought', value: 31, color: 'var(--warning-strong)' },
  { name: 'Disease', value: 18, color: 'var(--destructive-text)' },
  { name: 'Other', value: 9, color: 'var(--success)' },
];

export const hazardQ4vsQ1 = [
  { name: 'Flooding', q4: 28, q1: 35 },
  { name: 'Drought', q4: 18, q1: 20 },
  { name: 'Disease', q4: 10, q1: 15 },
  { name: 'Other', q4: 6, q1: 8 },
];

export const hazardHotspotsQ1 = [
  { location: 'Beledweyne (HS)', flood: 18, drought: 2, disease: 4, total: 24 },
  { location: 'Baidoa (Bay)', flood: 4, drought: 14, disease: 5, total: 23 },
  { location: 'Jowhar (HS)', flood: 12, drought: 3, disease: 3, total: 18 },
  { location: 'Hudur (Bakool)', flood: 1, drought: 12, disease: 2, total: 15 },
  { location: 'Daynile (BN)', flood: 3, drought: 1, disease: 8, total: 12 },
  { location: 'Jalalaqsi (HS)', flood: 9, drought: 1, disease: 1, total: 11 },
  { location: 'Wajid (Bakool)', flood: 0, drought: 9, disease: 1, total: 10 },
  { location: 'Kahda (BN)', flood: 2, drought: 0, disease: 6, total: 8 },
];

export const top10ClimateHotspots = [
  { location: 'Beledweyne (HS)', flood: 42, drought: 8, disease: 12, total: 62 },
  { location: 'Baidoa (Bay)', flood: 18, drought: 28, disease: 14, total: 60 },
  { location: 'Jowhar (HS)', flood: 32, drought: 10, disease: 8, total: 50 },
  { location: 'Hudur (Bakool)', flood: 4, drought: 36, disease: 6, total: 46 },
  { location: 'Daynile (BN)', flood: 8, drought: 4, disease: 22, total: 34 },
  { location: 'Jalalaqsi (HS)', flood: 24, drought: 6, disease: 4, total: 34 },
  { location: 'Wajid (Bakool)', flood: 2, drought: 28, disease: 4, total: 34 },
  { location: 'Mogadishu (BN)', flood: 12, drought: 6, disease: 10, total: 28 },
  { location: 'Marka (SWS)', flood: 14, drought: 8, disease: 4, total: 26 },
  { location: 'Kismayo (JL)', flood: 10, drought: 10, disease: 4, total: 24 },
];

export const hazardTypeMiniCharts = [
  {
    title: 'Flood Exposure',
    color: 'var(--primary)',
    data: [
      { location: 'Beledweyne', value: 42 },
      { location: 'Jowhar', value: 32 },
      { location: 'Jalalaqsi', value: 24 },
      { location: 'Marka', value: 14 },
    ],
  },
  {
    title: 'Drought Stress',
    color: 'var(--warning-strong)',
    data: [
      { location: 'Hudur', value: 36 },
      { location: 'Baidoa', value: 28 },
      { location: 'Wajid', value: 28 },
      { location: 'Elberde', value: 18 },
    ],
  },
  {
    title: 'Cholera Cases',
    color: 'var(--destructive-text)',
    data: [
      { location: 'Daynile', value: 22 },
      { location: 'Kahda', value: 14 },
      { location: 'Baidoa IDP', value: 11 },
      { location: 'Afgooye', value: 6 },
    ],
  },
];

export const ipcByDistrict = [
  { district: 'Baidoa (Bay)', phase: 4, value: 100 },
  { district: 'Mogadishu (BN)', phase: 4, value: 85 },
  { district: 'Beledweyne (HS)', phase: 4, value: 78 },
  { district: 'Jowhar (HS)', phase: 4, value: 72 },
  { district: 'Marka (SWS)', phase: 3, value: 55 },
  { district: 'Dollow (JL)', phase: 3, value: 48 },
  { district: 'Garowe (PL)', phase: 2, value: 30 },
];

export const livestockMortalityTrend = [
  { month: 'Oct', mortality: 18 },
  { month: 'Nov', mortality: 22 },
  { month: 'Dec', mortality: 28 },
  { month: 'Jan', mortality: 34 },
  { month: 'Feb', mortality: 38 },
  { month: 'Mar', mortality: 40 },
];

export const floodAffected = [
  { district: 'Beledweyne (HS)', population: 18000 },
  { district: 'Jowhar (HS)', population: 12000 },
  { district: 'Jalalaqsi (HS)', population: 9000 },
  { district: 'Bulo Burto (HS)', population: 8000 },
];

export const floodInfrastructure = [
  { item: 'Health facilities offline', count: 3 },
  { item: 'Villages unreachable', count: 47 },
  { item: 'Airstrips submerged', count: 1 },
  { item: 'Water plants compromised', count: 2 },
];

export const choleraWeekly = [
  { week: 'W1', baidoa: 12, other: 8 },
  { week: 'W2', baidoa: 18, other: 9 },
  { week: 'W3', baidoa: 24, other: 11 },
  { week: 'W4', baidoa: 32, other: 12 },
  { week: 'W5', baidoa: 43, other: 14 },
];

export const choleraCampMini = [
  { camp: 'Daynile', value: 18 },
  { camp: 'Kahda', value: 14 },
  { camp: 'Baidoa IDP', value: 11 },
  { camp: 'Afgooye', value: 6 },
];

export const guForecast = [
  { month: 'Apr', probability: 58 },
  { month: 'May', probability: 65 },
  { month: 'Jun', probability: 62 },
];

export const anticipatoryActions = [
  { action: 'Hubs pre-stocked', value: 4 },
  { action: 'Cash triggers armed', value: 3 },
  { action: 'Shelter kits positioned', value: 12000 },
  { action: 'WASH kits positioned', value: 8500 },
];

export const hazardMonthly = [
  { month: 'Oct', flood: 8, drought: 12, disease: 4 },
  { month: 'Nov', flood: 10, drought: 14, disease: 5 },
  { month: 'Dec', flood: 12, drought: 15, disease: 6 },
  { month: 'Jan', flood: 18, drought: 16, disease: 8 },
  { month: 'Feb', flood: 28, drought: 18, disease: 12 },
  { month: 'Mar', flood: 35, drought: 20, disease: 15 },
];

export const displacementTrend = [
  { month: 'Oct', displaced: 8000, cumulative: 8000 },
  { month: 'Nov', displaced: 12000, cumulative: 20000 },
  { month: 'Dec', displaced: 15000, cumulative: 35000 },
  { month: 'Jan', displaced: 22000, cumulative: 57000 },
  { month: 'Feb', displaced: 38000, cumulative: 95000 },
  { month: 'Mar', displaced: 47000, cumulative: 142000 },
];

export const climateMapLocations = [
  { name: 'Beledweyne (HS)', lat: 4.74, lng: 45.2, count: 47, severity: 'critical' as const },
  { name: 'Baidoa (Bay)', lat: 3.11, lng: 43.65, count: 43, severity: 'critical' as const },
  { name: 'Hudur (Bakool)', lat: 4.18, lng: 43.06, count: 40, severity: 'high' as const },
  { name: 'Jowhar (HS)', lat: 2.77, lng: 45.5, count: 28, severity: 'high' as const },
  { name: 'Daynile (BN)', lat: 2.12, lng: 45.32, count: 18, severity: 'moderate' as const },
  { name: 'Jalalaqsi (HS)', lat: 3.85, lng: 45.55, count: 16, severity: 'high' as const },
  { name: 'Wajid (Bakool)', lat: 3.81, lng: 43.25, count: 14, severity: 'high' as const },
];
