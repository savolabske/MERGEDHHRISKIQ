export const HUB_BRIEFING = {
  country: 'Somalia',
  generatedAt: '09:38 EAT',
  sources: 18,
  risksReviewed: 247,
  totalAid2026: '$592M',
} as const;

export const HUB_MAIN_INSIGHT = {
  badge: 'Main insight',
  subtitle: 'A quick read on Somalia - A decision support tool built for humanitarian and development operations',
  meta: `Updated ${HUB_BRIEFING.generatedAt} · ${HUB_BRIEFING.sources} sources · aid, climate & displacement`,
  briefingCta: 'Read full briefing',
  body: {
    lead: 'Slow Gu rains are leaving',
    foodInsecure: '1.4 million people',
    regions: 'Bay and Bakool',
    into: 'in urgent food need (IPC 3+).',
    idpSites: 'Baidoa and Mogadishu',
    displacementChange: '12%',
    tail: 'saw more arrivals this month; WASH and shelter are stretched thin.',
  },
} as const;

export type HubPredictiveTheme = 'aid' | 'climate' | 'displacement';

export const HUB_PREDICTIVE_INSIGHTS = [
  {
    id: 'aid',
    theme: 'Aid delivery' as const,
    themeId: 'aid' as HubPredictiveTheme,
    horizon: 'Next 30 days',
    title: 'WASH funding may fall short before mid-June',
    description:
      'If Q2 donor payments slip by three weeks, Bay and Bakool could see an 18% delivery delay — six nutrition and WASH programmes would feel it first.',
    footer: [{ label: '$4.2M at risk' }, { label: '6 programmes' }],
    background:
      'linear-gradient(135deg, var(--gradient-summary-start) 0%, var(--primary) 55%, var(--gradient-summary-end) 100%)',
    borderClass: 'border-primary/30',
  },
  {
    id: 'climate',
    theme: 'Climate' as const,
    themeId: 'climate' as HubPredictiveTheme,
    horizon: 'Season ahead',
    title: 'Late Gu rains could worsen drought in central Somalia',
    description:
      'Rains are starting 2–3 weeks late. Without more food aid by July, about 240,000 more people in Bay and Bakool may reach crisis food levels (IPC 3+).',
    footer: [{ label: 'Bay & Bakool' }, { label: 'Food security data' }],
    background:
      'linear-gradient(135deg, var(--warning-text) 0%, var(--warning-strong) 55%, var(--warning) 100%)',
    borderClass: 'border-warning-strong/30',
  },
  {
    id: 'displacement',
    theme: 'Displacement' as const,
    themeId: 'displacement' as HubPredictiveTheme,
    horizon: 'Next 30 days',
    title: 'More people arriving in Baidoa and Mogadishu than usual',
    description:
      'Displacement tracking points to steady inflows through May. At today’s admission rates, WASH and shelter sites will fill up unless partners add surge capacity.',
    footer: [{ label: '2 clusters' }, { label: 'Weekly tracking' }],
    background:
      'linear-gradient(135deg, #0d9488 0%, #0f766e 55%, #115e59 100%)',
    borderClass: 'border-teal-700/30',
  },
] as const;

export type HubQuickActionId = 'reports' | 'training' | 'security';

export const HUB_QUICK_ACTIONS = [
  {
    id: 'reports' as HubQuickActionId,
    label: 'Reports',
    pillClass: 'border-amber-200/80 bg-amber-50 text-amber-800 hover:bg-amber-100/80',
    iconColor: '#b45309',
  },
  {
    id: 'training' as HubQuickActionId,
    label: 'Training',
    pillClass: 'border-emerald-200/80 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80',
    iconColor: '#047857',
  },
  {
    id: 'security' as HubQuickActionId,
    label: 'Security',
    pillClass: 'border-violet-200/80 bg-violet-50 text-violet-800 hover:bg-violet-100/80',
    iconColor: '#6d28d9',
  },
] as const;

