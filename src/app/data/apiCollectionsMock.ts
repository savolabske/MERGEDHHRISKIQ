export type CollectionProvider = 'hdx' | 'other';

export interface ApiCollection {
  id: string;
  name: string;
  provider: CollectionProvider;
  org: string;
  lastSyncedAt: string;
}

export interface ApiDatasetFile {
  name: string;
  format: string;
  size: string;
}

export interface ApiDataset {
  id: string;
  title: string;
  org: string;
  fileCount: number;
  updatedAt: string;
  collectionId: string;
  collectionName: string;
  provider: CollectionProvider;
  description?: string;
  externalUrl?: string;
  files?: ApiDatasetFile[];
}

export type SyncSchedule = 'manual' | 'daily' | 'weekly';

export interface ApiSubscription {
  id: string;
  datasetId: string;
  title: string;
  org: string;
  collectionName: string;
  provider: CollectionProvider;
  fileCount: number;
  syncSchedule: SyncSchedule;
  status: 'active' | 'syncing' | 'error';
  lastRefreshedAt: string;
  subscribedAt: string;
}

export const MOCK_API_COLLECTIONS: ApiCollection[] = [
  {
    id: 'col-hdx-somalia',
    name: 'HDX Somalia',
    provider: 'hdx',
    org: 'OCHA Somalia',
    lastSyncedAt: 'Mar 12, 2026 6:00 AM',
  },
  {
    id: 'col-hdx-eafrica',
    name: 'HDX Eastern Africa',
    provider: 'hdx',
    org: 'OCHA Regional',
    lastSyncedAt: 'Mar 12, 2026 5:30 AM',
  },
  {
    id: 'col-acled',
    name: 'ACLED Events API',
    provider: 'other',
    org: 'ACLED',
    lastSyncedAt: 'Mar 11, 2026 11:00 PM',
  },
];

