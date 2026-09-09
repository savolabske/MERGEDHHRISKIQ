/** Mock intelligence layers for the Maps GIS surface (ADM1 Somalia). */

export type MapDataLayerId =
  | 'risk'
  | 'displacement'
  | 'aid'
  | 'drought'
  | 'floods'
  | 'alerts';

export type MapOverlayId = 'sea-ports' | 'roads' | 'detected-waters';

export type RiskDimension =
  | 'overall'
  | 'security'
  | 'political'
  | 'economic'
  | 'environmental'
  | 'operational'
  | 'access'
  | 'humanitarian';

export type RiskBand = 'LOW' | 'MEDIUM' | 'MEDIUM-HIGH' | 'HIGH' | 'CRITICAL';

export type DroughtSeverity = 'None' | 'Mild' | 'Moderate' | 'Severe' | 'Extreme';

export type MapLayerRenderMode = 'fill' | 'points';

export const MAP_DATA_LAYERS: {
  id: MapDataLayerId;
  label: string;
  mode: MapLayerRenderMode;
}[] = [
  { id: 'risk', label: 'Risk', mode: 'fill' },
  { id: 'displacement', label: 'Displacement', mode: 'points' },
  { id: 'aid', label: 'Aid', mode: 'fill' },
  { id: 'drought', label: 'Drought', mode: 'fill' },
  { id: 'floods', label: 'Floods', mode: 'fill' },
  { id: 'alerts', label: 'Alerts', mode: 'points' },
];

export const MAP_OVERLAY_GROUPS: {
  id: string;
  label: string;
  items: { id: MapOverlayId; label: string }[];
}[] = [
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    items: [
      { id: 'sea-ports', label: 'Sea Ports' },
      { id: 'roads', label: 'All Roads Coverage' },
    ],
  },
  {
    id: 'water',
    label: 'Water',
    items: [{ id: 'detected-waters', label: 'Detected Waters' }],
  },
];

/** Priority for which fill layer drives the choropleth when several are on. */
export const FILL_LAYER_PRIORITY: MapDataLayerId[] = [
  'risk',
  'drought',
  'floods',
  'aid',
];

export const DEFAULT_SELECTED_LAYERS: MapDataLayerId[] = ['alerts'];
export const DEFAULT_SELECTED_OVERLAYS: MapOverlayId[] = [];

export const RISK_DIMENSIONS: { id: RiskDimension; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'security', label: 'Security' },
  { id: 'political', label: 'Political' },
  { id: 'economic', label: 'Economic' },
  { id: 'environmental', label: 'Environmental' },
  { id: 'operational', label: 'Operational' },
  { id: 'access', label: 'Access' },
  { id: 'humanitarian', label: 'Humanitarian' },
];

export type RegionRiskScores = Record<Exclude<RiskDimension, 'overall'>, number>;

export type MapRegionIntelligence = {
  id: string;
  name: string;
  /** Approximate centroid for bubble overlays [lng, lat]. */
  center: [number, number];
  riskScore: number;
  riskMax: number;
  riskBand: RiskBand;
  previousBand: RiskBand;
  previousScore: number;
  trend7d: number;
  escalated14d: boolean;
  escalationCopy?: string;
  narrative: string;
  dimensions: RegionRiskScores;
  arrivals: number;
  departures: number;
  aidTrackedM: number;
  aidSharePct: number;
  aidDirectM: number;
  aidSharedEstM: number;
  aidPeriod: string;
  drought: DroughtSeverity;
  floodRisk: number;
  displacementPop: number;
};

function dim(
  security: number,
  political: number,
  economic: number,
  environmental: number,
  operational: number,
  access: number,
  humanitarian: number,
): RegionRiskScores {
  return {
    security,
    political,
    economic,
    environmental,
    operational,
    access,
    humanitarian,
  };
}