export const HUB_QUICK_ACTION_PANELS: Record<
  HubQuickActionId,
  { label: string; items: readonly string[] }
> = {
  reports: {
    label: 'Reports',
    items: [
      'Latest AID diversion report',
      'Reports on climate',
      'Incident report',
      'Humanitarian needs assessments',
    ],
  },
  training: {
    label: 'Training',
    items: [
      'First aid certification',
      'Data protection training',
      'Field safety orientation',
    ],
  },
  security: {
    label: 'Security',
    items: [
      'Latest security briefing',
      'Regional threat assessment',
      'Travel advisory updates',
      'Incident tracking report',
    ],
  },
};

export type HubTrendingResourceType =
  | 'document'
  | 'health'
  | 'web'
  | 'datasheet'
  | 'coordination';

export type HubTrendingDocument = {
  id: string;
  title: string;
  type: 'pdf' | 'file';
  resourceType: HubTrendingResourceType;
  category: string;
  views: string;
  openedAt: string;
};

/** Trending items — only resources from main menu → Resources (platform resources hub). */
export const HUB_TRENDING_DOCUMENTS: HubTrendingDocument[] = [
  {
    id: '3',
    title: 'Security Incident Reporting SOP',
    type: 'pdf',
    resourceType: 'document',
    category: 'Security & Access',
    views: '892',
    openedAt: '2 hours ago',
  },
  {
    id: '1',
    title: 'HCT Meeting 2026',
    type: 'pdf',
    resourceType: 'coordination',
    category: 'Humanitarian Coordination',
    views: '428',
    openedAt: '5 hours ago',
  },
  {
    id: '2',
    title: 'WASH Sector Assessment Q1',
    type: 'pdf',
    resourceType: 'health',
    category: 'WASH Cluster',
    views: '614',
    openedAt: '8 hours ago',
  },
  {
    id: '4',
    title: 'Mogadishu Access Map Overlay',
    type: 'pdf',
    resourceType: 'datasheet',
    category: 'Geospatial & Access',
    views: '541',
    openedAt: '12 hours ago',
  },
  {
    id: '5',
    title: 'Annual Risk Mitigation Strategy 2026',
    type: 'pdf',
    resourceType: 'document',
    category: 'Risk Management',
    views: '387',
    openedAt: '1 day ago',
  },
  {
    id: '6',
    title: 'DTM Round 15 Displacement Report',
    type: 'pdf',
    resourceType: 'document',
    category: 'Displacement Tracking',
    views: '1,247',
    openedAt: '2 hours ago',
  },
  {
    id: '7',
    title: 'Somalia Humanitarian Response Plan 2026',
    type: 'pdf',
    resourceType: 'coordination',
    category: 'Strategic Planning',
    views: '1,102',
    openedAt: '4 hours ago',
  },
  {
    id: '8',
    title: 'IPC Acute Food Insecurity Analysis Q1',
    type: 'pdf',
    resourceType: 'health',
    category: 'Food Security',
    views: '976',
    openedAt: '6 hours ago',
  },
  {
    id: '9',
    title: 'ReliefWeb Somalia Situation Updates',
    type: 'file',
    resourceType: 'web',
    category: 'External Monitoring',
    views: '834',
    openedAt: '9 hours ago',
  },
  {
    id: '10',
    title: 'Cash Transfer Monitoring Dataset',
    type: 'file',
    resourceType: 'datasheet',
    category: 'Cash & Vouchers',
    views: '712',
    openedAt: '14 hours ago',
  },
  {
    id: '11',
    title: 'Protection Cluster Incident Log',
    type: 'pdf',
    resourceType: 'document',
    category: 'Protection',
    views: '658',
    openedAt: '18 hours ago',
  },
  {
    id: '12',
    title: 'Nutrition Cluster Pipeline Tracker',
    type: 'file',
    resourceType: 'datasheet',
    category: 'Nutrition',
    views: '593',
    openedAt: '1 day ago',
  },
  {
    id: '13',
    title: 'Field Security Travel Advisory — March',
    type: 'pdf',
    resourceType: 'document',
    category: 'Security & Access',
    views: '521',
    openedAt: '1 day ago',
  },
  {
    id: '14',
    title: 'OCHA Somalia Funding Overview',
    type: 'file',
    resourceType: 'web',
    category: 'Funding & Finance',
    views: '489',
    openedAt: '2 days ago',
  },
];