export const MOCK_API_DATASETS: ApiDataset[] = [
  {
    id: 'ds-1',
    title: 'Somalia - Displacement Data - Baseline Assessment',
    org: 'IOM',
    fileCount: 4,
    updatedAt: 'Mar 10, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    description: 'IOM DTM baseline displacement figures by region and district in Somalia.',
    externalUrl: 'https://data.humdata.org/dataset/somalia-displacement-data',
    files: [
      { name: 'dtm_baseline_somalia.csv', format: 'CSV', size: '2.4 MB' },
      { name: 'dtm_baseline_somalia.xlsx', format: 'XLSX', size: '3.1 MB' },
      { name: 'metadata.json', format: 'JSON', size: '12 KB' },
      { name: 'readme.pdf', format: 'PDF', size: '180 KB' },
    ],
  },
  {
    id: 'ds-2',
    title: 'Somalia Humanitarian Needs Overview 2026',
    org: 'OCHA Somalia',
    fileCount: 3,
    updatedAt: 'Mar 8, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    description: 'Consolidated humanitarian needs and response priorities for Somalia.',
    externalUrl: 'https://data.humdata.org/dataset/somalia-hno-2026',
    files: [
      { name: 'hno_2026_summary.pdf', format: 'PDF', size: '4.2 MB' },
      { name: 'hno_2026_data.xlsx', format: 'XLSX', size: '1.8 MB' },
      { name: 'hno_2026_indicators.csv', format: 'CSV', size: '890 KB' },
    ],
  },
  {
    id: 'ds-3',
    title: 'Somalia - Integrated Food Security Phase Classification (IPC)',
    org: 'FAO',
    fileCount: 2,
    updatedAt: 'Mar 5, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    description: 'IPC acute food insecurity analysis and population estimates for Somalia.',
    externalUrl: 'https://data.humdata.org/dataset/somalia-ipc',
    files: [
      { name: 'ipc_somalia_current.xlsx', format: 'XLSX', size: '1.2 MB' },
      { name: 'ipc_somalia_map.pdf', format: 'PDF', size: '2.6 MB' },
    ],
  },
  {
    id: 'ds-4',
    title: 'Somalia - Refugee and Asylum Seeker Population Statistics',
    org: 'UNHCR',
    fileCount: 3,
    updatedAt: 'Mar 9, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    description: 'UNHCR population statistics for refugees, asylum seekers, and IDPs in Somalia.',
    externalUrl: 'https://data.humdata.org/dataset/somalia-refugee-population',
    files: [
      { name: 'unhcr_popstats_somalia.csv', format: 'CSV', size: '520 KB' },
      { name: 'unhcr_popstats_somalia.xlsx', format: 'XLSX', size: '680 KB' },
      { name: 'methodology.pdf', format: 'PDF', size: '240 KB' },
    ],
  },
  {
    id: 'ds-5',
    title: 'Somalia - Health Cluster Indicators',
    org: 'WHO',
    fileCount: 2,
    updatedAt: 'Mar 7, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    description: 'Health cluster service delivery and outbreak monitoring indicators.',
    externalUrl: 'https://data.humdata.org/dataset/somalia-health-cluster',
    files: [
      { name: 'health_indicators_q1_2026.xlsx', format: 'XLSX', size: '950 KB' },
      { name: 'health_facility_list.csv', format: 'CSV', size: '310 KB' },
    ],
  },
  {
    id: 'ds-6',
    title: 'Eastern Africa - Food Security Analysis',
    org: 'WFP',
    fileCount: 3,
    updatedAt: 'Mar 6, 2026',
    collectionId: 'col-hdx-eafrica',
    collectionName: 'HDX Eastern Africa',
    provider: 'hdx',
    description: 'Regional food security analysis covering Somalia, Ethiopia, Kenya, and South Sudan.',
    externalUrl: 'https://data.humdata.org/dataset/eastern-africa-food-security',
    files: [
      { name: 'ea_food_security_2026.xlsx', format: 'XLSX', size: '2.1 MB' },
      { name: 'ea_food_prices.csv', format: 'CSV', size: '1.4 MB' },
      { name: 'ea_market_monitor.pdf', format: 'PDF', size: '1.8 MB' },
    ],
  },
  {
    id: 'ds-7',
    title: 'Eastern Africa - Cross-Border Movement Flows',
    org: 'IOM',
    fileCount: 2,
    updatedAt: 'Mar 4, 2026',
    collectionId: 'col-hdx-eafrica',
    collectionName: 'HDX Eastern Africa',
    provider: 'hdx',
    description: 'Cross-border movement tracking data for the Horn of Africa region.',
    externalUrl: 'https://data.humdata.org/dataset/eastern-africa-movement',
    files: [
      { name: 'cross_border_flows.csv', format: 'CSV', size: '780 KB' },
      { name: 'flow_monitoring_points.geojson', format: 'GeoJSON', size: '420 KB' },
    ],
  },
  {
    id: 'ds-8',
    title: 'Somalia - Conflict Events Dataset',
    org: 'ACLED',
    fileCount: 1,
    updatedAt: 'Mar 11, 2026',
    collectionId: 'col-acled',
    collectionName: 'ACLED Events API',
    provider: 'other',
    description: 'Real-time conflict and protest events in Somalia from ACLED.',
    externalUrl: 'https://acleddata.com/data-export-tool',
    files: [
      { name: 'acled_somalia_events.csv', format: 'CSV', size: '3.5 MB' },
    ],
  },
  {
    id: 'ds-9',
    title: 'Somalia - WASH Service Coverage',
    org: 'UNICEF',
    fileCount: 2,
    updatedAt: 'Mar 3, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
  },
  {
    id: 'ds-10',
    title: 'Somalia - Education Cluster 5W',
    org: 'Education Cluster',
    fileCount: 3,
    updatedAt: 'Mar 2, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
  },
  {
    id: 'ds-11',
    title: 'Somalia - Shelter and NFI Gap Analysis',
    org: 'UNHCR',
    fileCount: 2,
    updatedAt: 'Mar 1, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
  },
  {
    id: 'ds-12',
    title: 'Somalia - Nutrition Surveillance Bulletin',
    org: 'WHO',
    fileCount: 1,
    updatedAt: 'Feb 28, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
  },
  {
    id: 'ds-13',
    title: 'Somalia - Protection Monitoring Dashboard',
    org: 'UNHCR',
    fileCount: 3,
    updatedAt: 'Feb 27, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
  },
  {
    id: 'ds-14',
    title: 'Somalia - Logistics Access Constraints',
    org: 'WFP',
    fileCount: 2,
    updatedAt: 'Feb 26, 2026',
    collectionId: 'col-hdx-somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
  },
  {
    id: 'ds-15',
    title: 'Eastern Africa - Climate Shock Indicators',
    org: 'FAO',
    fileCount: 2,
    updatedAt: 'Feb 25, 2026',
    collectionId: 'col-hdx-eafrica',
    collectionName: 'HDX Eastern Africa',
    provider: 'hdx',
  },
  {
    id: 'ds-16',
    title: 'Eastern Africa - Drought Severity Outlook',
    org: 'FEWS NET',
    fileCount: 1,
    updatedAt: 'Feb 24, 2026',
    collectionId: 'col-hdx-eafrica',
    collectionName: 'HDX Eastern Africa',
    provider: 'hdx',
  },
  {
    id: 'ds-17',
    title: 'Eastern Africa - IPC Population Snapshot',
    org: 'IPC',
    fileCount: 2,
    updatedAt: 'Feb 23, 2026',
    collectionId: 'col-hdx-eafrica',
    collectionName: 'HDX Eastern Africa',
    provider: 'hdx',
  },
  {
    id: 'ds-18',
    title: 'Somalia - ACLED Weekly Situation Feed',
    org: 'ACLED',
    fileCount: 1,
    updatedAt: 'Feb 22, 2026',
    collectionId: 'col-acled',
    collectionName: 'ACLED Events API',
    provider: 'other',
  },
  {
    id: 'ds-19',
    title: 'Somalia - Incident Density Heatmap Source',
    org: 'ACLED',
    fileCount: 1,
    updatedAt: 'Feb 21, 2026',
    collectionId: 'col-acled',
    collectionName: 'ACLED Events API',
    provider: 'other',
  },
  {
    id: 'ds-20',
    title: 'Somalia - Political Violence Trendline',
    org: 'ACLED',
    fileCount: 1,
    updatedAt: 'Feb 20, 2026',
    collectionId: 'col-acled',
    collectionName: 'ACLED Events API',
    provider: 'other',
  },
];