export const MAP_REGION_INTELLIGENCE: MapRegionIntelligence[] = [
  {
    id: 'awdal',
    name: 'Awdal',
    center: [43.35, 10.55],
    riskScore: 9.2,
    riskMax: 25,
    riskBand: 'MEDIUM',
    previousBand: 'MEDIUM',
    previousScore: 9.0,
    trend7d: 0.2,
    escalated14d: false,
    narrative:
      'Relatively stable northwest corridor with localized pastoral stress. Access remains open along the Djibouti trade route.',
    dimensions: dim(2.1, 1.8, 2.0, 3.4, 1.6, 1.4, 2.2),
    arrivals: 120,
    departures: 800,
    aidTrackedM: 82.4,
    aidSharePct: 1.1,
    aidDirectM: 41.0,
    aidSharedEstM: 41.4,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 1.2,
    displacementPop: 18000,
  },
  {
    id: 'woqooyi',
    name: 'Woqooyi Galbeed',
    center: [44.05, 9.55],
    riskScore: 8.4,
    riskMax: 25,
    riskBand: 'MEDIUM',
    previousBand: 'LOW',
    previousScore: 7.1,
    trend7d: 1.1,
    escalated14d: false,
    narrative:
      'Hargeisa hub remains the commercial center of the north. Drought pressure on peri-urban livelihoods is rising.',
    dimensions: dim(1.9, 1.6, 1.8, 3.6, 1.5, 1.3, 2.0),
    arrivals: 340,
    departures: 1200,
    aidTrackedM: 210.5,
    aidSharePct: 2.8,
    aidDirectM: 120.0,
    aidSharedEstM: 90.5,
    aidPeriod: '2017–2023',
    drought: 'Severe',
    floodRisk: 1.0,
    displacementPop: 42000,
  },
  {
    id: 'togdheer',
    name: 'Togdheer',
    center: [45.55, 9.35],
    riskScore: 11.6,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'MEDIUM',
    previousScore: 10.2,
    trend7d: 0.8,
    escalated14d: false,
    narrative:
      'Pastoral drought and intermittent clan tensions along the Buuhoodle corridor. Water trucking demand is elevated.',
    dimensions: dim(2.8, 2.4, 2.2, 3.8, 2.0, 1.9, 2.6),
    arrivals: 210,
    departures: 2400,
    aidTrackedM: 96.2,
    aidSharePct: 1.3,
    aidDirectM: 30.0,
    aidSharedEstM: 66.2,
    aidPeriod: '2017–2023',
    drought: 'Severe',
    floodRisk: 1.1,
    displacementPop: 31000,
  },
  {
    id: 'sanaag',
    name: 'Sanaag',
    center: [47.45, 10.35],
    riskScore: 14.2,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 13.8,
    trend7d: 0.4,
    escalated14d: false,
    narrative:
      'Remote pastoral districts with thin service coverage. Drought and contested administration complicate delivery.',
    dimensions: dim(3.2, 3.0, 2.6, 4.0, 2.4, 2.8, 3.0),
    arrivals: 80,
    departures: 3100,
    aidTrackedM: 54.8,
    aidSharePct: 0.7,
    aidDirectM: 12.0,
    aidSharedEstM: 42.8,
    aidPeriod: '2017–2023',
    drought: 'Severe',
    floodRisk: 0.8,
    displacementPop: 22000,
  },
  {
    id: 'sool',
    name: 'Sool',
    center: [47.35, 8.65],
    riskScore: 15.1,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 13.4,
    trend7d: 1.6,
    escalated14d: true,
    escalationCopy: 'Escalated MEDIUM-HIGH → HIGH in the last 14 days (13 → 15)',
    narrative:
      'Political contestation and drought-driven displacement. Humanitarian access is intermittent outside Las Anod.',
    dimensions: dim(3.8, 3.6, 2.8, 3.9, 2.6, 3.2, 3.4),
    arrivals: 420,
    departures: 4800,
    aidTrackedM: 61.3,
    aidSharePct: 0.8,
    aidDirectM: 18.0,
    aidSharedEstM: 43.3,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 1.0,
    displacementPop: 38000,
  },
  {
    id: 'bari',
    name: 'Bari',
    center: [49.85, 10.55],
    riskScore: 12.8,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 12.5,
    trend7d: 0.3,
    escalated14d: false,
    narrative:
      'Bosaso port corridor is commercially active but faces piracy residual risk and inland access constraints.',
    dimensions: dim(3.4, 2.6, 2.4, 2.8, 2.2, 2.6, 2.8),
    arrivals: 560,
    departures: 2200,
    aidTrackedM: 178.6,
    aidSharePct: 2.4,
    aidDirectM: 95.0,
    aidSharedEstM: 83.6,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 2.4,
    displacementPop: 45000,
  },
  {
    id: 'nugaal',
    name: 'Nugaal',
    center: [48.55, 8.15],
    riskScore: 13.4,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'MEDIUM',
    previousScore: 11.9,
    trend7d: 1.2,
    escalated14d: false,
    narrative:
      'Garowe hub with expanding IDP caseload from southern drought corridors. Service pressure is rising.',
    dimensions: dim(2.9, 2.5, 2.6, 3.5, 2.3, 2.4, 3.2),
    arrivals: 980,
    departures: 1600,
    aidTrackedM: 112.0,
    aidSharePct: 1.5,
    aidDirectM: 48.0,
    aidSharedEstM: 64.0,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 1.3,
    displacementPop: 52000,
  },
  {
    id: 'mudug',
    name: 'Mudug',
    center: [47.45, 6.85],
    riskScore: 16.0,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'HIGH',
    previousScore: 17.4,
    trend7d: -3.4,
    escalated14d: false,
    narrative:
      'Inter-clan conflict, drought, and displacement continue to shape the Galkayo corridor. Aid volumes are among the highest tracked nationally.',
    dimensions: dim(3.6, 3.2, 2.9, 4.1, 2.8, 3.0, 3.8),
    arrivals: 0,
    departures: 4000,
    aidTrackedM: 1200,
    aidSharePct: 16.1,
    aidDirectM: 0,
    aidSharedEstM: 1200,
    aidPeriod: '2017–2023',
    drought: 'Severe',
    floodRisk: 1.4,
    displacementPop: 78000,
  },
  {
    id: 'galguduud',
    name: 'Galgaduud',
    center: [46.55, 5.15],
    riskScore: 17.8,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 16.0,
    trend7d: 1.9,
    escalated14d: true,
    escalationCopy: 'Escalated MEDIUM-HIGH → HIGH in the last 14 days (16 → 19)',
    narrative:
      'Critical environmental and humanitarian risks — drought, displacement, and disease outbreaks — combine with fragile access inland from Dhusamareb.',
    dimensions: dim(3.9, 3.4, 3.1, 4.4, 3.0, 3.5, 4.2),
    arrivals: 0,
    departures: 5000,
    aidTrackedM: 145.1,
    aidSharePct: 1.9,
    aidDirectM: 22.0,
    aidSharedEstM: 123.1,
    aidPeriod: '2018–2023',
    drought: 'Severe',
    floodRisk: 1.6,
    displacementPop: 64000,
  },
  {
    id: 'hiraan',
    name: 'Hiraan',
    center: [45.35, 4.55],
    riskScore: 16.4,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'HIGH',
    previousScore: 16.1,
    trend7d: 0.3,
    escalated14d: false,
    narrative:
      'Beledweyne flood exposure remains acute along the Shabelle. Conflict and seasonal flooding disrupt supply routes.',
    dimensions: dim(3.7, 3.0, 2.8, 3.6, 2.9, 3.3, 3.8),
    arrivals: 2100,
    departures: 3400,
    aidTrackedM: 198.4,
    aidSharePct: 2.7,
    aidDirectM: 88.0,
    aidSharedEstM: 110.4,
    aidPeriod: '2017–2023',
    drought: 'Mild',
    floodRisk: 8.6,
    displacementPop: 91000,
  },
  {
    id: 'middle-shabelle',
    name: 'Middle Shabelle',
    center: [45.75, 3.15],
    riskScore: 15.6,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 14.2,
    trend7d: 1.1,
    escalated14d: true,
    escalationCopy: 'Escalated MEDIUM-HIGH → HIGH in the last 14 days (14 → 16)',
    narrative:
      'Riverine flood risk and insecurity along the Jowhar–Balcad axis. Cash and food programmes face access delays.',
    dimensions: dim(3.5, 2.9, 2.7, 3.4, 2.8, 3.2, 3.6),
    arrivals: 1800,
    departures: 2200,
    aidTrackedM: 264.0,
    aidSharePct: 3.5,
    aidDirectM: 140.0,
    aidSharedEstM: 124.0,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 8.2,
    displacementPop: 72000,
  },
  {
    id: 'banadir',
    name: 'Banadir',
    center: [45.35, 2.05],
    riskScore: 14.8,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 14.5,
    trend7d: 0.2,
    escalated14d: false,
    narrative:
      'Mogadishu absorbs a large IDP caseload. Urban violence and diversion risk complicate last-mile delivery.',
    dimensions: dim(3.8, 3.1, 2.5, 2.4, 2.6, 2.2, 3.5),
    arrivals: 6200,
    departures: 1800,
    aidTrackedM: 890.2,
    aidSharePct: 11.9,
    aidDirectM: 510.0,
    aidSharedEstM: 380.2,
    aidPeriod: '2017–2023',
    drought: 'Mild',
    floodRisk: 3.8,
    displacementPop: 485000,
  },
  {
    id: 'lower-shabelle',
    name: 'Lower Shabelle',
    center: [44.55, 1.75],
    riskScore: 18.2,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'HIGH',
    previousScore: 17.9,
    trend7d: 0.4,
    escalated14d: false,
    narrative:
      'High insecurity and flood exposure along the Afgooye–Marka corridor. Agricultural recovery remains fragile.',
    dimensions: dim(4.2, 3.3, 3.0, 3.8, 3.2, 3.6, 4.0),
    arrivals: 1500,
    departures: 6200,
    aidTrackedM: 312.5,
    aidSharePct: 4.2,
    aidDirectM: 95.0,
    aidSharedEstM: 217.5,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 7.8,
    displacementPop: 156000,
  },
  {
    id: 'bay',
    name: 'Bay',
    center: [43.45, 2.85],
    riskScore: 19.4,
    riskMax: 25,
    riskBand: 'CRITICAL',
    previousBand: 'HIGH',
    previousScore: 17.6,
    trend7d: 1.8,
    escalated14d: true,
    escalationCopy: 'Escalated HIGH → CRITICAL in the last 14 days (18 → 19)',
    narrative:
      'Baidoa remains a major displacement magnet under severe drought. Food insecurity and WASH gaps are acute.',
    dimensions: dim(4.0, 3.5, 3.4, 4.6, 3.3, 3.4, 4.5),
    arrivals: 8400,
    departures: 2100,
    aidTrackedM: 428.0,
    aidSharePct: 5.7,
    aidDirectM: 210.0,
    aidSharedEstM: 218.0,
    aidPeriod: '2017–2023',
    drought: 'Extreme',
    floodRisk: 2.6,
    displacementPop: 412000,
  },
  {
    id: 'bakool',
    name: 'Bakool',
    center: [43.75, 4.25],
    riskScore: 17.2,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'HIGH',
    previousScore: 16.8,
    trend7d: 0.5,
    escalated14d: false,
    narrative:
      'Hard-to-reach districts with severe drought and thin partner presence. Airlift remains a frequent last resort.',
    dimensions: dim(3.6, 3.2, 3.0, 4.3, 3.1, 3.8, 3.9),
    arrivals: 640,
    departures: 3900,
    aidTrackedM: 88.7,
    aidSharePct: 1.2,
    aidDirectM: 25.0,
    aidSharedEstM: 63.7,
    aidPeriod: '2017–2023',
    drought: 'Extreme',
    floodRisk: 1.5,
    displacementPop: 58000,
  },
  {
    id: 'gedo',
    name: 'Gedo',
    center: [42.15, 3.35],
    riskScore: 16.8,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 15.1,
    trend7d: 1.4,
    escalated14d: true,
    escalationCopy: 'Escalated MEDIUM-HIGH → HIGH in the last 14 days (15 → 17)',
    narrative:
      'Border dynamics with Kenya/Ethiopia and recurrent conflict around Beled Hawo. Displacement spikes remain volatile.',
    dimensions: dim(4.1, 3.4, 2.9, 3.5, 3.0, 3.4, 3.7),
    arrivals: 3200,
    departures: 4100,
    aidTrackedM: 156.3,
    aidSharePct: 2.1,
    aidDirectM: 70.0,
    aidSharedEstM: 86.3,
    aidPeriod: '2017–2023',
    drought: 'Mild',
    floodRisk: 4.2,
    displacementPop: 98000,
  },
  {
    id: 'middle-juba',
    name: 'Middle Juba',
    center: [42.75, 1.15],
    riskScore: 18.6,
    riskMax: 25,
    riskBand: 'HIGH',
    previousBand: 'HIGH',
    previousScore: 18.2,
    trend7d: 0.3,
    escalated14d: false,
    narrative:
      'Among the hardest-to-reach regions. Limited partner footprint and elevated security risk constrain monitoring.',
    dimensions: dim(4.5, 3.6, 3.2, 3.7, 3.4, 4.0, 3.8),
    arrivals: 180,
    departures: 5200,
    aidTrackedM: 42.1,
    aidSharePct: 0.6,
    aidDirectM: 8.0,
    aidSharedEstM: 34.1,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 5.4,
    displacementPop: 41000,
  },
  {
    id: 'lower-juba',
    name: 'Lower Juba',
    center: [42.55, -0.15],
    riskScore: 13.9,
    riskMax: 25,
    riskBand: 'MEDIUM-HIGH',
    previousBand: 'MEDIUM-HIGH',
    previousScore: 13.6,
    trend7d: 0.2,
    escalated14d: false,
    narrative:
      'Kismayo port supports coastal logistics. Inland districts face flood risk and intermittent access constraints.',
    dimensions: dim(3.3, 2.8, 2.6, 3.0, 2.5, 2.7, 3.1),
    arrivals: 1100,
    departures: 2800,
    aidTrackedM: 245.8,
    aidSharePct: 3.3,
    aidDirectM: 130.0,
    aidSharedEstM: 115.8,
    aidPeriod: '2017–2023',
    drought: 'Moderate',
    floodRisk: 7.2,
    displacementPop: 86000,
  },
];