export const HUB_TRENDING_PREVIEW_COUNT = 5;

export type HubKeyInsightCategory = 'climate' | 'aid' | 'displacement';

export type HubKeyInsight = {
  id: string;
  category: HubKeyInsightCategory;
  dotColor: string;
  headline: string;
  description: string;
};

export const HUB_KEY_INSIGHT_CATEGORIES: {
  id: HubKeyInsightCategory;
  label: string;
}[] = [
  { id: 'climate', label: 'Climate' },
  { id: 'aid', label: 'Aid flow' },
  { id: 'displacement', label: 'Displacement' },
];

export const HUB_KEY_INSIGHTS: HubKeyInsight[] = [
  {
    id: 'climate-1',
    category: 'climate',
    dotColor: 'var(--destructive-text)',
    headline: 'Bay and Bakool rains 40% below normal — drought risk raised',
    description:
      'Rain and early-warning data crossed alert levels in six districts. Three WASH and nutrition programmes may run short within 48 hours.',
  },
  {
    id: 'climate-2',
    category: 'climate',
    dotColor: 'var(--warning)',
    headline: 'Gu rains starting 2–3 weeks late across central Somalia',
    description:
      'Vegetation indices show severe stress in pastoral corridors. Without scaled water trucking, livestock losses could accelerate through June.',
  },
  {
    id: 'climate-3',
    category: 'climate',
    dotColor: 'var(--warning-strong)',
    headline: 'Shabelle river levels rising — flood watch for Middle Shabelle',
    description:
      'River gauges crossed 108% of seasonal norms. Pre-position shelter and WASH kits in Hiraan and Lower Shabelle before peak flow.',
  },
  {
    id: 'climate-4',
    category: 'climate',
    dotColor: 'var(--destructive-text)',
    headline: 'Northern coast dry spell extends into third month',
    description:
      'Awdal and Woqooyi Galbeed show critical vegetation loss. Water trucking demand up 28% vs prior month.',
  },
  {
    id: 'climate-5',
    category: 'climate',
    dotColor: 'var(--chart-3)',
    headline: 'Cholera risk elevated where rains lag and WASH gaps persist',
    description:
      'Health surveillance links dry-season movement with AWD signals in Mogadishu peri-urban sites. Chlorination and ORP activation advised.',
  },
  {
    id: 'aid-1',
    category: 'aid',
    dotColor: 'var(--warning)',
    headline: 'WASH and nutrition funding faces a 22% shortfall in Q3',
    description:
      'Donor pledges and internal reviews show six programmes at risk in Bay and Middle Shabelle.',
  },
  {
    id: 'aid-2',
    category: 'aid',
    dotColor: 'var(--primary)',
    headline: 'Galguduud and Lower Shabelle show largest aid delivery gaps',
    description:
      'Late funding meets hard-to-reach corridors. Delivery rates 18–34% below corridor averages.',
  },
  {
    id: 'aid-3',
    category: 'aid',
    dotColor: 'var(--destructive-text)',
    headline: '$4.2M WASH pipeline at risk if Q2 payments slip three weeks',
    description:
      'Six nutrition and WASH programmes in Bay and Bakool would face ration cuts before mid-June.',
  },
  {
    id: 'aid-4',
    category: 'aid',
    dotColor: 'var(--chart-3)',
    headline: 'Aid diversion reports rising in Banadir — pattern flagged',
    description:
      'Partner and community feedback matched three diversion reports in 14 days at MPCA sites.',
  },
  {
    id: 'aid-5',
    category: 'aid',
    dotColor: 'var(--success)',
    headline: 'Mogadishu corridor programmes reaching 92% of targets',
    description:
      'Strong disbursement along the main logistics spine; reallocate surge capacity to Bay and Galguduud gaps.',
  },
  {
    id: 'displacement-1',
    category: 'displacement',
    dotColor: 'var(--primary)',
    headline: 'Mogadishu outskirts: three camps now over capacity',
    description:
      'Protection and camp partners logged a sharp rise in arrivals in 18 hours across Kahda, Dayniile, and Garasbaley.',
  },
  {
    id: 'displacement-2',
    category: 'displacement',
    dotColor: 'var(--warning)',
    headline: 'Baidoa arrivals up 12% month-on-month — shelter stretched',
    description:
      'DTM tracking shows steady inflows from Bay. WASH and shelter sites need surge capacity before rainy season.',
  },
  {
    id: 'displacement-3',
    category: 'displacement',
    dotColor: 'var(--destructive-text)',
    headline: 'Lower Shabelle insecurity driving new IDP movement to Banadir',
    description:
      'Protection incidents correlate with arrival spikes along the Afgooye corridor in the last fortnight.',
  },
  {
    id: 'displacement-4',
    category: 'displacement',
    dotColor: 'var(--chart-3)',
    headline: '48.2k new arrivals in 30 days — above seasonal average',
    description:
      'Displacement tracking points to drought and conflict as primary drivers across 12 regions.',
  },
  {
    id: 'displacement-5',
    category: 'displacement',
    dotColor: 'var(--success)',
    headline: 'Jubaland coastal sites stabilizing after February surge',
    description:
      'Shelter occupancy fell below 85% in Kismayo corridor; capacity available for planned relocations.',
  },
];