export const MOCK_API_SUBSCRIPTIONS: ApiSubscription[] = [
  {
    id: 'sub-1',
    datasetId: 'ds-1',
    title: 'Somalia - Displacement Data - Baseline Assessment',
    org: 'IOM',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    fileCount: 4,
    syncSchedule: 'daily',
    status: 'active',
    lastRefreshedAt: 'Mar 12, 2026 6:15 AM',
    subscribedAt: 'Feb 20, 2026',
  },
  {
    id: 'sub-2',
    datasetId: 'ds-2',
    title: 'Somalia Humanitarian Needs Overview 2026',
    org: 'OCHA Somalia',
    collectionName: 'HDX Somalia',
    provider: 'hdx',
    fileCount: 3,
    syncSchedule: 'weekly',
    status: 'active',
    lastRefreshedAt: 'Mar 10, 2026 8:00 AM',
    subscribedAt: 'Feb 15, 2026',
  },
  {
    id: 'sub-3',
    datasetId: 'ds-6',
    title: 'Eastern Africa - Food Security Analysis',
    org: 'WFP',
    collectionName: 'HDX Eastern Africa',
    provider: 'hdx',
    fileCount: 3,
    syncSchedule: 'manual',
    status: 'error',
    lastRefreshedAt: 'Mar 5, 2026 2:30 PM',
    subscribedAt: 'Mar 1, 2026',
  },
];

export function formatApiDate(date: Date): string {
  return (
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
}

export function formatApiDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