export type MapAlertSeverity = 'critical' | 'high' | 'moderate' | 'watch';

export type MapAlertPoint = {
  id: string;
  name: string;
  regionId: string;
  severity: MapAlertSeverity;
  coordinates: [number, number];
  summary: string;
  updatedLabel: string;
};

export const MAP_ALERT_POINTS: MapAlertPoint[] = [
  {
    id: 'a1',
    name: 'Baidoa nutrition surge',
    regionId: 'bay',
    severity: 'critical',
    coordinates: [43.65, 2.43],
    summary: 'SAM admissions +38% week-on-week across three Baidoa sites.',
    updatedLabel: '2h ago',
  },
  {
    id: 'a2',
    name: 'Marka access closure',
    regionId: 'lower-shabelle',
    severity: 'critical',
    coordinates: [44.77, 1.72],
    summary: 'Main coastal road intermittently closed after clashes.',
    updatedLabel: '4h ago',
  },
  {
    id: 'a3',
    name: 'Beledweyne flood watch',
    regionId: 'hiraan',
    severity: 'high',
    coordinates: [45.2, 4.74],
    summary: 'Shabelle levels approaching breach threshold for riverside camps.',
    updatedLabel: '6h ago',
  },
  {
    id: 'a4',
    name: 'Galkayo displacement spike',
    regionId: 'mudug',
    severity: 'high',
    coordinates: [47.43, 6.77],
    summary: '1.2k new arrivals in 72h linked to rural drought and conflict.',
    updatedLabel: '8h ago',
  },
  {
    id: 'a5',
    name: 'Dhusamareb disease cluster',
    regionId: 'galguduud',
    severity: 'high',
    coordinates: [46.39, 5.54],
    summary: 'AWD cases crossing cluster response threshold.',
    updatedLabel: '11h ago',
  },
  {
    id: 'a6',
    name: 'Afgooye corridor pressure',
    regionId: 'lower-shabelle',
    severity: 'moderate',
    coordinates: [45.02, 2.14],
    summary: 'Shelter occupancy above 95% at two peri-urban sites.',
    updatedLabel: '14h ago',
  },
  {
    id: 'a7',
    name: 'Kismayo WASH alert',
    regionId: 'lower-juba',
    severity: 'moderate',
    coordinates: [42.53, -0.36],
    summary: 'Chlorination shortfall at three coastal water points.',
    updatedLabel: '18h ago',
  },
  {
    id: 'a8',
    name: 'Erigavo pasture failure',
    regionId: 'sanaag',
    severity: 'watch',
    coordinates: [47.37, 10.62],
    summary: 'NDVI anomaly signals severe vegetation loss.',
    updatedLabel: '1d ago',
  },
  {
    id: 'a9',
    name: 'Burao water trucking demand',
    regionId: 'togdheer',
    severity: 'watch',
    coordinates: [45.53, 9.52],
    summary: 'Municipal boreholes running 14h/day to meet demand.',
    updatedLabel: '1d ago',
  },
  {
    id: 'a10',
    name: 'Mogadishu diversion pattern',
    regionId: 'banadir',
    severity: 'high',
    coordinates: [45.32, 2.05],
    summary: 'Three diversion reports matched in 14 days at MPCA sites.',
    updatedLabel: '14h ago',
  },
  {
    id: 'a11',
    name: 'Dolow border influx',
    regionId: 'gedo',
    severity: 'moderate',
    coordinates: [42.08, 4.16],
    summary: 'Cross-border arrivals up 22% vs prior week.',
    updatedLabel: '20h ago',
  },
  {
    id: 'a12',
    name: 'Jowhar river watch',
    regionId: 'middle-shabelle',
    severity: 'moderate',
    coordinates: [45.5, 2.78],
    summary: 'River level 118% of seasonal normal.',
    updatedLabel: '9h ago',
  },
];