export const HUB_KEY_INSIGHT_PREVIEW_COUNT = 2;

export type HubMapLayer = 'aid' | 'climate' | 'displacement';

export type HubClimateHazard = 'drought' | 'floods';

export type HubMapCoverage = 'well' | 'adequate' | 'critical';

export type HubRegionLayers = {
  aid: HubMapCoverage;
  climate: Record<HubClimateHazard, HubMapCoverage>;
  displacement: HubMapCoverage;
};

export type HubMapRegion = {
  id: string;
  name: string;
  layers: HubRegionLayers;
};

/** Choropleth fill colours per main layer (well → adequate → critical). */
export const HUB_CHOROPLETH_PALETTES: Record<
  HubMapLayer,
  Record<HubMapCoverage, string>
> = {
  aid: {
    well: '#1d4ed8',
    adequate: '#60a5fa',
    critical: '#bfdbfe',
  },
  climate: {
    well: '#b45309',
    adequate: '#f59e0b',
    critical: '#fde68a',
  },
  displacement: {
    well: '#6d28d9',
    adequate: '#a78bfa',
    critical: '#ede9fe',
  },
};

/** Flood hazard uses a distinct teal scale when Climate → Floods is active. */
export const HUB_CLIMATE_FLOOD_PALETTE: Record<HubMapCoverage, string> = {
  well: '#0e7490',
  adequate: '#22d3ee',
  critical: '#cffafe',
};

export const HUB_COVERAGE_LEGEND = [
  { id: 'well', label: 'Strong support' },
  { id: 'adequate', label: 'Partial coverage' },
  { id: 'critical', label: 'Major gaps' },
] as const;