export const ALERT_SEVERITY_COLORS: Record<MapAlertSeverity, string> = {
  critical: '#EF4444',
  high: '#F97316',
  moderate: '#EAB308',
  watch: '#FACC15',
};

export const RISK_BAND_COLORS: Record<RiskBand, string> = {
  LOW: '#22C55E',
  MEDIUM: '#EAB308',
  'MEDIUM-HIGH': '#F97316',
  HIGH: '#EF4444',
  CRITICAL: '#DC2626',
};

export function getActiveFillLayer(
  selected: Iterable<MapDataLayerId>,
): MapDataLayerId | null {
  const set = selected instanceof Set ? selected : new Set(selected);
  return FILL_LAYER_PRIORITY.find((id) => set.has(id)) ?? null;
}

export function getRegionById(id: string): MapRegionIntelligence | undefined {
  return MAP_REGION_INTELLIGENCE.find((r) => r.id === id);
}

export function getRegionFillValue(
  region: MapRegionIntelligence,
  fillLayer: MapDataLayerId,
  riskDimension: RiskDimension,
): number {
  switch (fillLayer) {
    case 'risk':
      if (riskDimension === 'overall') return region.riskScore / region.riskMax;
      return region.dimensions[riskDimension] / 5;
    case 'aid':
      return Math.min(1, region.aidTrackedM / 900);
    case 'drought': {
      const rank: Record<DroughtSeverity, number> = {
        None: 0.1,
        Mild: 0.3,
        Moderate: 0.55,
        Severe: 0.78,
        Extreme: 1,
      };
      return rank[region.drought];
    }
    case 'floods':
      return Math.min(1, region.floodRisk / 10);
    default:
      return 0.4;
  }
}