export const HUB_BRIEFING_UPDATES = [
  {
    id: '1',
    dotColor: 'var(--destructive-text)',
    headline: 'Bay and Bakool rains 40% below normal — drought risk raised',
    description:
      'Rain and early-warning data crossed alert levels in six districts. Three WASH and nutrition programmes may run short within 48 hours; move supplies in before river levels drop further.',
    relativeTime: '2h ago',
    absoluteTime: '09:14 EAT',
  },
  {
    id: '2',
    dotColor: 'var(--warning)',
    headline: 'WASH and nutrition funding faces a 22% shortfall in Q3',
    description:
      'Donor pledges and internal reviews show six programmes at risk. The pattern mirrors last year’s pre-HRP delays in Bay and Middle Shabelle.',
    relativeTime: '6h ago',
    absoluteTime: '03:42 EAT',
  },
  {
    id: '3',
    dotColor: 'var(--primary)',
    headline: 'Mogadishu outskirts: three camps now over capacity',
    description:
      'Protection and camp partners logged a sharp rise in arrivals in 18 hours. Shelter, WASH, and cash teams should align on a joint response today.',
    relativeTime: '11h ago',
    absoluteTime: '22:36 EAT',
  },
  {
    id: '4',
    dotColor: 'var(--chart-3)',
    headline: 'Aid diversion reports rising in Banadir — pattern flagged',
    description:
      'Partner and community feedback matched three diversion reports in 14 days. The accountability cluster recommends a review at MPCA sites in Garasbaley and Wadajir.',
    relativeTime: '14h ago',
    absoluteTime: '19:10 EAT',
  },
  {
    id: '5',
    dotColor: 'var(--success)',
    headline: 'Cholera signals up 40% in Mogadishu IDP sites — health cluster alert',
    description:
      'Surveillance in Kahda and Dayniile crossed response thresholds. Activate oral rehydration points, hygiene promotion, and WASH chlorination within 72 hours.',
    relativeTime: '18h ago',
    absoluteTime: '15:48 EAT',
  },
] as const;

export type HubReportHighlightId =
  | 'aid-flow'
  | 'migration-displacement'
  | 'somalia-joint-fund'
  | 'climate-hazards';

/** Home — key metrics teased from full report scrollytellings. */
export const HUB_REPORT_HIGHLIGHTS = [
  {
    id: 'aid-flow' as HubReportHighlightId,
    title: 'Aid Flow Intelligence',
    metric: '$15.0B',
    metricLabel: 'committed',
    summary:
      '1,334 projects since 2014 — $9.08B disbursed (61% of envelope). Food Security absorbs 42% of flows.',
    available: true,
  },
  {
    id: 'migration-displacement' as HubReportHighlightId,
    title: 'Migration & Displacement Intelligence',
    metric: '971k',
    metricLabel: 'arrivals tracked',
    summary:
      'Since Oct 2023 across 12 regions — drought drives 68% of recent arrivals; Bay and Banadir receive the most.',
    available: true,
  },
  {
    id: 'somalia-joint-fund' as HubReportHighlightId,
    title: 'Somalia Joint Fund Intelligence',
    metric: '$597.7M',
    metricLabel: 'deposited since 2014',
    summary:
      '12 active programmes · H1 2025 deposits 2.1× H1 2024 — Inclusive Politics leads at 37% of the portfolio.',
    available: true,
  },
  {
    id: 'climate-hazards' as HubReportHighlightId,
    title: 'Climate Hazards Intelligence',
    metric: '40%',
    metricLabel: 'below normal rains',
    summary:
      'Bay and Bakool Gu rains lagging — drought, flood, and cholera risk elevated for operational planning.',
    available: false,
  },
] as const;