export function getFillColor(
  fillLayer: MapDataLayerId,
  t: number,
): string {
  const clamped = Math.max(0, Math.min(1, t));
  if (fillLayer === 'drought') {
    // light orange → dark red/brown
    return interpolateColor(['#FDE68A', '#F59E0B', '#B45309', '#7C2D12'], clamped);
  }
  if (fillLayer === 'floods') {
    return interpolateColor(['#BAE6FD', '#38BDF8', '#0284C7', '#0C4A6E'], clamped);
  }
  if (fillLayer === 'aid') {
    return interpolateColor(['#FEF3C7', '#FBBF24', '#D97706', '#92400E'], clamped);
  }
  // risk default — blue scale matching screenshots
  return interpolateColor(['#BFDBFE', '#60A5FA', '#2563EB', '#1E3A8A'], clamped);
}

function interpolateColor(stops: string[], t: number): string {
  if (t <= 0) return stops[0];
  if (t >= 1) return stops[stops.length - 1];
  const scaled = t * (stops.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = hexToRgb(stops[i]);
  const b = hexToRgb(stops[Math.min(i + 1, stops.length - 1)]);
  const r = Math.round(a.r + (b.r - a.r) * f);
  const g = Math.round(a.g + (b.g - a.g) * f);
  const bl = Math.round(a.b + (b.b - a.b) * f);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function formatCompactCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) {
    const k = n / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(n);
}

export function formatAidMoney(millions: number): string {
  if (millions >= 1000) {
    const b = millions / 1000;
    return `$${b % 1 === 0 ? b.toFixed(0) : b.toFixed(1)}B`;
  }
  return `$${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
}

export type SeaPortFeature = {
  id: string;
  name: string;
  coordinates: [number, number];
};

export const MAP_SEA_PORTS: SeaPortFeature[] = [
  { id: 'port-mog', name: 'Mogadishu Port', coordinates: [45.35, 2.02] },
  { id: 'port-ber', name: 'Berbera Port', coordinates: [45.01, 10.44] },
  { id: 'port-bos', name: 'Bosaso Port', coordinates: [49.18, 11.28] },
  { id: 'port-kis', name: 'Kismayo Port', coordinates: [42.53, -0.38] },
];

/** Simplified trunk road corridors (LineString coordinates). */
export const MAP_ROADS_GEO: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Coastal corridor' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [42.53, -0.38],
          [44.77, 1.72],
          [45.35, 2.05],
          [45.5, 2.78],
          [45.2, 4.74],
          [47.43, 6.77],
          [48.48, 8.4],
          [49.18, 11.28],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'West corridor' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [42.08, 4.16],
          [43.65, 2.43],
          [45.02, 2.14],
          [45.35, 2.05],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'North corridor' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [43.65, 11.35],
          [44.07, 9.56],
          [45.53, 9.52],
          [47.37, 10.62],
        ],
      },
    },
  ],
};

export const MAP_DETECTED_WATERS_GEO: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Shabelle floodplain' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [45.05, 4.9],
            [45.45, 4.85],
            [45.55, 4.4],
            [45.25, 3.9],
            [45.05, 3.2],
            [44.85, 3.4],
            [44.95, 4.2],
            [45.05, 4.9],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { name: 'Juba floodplain' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [42.3, 0.4],
            [42.7, 0.5],
            [42.85, 1.4],
            [42.6, 2.2],
            [42.2, 2.0],
            [42.1, 1.1],
            [42.3, 0.4],
          ],
        ],
      },
    },
  ],
};