/** Somalia ADM1 regions (OCHA/geoBoundaries) with coverage per humanitarian layer. */
export const HUB_MAP_REGIONS: HubMapRegion[] = [
  {
    id: 'awdal',
    name: 'Awdal',
    layers: {
      aid: 'adequate',
      climate: { drought: 'critical', floods: 'well' },
      displacement: 'adequate',
    },
  },
  {
    id: 'woqooyi',
    name: 'Woqooyi Galbeed',
    layers: {
      aid: 'well',
      climate: { drought: 'critical', floods: 'well' },
      displacement: 'well',
    },
  },
  {
    id: 'togdheer',
    name: 'Togdheer',
    layers: {
      aid: 'adequate',
      climate: { drought: 'critical', floods: 'well' },
      displacement: 'adequate',
    },
  },
  {
    id: 'sanaag',
    name: 'Sanaag',
    layers: {
      aid: 'critical',
      climate: { drought: 'critical', floods: 'well' },
      displacement: 'critical',
    },
  },
  {
    id: 'sool',
    name: 'Sool',
    layers: {
      aid: 'critical',
      climate: { drought: 'adequate', floods: 'well' },
      displacement: 'critical',
    },
  },
  {
    id: 'bari',
    name: 'Bari',
    layers: {
      aid: 'adequate',
      climate: { drought: 'adequate', floods: 'adequate' },
      displacement: 'critical',
    },
  },
  {
    id: 'nugaal',
    name: 'Nugaal',
    layers: {
      aid: 'critical',
      climate: { drought: 'adequate', floods: 'well' },
      displacement: 'critical',
    },
  },
  {
    id: 'mudug',
    name: 'Mudug',
    layers: {
      aid: 'adequate',
      climate: { drought: 'critical', floods: 'well' },
      displacement: 'adequate',
    },
  },
  {
    id: 'galguduud',
    name: 'Galguduud',
    layers: {
      aid: 'critical',
      climate: { drought: 'adequate', floods: 'well' },
      displacement: 'critical',
    },
  },
  {
    id: 'hiraan',
    name: 'Hiraan',
    layers: {
      aid: 'adequate',
      climate: { drought: 'well', floods: 'critical' },
      displacement: 'adequate',
    },
  },
  {
    id: 'middle-shabelle',
    name: 'Middle Shabelle',
    layers: {
      aid: 'well',
      climate: { drought: 'adequate', floods: 'critical' },
      displacement: 'well',
    },
  },
  {
    id: 'banadir',
    name: 'Banadir',
    layers: {
      aid: 'well',
      climate: { drought: 'adequate', floods: 'adequate' },
      displacement: 'adequate',
    },
  },
  {
    id: 'lower-shabelle',
    name: 'Lower Shabelle',
    layers: {
      aid: 'critical',
      climate: { drought: 'adequate', floods: 'critical' },
      displacement: 'critical',
    },
  },
  {
    id: 'bay',
    name: 'Bay',
    layers: {
      aid: 'critical',
      climate: { drought: 'critical', floods: 'adequate' },
      displacement: 'critical',
    },
  },
  {
    id: 'bakool',
    name: 'Bakool',
    layers: {
      aid: 'adequate',
      climate: { drought: 'critical', floods: 'well' },
      displacement: 'adequate',
    },
  },
  {
    id: 'gedo',
    name: 'Gedo',
    layers: {
      aid: 'adequate',
      climate: { drought: 'well', floods: 'adequate' },
      displacement: 'critical',
    },
  },
  {
    id: 'middle-juba',
    name: 'Middle Juba',
    layers: {
      aid: 'adequate',
      climate: { drought: 'adequate', floods: 'adequate' },
      displacement: 'adequate',
    },
  },
  {
    id: 'lower-juba',
    name: 'Lower Juba',
    layers: {
      aid: 'well',
      climate: { drought: 'adequate', floods: 'critical' },
      displacement: 'well',
    },
  },
];

export const HUB_MAP_LAYER_META: Record<
  HubMapLayer,
  { label: string; summary: string; statLabel: string; statValue: string }
> = {
  aid: {
    label: 'Aid delivery',
    summary:
      'Aid reaches furthest along the Mogadishu corridor and Jubaland coast. Galguduud, Bay, and Lower Shabelle show the largest gaps, where late funding meets hard-to-reach areas.',
    statLabel: 'TOTAL AID 2026',
    statValue: '$592M',
  },
  climate: {
    label: 'Climate',
    summary:
      'Flood risk is up along the Shabelle river; the north faces long dry spells. WASH and shelter teams are pre-positioning supplies in Middle Shabelle and Hiraan.',
    statLabel: 'ACTIVE ALERTS',
    statValue: '14',
  },
  displacement: {
    label: 'Displacement',
    summary:
      'Most new arrivals are near Baidoa and along routes into Mogadishu. Shelter is full at several Banadir peri-urban sites; WASH pressure is building in Bay.',
    statLabel: 'NEW ARRIVALS (30D)',
    statValue: '48.2k',
  },
};

export const HUB_CLIMATE_HAZARD_META: Record<
  HubClimateHazard,
  { label: string; summary: string; statLabel: string; statValue: string }
> = {
  drought: {
    label: 'Drought',
    summary:
      'Long dry spells hit northern and central pastoral areas hardest. Bay, Bakool, and the northern coast show severe vegetation loss; teams are scaling water trucking and livestock aid.',
    statLabel: 'REGIONS IN DROUGHT',
    statValue: '11',
  },
  floods: {
    label: 'Floods',
    summary:
      'River flooding is most likely along the Shabelle and Juba. Middle and Lower Shabelle, Hiraan, and Lower Juba face the highest Deyr season flood exposure; supplies are being staged.',
    statLabel: 'REGIONS ON FLOOD WATCH',
    statValue: '6',
  },
};

export function getHubChoroplethPalette(
  layer: HubMapLayer,
  climateHazard: HubClimateHazard = 'drought',
): Record<HubMapCoverage, string> {
  if (layer === 'climate' && climateHazard === 'floods') {
    return HUB_CLIMATE_FLOOD_PALETTE;
  }
  return HUB_CHOROPLETH_PALETTES[layer];
}

export function getHubRegionCoverage(
  region: HubMapRegion,
  layer: HubMapLayer,
  climateHazard: HubClimateHazard = 'drought',
): HubMapCoverage {
  if (layer === 'climate') {
    return region.layers.climate[climateHazard];
  }
  return region.layers[layer];
}

export type HubTooltipStat = { label: string; value: string };

function regionMetricSeed(regionId: string, key: string): number {
  let hash = 0;
  const input = `${regionId}:${key}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 1000) / 1000;
}

function scaledMetric(
  regionId: string,
  key: string,
  min: number,
  max: number,
  coverage: HubMapCoverage,
): number {
  const tierScale = { well: 1, adequate: 0.62, critical: 0.34 }[coverage];
  const spread = min + regionMetricSeed(regionId, key) * (max - min);
  return Math.round(spread * tierScale + min * (1 - tierScale) * 0.4);
}

/** Fake per-region figures for map hover tooltips (deterministic per region + layer). */
export function getHubRegionTooltipStats(
  regionId: string,
  layer: HubMapLayer,
  climateHazard: HubClimateHazard,
  coverage: HubMapCoverage,
): HubTooltipStat[] {
  switch (layer) {
    case 'aid': {
      const flowM = (scaledMetric(regionId, 'aid-flow', 4, 48, coverage) / 10).toFixed(1);
      const reached = scaledMetric(regionId, 'aid-reached', 32000, 438000, coverage);
      const programmes = Math.max(2, scaledMetric(regionId, 'aid-prog', 4, 28, coverage));
      const deliveryRate = Math.min(
        98,
        Math.round(52 + regionMetricSeed(regionId, 'aid-rate') * 46 * { well: 1, adequate: 0.78, critical: 0.48 }[coverage]),
      );
      return [
        { label: 'Aid flow (2026)', value: `$${flowM}M` },
        { label: 'People reached', value: reached.toLocaleString('en-US') },
        { label: 'Active programmes', value: String(programmes) },
        { label: 'Delivery rate', value: `${deliveryRate}%` },
      ];
    }
    case 'climate': {
      if (climateHazard === 'drought') {
        const deficit = Math.min(
          72,
          Math.round(18 + regionMetricSeed(regionId, 'drought-def') * 54 * { critical: 1, adequate: 0.72, well: 0.38 }[coverage]),
        );
        const ipc = { critical: 'IPC 4', adequate: 'IPC 3+', well: 'IPC 2' }[coverage];
        const atRisk = scaledMetric(regionId, 'drought-risk', 12000, 186000, coverage);
        const waterTrucks = Math.max(1, scaledMetric(regionId, 'drought-trucks', 2, 14, coverage));
        return [
          { label: 'Rainfall deficit', value: `${deficit}%` },
          { label: 'Food security', value: ipc },
          { label: 'People at risk', value: atRisk.toLocaleString('en-US') },
          { label: 'Water trucking sites', value: String(waterTrucks) },
        ];
      }
      const riskScore = Math.min(
        9.4,
        Math.round((4.2 + regionMetricSeed(regionId, 'flood-score') * 5.1 * { critical: 1, adequate: 0.7, well: 0.42 }[coverage]) * 10) / 10,
      );
      const riverPct = Math.round(108 + regionMetricSeed(regionId, 'flood-river') * 42 * { critical: 1, adequate: 0.75, well: 0.5 }[coverage]);
      const exposed = scaledMetric(regionId, 'flood-exp', 8000, 124000, coverage);
      const shelters = Math.max(2, scaledMetric(regionId, 'flood-shel', 3, 18, coverage));
      return [
        { label: 'Flood risk index', value: `${riskScore} / 10` },
        { label: 'River level vs normal', value: `${riverPct}%` },
        { label: 'People exposed', value: exposed.toLocaleString('en-US') },
        { label: 'Pre-positioned shelters', value: String(shelters) },
      ];
    }
    case 'displacement': {
      const arrivals = scaledMetric(regionId, 'disp-arr', 420, 18400, coverage);
      const idpSites = Math.max(1, scaledMetric(regionId, 'disp-sites', 2, 16, coverage));
      const shelterPct = Math.min(
        100,
        Math.round(38 + regionMetricSeed(regionId, 'disp-shel') * 58 * { well: 1, adequate: 0.8, critical: 0.55 }[coverage]),
      );
      const monthlyChange = Math.round(
        (regionMetricSeed(regionId, 'disp-chg') * 14 + 2) * { critical: 1.4, adequate: 1, well: 0.6 }[coverage],
      );
      return [
        { label: 'New arrivals (30d)', value: arrivals.toLocaleString('en-US') },
        { label: 'IDP sites tracked', value: String(idpSites) },
        { label: 'Shelter capacity used', value: `${shelterPct}%` },
        { label: 'vs prior month', value: `+${monthlyChange}%` },
      ];
    }
  }
}

export function buildHubRegionTooltipHtml(options: {
  regionName: string;
  layerLabel: string;
  coverageLabel: string;
  stats: HubTooltipStat[];
}): string {
  const statsRows = options.stats
    .map(
      (stat) =>
        `<div style="display:flex;justify-content:space-between;gap:12px;margin-top:4px;font-size:12px;">
          <span style="color:#64748b;">${stat.label}</span>
          <span style="font-weight:600;color:#0f172a;white-space:nowrap;">${stat.value}</span>
        </div>`,
    )
    .join('');

  return `<div style="min-width:200px;">
    <div style="font-weight:600;font-size:13px;color:#0f172a;">${options.regionName}</div>
    <div style="margin-top:4px;font-size:11px;color:#64748b;">${options.layerLabel}</div>
    <div style="margin-top:2px;font-size:12px;font-weight:500;color:#334155;">${options.coverageLabel}</div>
    <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;">
      ${statsRows}
    </div>
  </div>`;
}
