import {
  Sparkles,
  AlignLeft,
  BarChart2,
  PieChart,
  LayoutGrid,
  TrendingUp,
  Hash,
  Home,
  CheckCircle2,
  Calendar,
  Briefcase,
  Heart,
  Sprout,
  type LucideIcon,
} from 'lucide-react';
import {
  CATALOG_DEFAULT_THEME,
  REPORT_THEME_LIST,
  resolveThemeId,
} from './reportThemeTokens';

export type ReportStatus = 'draft' | 'published';

export type ReportCatalogId =
  | 'aid-flow'
  | 'migration-displacement'
  | 'somalia-joint-fund';

export type ReportChartType =
  | 'auto'
  | 'ranked_bars'
  | 'stat_bar'
  | 'donut_split'
  | 'treemap'
  | 'trend_line'
  | 'single_stat';

export type ReportThemeId =
  | 'aid_flow'
  | 'migration'
  | 'sjf'
  | 'slate'
  | 'forest'
  | 'amber_field'
  | 'plum'
  | 'midnight';

export type ReportSectionLayout = 'split' | 'tile_grid';

export type KpiIconKey =
  | 'home'
  | 'check'
  | 'calendar'
  | 'briefcase'
  | 'heart'
  | 'sprout';

export interface ReportChartDatum {
  label: string;
  value: number;
  displayValue?: string;
}

export interface ReportKpiTile {
  id: string;
  prompt: string;
  iconKey: KpiIconKey;
  /** Generated display fields — present after AI draft */
  label?: string;
  value?: string;
  sub?: string;
}

export interface ReportSection {
  id: string;
  order: number;
  title: string;
  layout: ReportSectionLayout;
  chartType: ReportChartType;
  prompt: string;
  tiles?: ReportKpiTile[];
  /** Generated display fields — present after AI draft */
  chartCaption?: string;
  chartTitle?: string;
  stat?: string;
  statLabel?: string;
  body?: string;
  bullets?: string[];
  chartData?: ReportChartDatum[];
}

/** Future: attach resources / sources for AI generation */
export interface ManagedReport {
  id: string;
  /** Links this definition to a live thematic report in the Reports hub */
  catalogId?: ReportCatalogId;
  title: string;
  description: string;
  reportContext: string;
  status: ReportStatus;
  themeId: ReportThemeId;
  userGroups: string[];
  kpiTiles: ReportKpiTile[];
  sections: ReportSection[];
  createdAt: string;
  updatedAt: string;
  /** Linked resource used as AI knowledge for this report */
  resourceId?: string;
  /**
   * Where linked resources are drawn from.
   * - `admin` — Admin → Resources (default for managed / builtin reports)
   * - `user` — My Resources (normal-user created reports)
   */
  resourcePool?: 'admin' | 'user';
  creationMode?: 'manual' | 'master_prompt';
  masterPrompt?: string;
}

export function hasLinkedKnowledgeSources(report: ManagedReport): boolean {
  if (report.resourceId) return true;
  return Boolean(report.catalogId);
}

export function reportHasGeneratedContent(report: ManagedReport): boolean {
  if (report.kpiTiles.some((t) => Boolean(t.value?.trim()))) return true;
  return report.sections.some(
    (s) =>
      Boolean(s.body?.trim()) ||
      Boolean(s.stat?.trim()) ||
      (s.tiles?.some((t) => Boolean(t.value?.trim())) ?? false),
  );
}

export function linkReportResource(reportId: string, resourceId: string): ManagedReport | null {
  const reports = loadManagedReports();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx < 0) return null;
  const updated: ManagedReport = {
    ...reports[idx],
    resourceId,
    updatedAt: formatDate(new Date()),
  };
  const next = [...reports];
  next[idx] = updated;
  saveManagedReports(next);
  return updated;
}

/** Reports that already use this resource. */
export function getReportsUsingResource(
  resourceId: string,
  reports: ManagedReport[] = loadManagedReports(),
): Pick<ManagedReport, 'id' | 'title'>[] {
  return reports
    .filter((r) => r.resourceId === resourceId)
    .map((r) => ({ id: r.id, title: r.title }));
}

export interface ReportChartTypeOption {
  value: ReportChartType;
  label: string;
  icon: LucideIcon;
}

export const REPORT_CHART_TYPES: ReportChartTypeOption[] = [
  { value: 'auto', label: 'Auto', icon: Sparkles },
  { value: 'ranked_bars', label: 'Ranked bars', icon: AlignLeft },
  { value: 'stat_bar', label: 'Stat + bar', icon: BarChart2 },
  { value: 'donut_split', label: 'Donut split', icon: PieChart },
  { value: 'treemap', label: 'Treemap', icon: LayoutGrid },
  { value: 'trend_line', label: 'Trend line', icon: TrendingUp },
  { value: 'single_stat', label: 'Single stat', icon: Hash },
];

export const KPI_ICON_MAP: Record<KpiIconKey, LucideIcon> = {
  home: Home,
  check: CheckCircle2,
  calendar: Calendar,
  briefcase: Briefcase,
  heart: Heart,
  sprout: Sprout,
};

export const KPI_ICON_KEYS: KpiIconKey[] = [
  'home',
  'check',
  'calendar',
  'briefcase',
  'heart',
  'sprout',
];

export interface ReportThemeOption {
  id: ReportThemeId;
  label: string;
  bg: string;
  surface: string;
  accent: string;
}

export const REPORT_THEMES = REPORT_THEME_LIST.map((t) => ({
  id: t.id,
  label: t.label,
  bg: t.pageBg,
  surface: t.cardBg,
  accent: t.accent,
}));

export function getChartTypeLabel(type: ReportChartType): string {
  return REPORT_CHART_TYPES.find((c) => c.value === type)?.label ?? type;
}

export function getChartTypeDisplayLabel(type: ReportChartType): string {
  const label = getChartTypeLabel(type);
  return label.toUpperCase().replace(/\+/g, '+');
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function createKpiTiles(): ReportKpiTile[] {
  return KPI_ICON_KEYS.map((iconKey, i) => ({
    id: `kpi-${i + 1}`,
    prompt: '',
    iconKey,
  }));
}

function createForwardLookTiles(): ReportKpiTile[] {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `forward-tile-${i + 1}`,
    prompt: '',
    iconKey: KPI_ICON_KEYS[i % KPI_ICON_KEYS.length],
  }));
}

const DEFAULT_SECTION_DEFS: {
  title: string;
  chartType: ReportChartType;
  layout: ReportSectionLayout;
}[] = [
  { title: 'The big picture', chartType: 'stat_bar', layout: 'split' },
  { title: 'Top contributors', chartType: 'ranked_bars', layout: 'split' },
  { title: 'Category breakdown', chartType: 'treemap', layout: 'split' },
  { title: 'A key split', chartType: 'donut_split', layout: 'split' },
  { title: 'Trend over time', chartType: 'trend_line', layout: 'split' },
  { title: 'Regional breakdown', chartType: 'ranked_bars', layout: 'split' },
  { title: 'Who delivers it', chartType: 'single_stat', layout: 'split' },
  { title: 'Cross-cutting view', chartType: 'donut_split', layout: 'split' },
  { title: 'Forward Look', chartType: 'auto', layout: 'tile_grid' },
];

export const BUILTIN_REPORT_DEFINITIONS: {
  catalogId: ReportCatalogId;
  title: string;
  description: string;
}[] = [
  {
    catalogId: 'aid-flow',
    title: 'Aid Flow Intelligence',
    description:
      'Track donor contributions, sector allocation, and spending delivery across regions.',
  },
  {
    catalogId: 'migration-displacement',
    title: 'Migration & Displacement Intelligence',
    description:
      'IDP tracking, cross-border movement patterns, and returnee statistics.',
  },
  {
    catalogId: 'somalia-joint-fund',
    title: 'Somalia Joint Fund Intelligence',
    description:
      'Track the SJF portfolio, donor base, thematic windows, programmes, and H1 2025 results.',
  },
];

function buildSectionsForReport(reportKey: string): ReportSection[] {
  return DEFAULT_SECTION_DEFS.map((def, i) => ({
    id: `${reportKey}-section-${i + 1}`,
    order: i,
    title: def.title,
    layout: def.layout,
    chartType: def.chartType,
    prompt: '',
    ...(def.layout === 'tile_grid'
      ? {
          tiles: createForwardLookTiles().map((t, ti) => ({
            ...t,
            id: `${reportKey}-forward-tile-${ti + 1}`,
          })),
        }
      : {}),
  }));
}

function buildKpiTilesForReport(reportKey: string): ReportKpiTile[] {
  return createKpiTiles().map((t, i) => ({
    ...t,
    id: `${reportKey}-kpi-${i + 1}`,
  }));
}

export function createBuiltinManagedReport(
  catalogId: ReportCatalogId,
  overrides?: Partial<ManagedReport>,
): ManagedReport {
  const def = BUILTIN_REPORT_DEFINITIONS.find((r) => r.catalogId === catalogId)!;
  const base: ManagedReport = {
    id: catalogId,
    catalogId,
    title: def.title,
    description: def.description,
    reportContext: '',
    status: 'published',
    themeId: CATALOG_DEFAULT_THEME[catalogId],
    userGroups: [],
    kpiTiles: buildKpiTilesForReport(catalogId),
    sections: buildSectionsForReport(catalogId),
    createdAt: 'Mar 1, 2026',
    updatedAt: 'Mar 12, 2026',
  };
  return { ...base, ...overrides, id: catalogId, catalogId };
}

export function buildInitialManagedReports(): ManagedReport[] {
  return [
    createBuiltinManagedReport('aid-flow', { resourceId: '2' }),
    createBuiltinManagedReport('migration-displacement', { resourceId: '2' }),
    createBuiltinManagedReport('somalia-joint-fund', { resourceId: '3' }),
  ];
}

export function isBuiltinReport(report: ManagedReport): boolean {
  return Boolean(report.catalogId);
}

const MANAGED_REPORTS_STORAGE_KEY = 'hh.managedReports';

export const MANAGED_REPORTS_CHANGED_EVENT = 'hh:managed-reports-changed';

function notifyManagedReportsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MANAGED_REPORTS_CHANGED_EVENT));
}

function mergeWithBuiltins(stored: ManagedReport[]): ManagedReport[] {
  const builtins = buildInitialManagedReports();
  const custom = stored.filter((r) => !r.catalogId);
  const mergedBuiltins = builtins.map((builtin) => {
    const existing = stored.find(
      (s) => s.catalogId === builtin.catalogId || s.id === builtin.catalogId,
    );
    if (!existing) return builtin;
    return {
      ...builtin,
      ...existing,
      id: builtin.id,
      catalogId: builtin.catalogId,
      // Keep seeded resource links unless the stored report already has one
      resourceId: existing.resourceId ?? builtin.resourceId,
      themeId: resolveThemeId(existing.themeId ?? builtin.themeId),
      kpiTiles: existing.kpiTiles?.length ? existing.kpiTiles : builtin.kpiTiles,
      sections: existing.sections?.length ? existing.sections : builtin.sections,
    };
  });
  return [...mergedBuiltins, ...custom];
}

export function loadManagedReports(): ManagedReport[] {
  try {
    const raw = sessionStorage.getItem(MANAGED_REPORTS_STORAGE_KEY);
    if (raw) {
      return mergeWithBuiltins(JSON.parse(raw) as ManagedReport[]);
    }
  } catch {
    /* ignore */
  }
  return buildInitialManagedReports();
}

export function saveManagedReports(reports: ManagedReport[]): void {
  try {
    sessionStorage.setItem(MANAGED_REPORTS_STORAGE_KEY, JSON.stringify(reports));
    notifyManagedReportsChanged();
  } catch {
    /* ignore */
  }
}

export function getCatalogManagedReports(): ManagedReport[] {
  return loadManagedReports().filter((r) => r.catalogId && r.status === 'published');
}

export function createDefaultReportSkeleton(input: {
  title: string;
  description: string;
  userGroups: string[];
  resourceId?: string;
  resourcePool?: 'admin' | 'user';
  creationMode?: 'manual' | 'master_prompt';
  masterPrompt?: string;
}): ManagedReport {
  const now = new Date();
  const dateStr = formatDate(now);
  const id = `report-${Date.now()}`;

  const sections: ReportSection[] = DEFAULT_SECTION_DEFS.map((def, i) => ({
    id: `section-${i + 1}`,
    order: i,
    title: def.title,
    layout: def.layout,
    chartType: def.chartType,
    prompt: '',
    ...(def.layout === 'tile_grid' ? { tiles: createForwardLookTiles() } : {}),
  }));

  return {
    id,
    title: input.title.trim() || 'Untitled report',
    description: input.description.trim(),
    status: 'draft',
    themeId: 'aid_flow',
    userGroups: input.userGroups,
    resourceId: input.resourceId,
    resourcePool: input.resourcePool ?? 'admin',
    creationMode: input.creationMode,
    masterPrompt: input.masterPrompt?.trim() || undefined,
    reportContext:
      input.creationMode === 'master_prompt' ? input.masterPrompt?.trim() ?? '' : '',
    kpiTiles: createKpiTiles(),
    sections,
    createdAt: dateStr,
    updatedAt: dateStr,
  };
}

export const INITIAL_MANAGED_REPORTS: ManagedReport[] = buildInitialManagedReports();

const GENERATED_KPI_DEFS: Omit<ReportKpiTile, 'id' | 'iconKey'>[] = [
  {
    label: 'Total Aid Envelope',
    value: '$15.00B',
    sub: '2014–2026 · 1,334 projects',
    prompt: "Summarise the total aid envelope and what's driving it",
  },
  {
    label: 'Actual Disbursements',
    value: '$9.08B',
    sub: '61% of envelope',
    prompt: 'Compare actual vs planned disbursements over time',
  },
  {
    label: 'Planned Disbursements',
    value: '$4.88B',
    sub: '2020–2030 commitments',
    prompt: 'Where are future planned disbursements concentrated?',
  },
  {
    label: 'Active Projects',
    value: '1,334',
    sub: 'across 8 regions',
    prompt: 'List the largest active projects',
  },
  {
    label: 'Top Donor',
    value: 'FCDO (UK)',
    sub: '$1.10B · 12%',
    prompt: 'Analyze FCDO funding by sector',
  },
  {
    label: 'Top Sector',
    value: 'Food Security',
    sub: '$3.80B · 42%',
    prompt: 'Why is Food Security so dominant?',
  },
];

const GENERATED_SECTION_DEFS: Array<{
  title: string;
  chartType: ReportChartType;
  prompt: string;
  chartCaption: string;
  chartTitle: string;
  stat: string;
  statLabel: string;
  body: string;
  bullets: string[];
  chartData: ReportChartDatum[];
}> = [
  {
    title: 'The big picture',
    chartType: 'stat_bar',
    prompt: "Summarise the total aid envelope and what's driving it",
    chartCaption: 'Envelope vs disbursed',
    chartTitle: 'Committed → Disbursed → Planned',
    stat: '$15.00B',
    statLabel: 'committed across 1,334 projects since 2014',
    body: "Somalia's recorded aid since 2014 totals roughly $15 billion in commitments. Of that, $9.08B has actually been disbursed — about 61 cents on every committed dollar.",
    bullets: [
      '$9.08B actually disbursed (61%)',
      '$4.88B planned for 2020–2030',
      '176 distinct donors recorded',
    ],
    chartData: [
      { label: 'Committed', value: 100, displayValue: '$15.0B' },
      { label: 'Disbursed', value: 61, displayValue: '$9.08B' },
      { label: 'Planned', value: 33, displayValue: '$4.88B' },
    ],
  },
  {
    title: 'Top contributors',
    chartType: 'ranked_bars',
    prompt: 'Show the donor ranking and concentration',
    chartCaption: 'Top donors',
    chartTitle: 'Disbursements by donor (USD)',
    stat: '$4.6B',
    statLabel: 'from the top 5 donors alone',
    body: 'Funding is concentrated. The top five donors — FCDO, USAID, Germany, the World Bank and the EU — account for about half of all disbursements. FCDO alone leads at $1.10B.',
    bullets: [
      'FCDO (UK) leads with $1.10B',
      'Long tail of 170+ smaller donors',
      'Multilateral + bilateral mix',
    ],
    chartData: [
      { label: 'FCDO', value: 1097, displayValue: '$1.10B' },
      { label: 'USAID', value: 704, displayValue: '$704M' },
      { label: 'Germany', value: 695, displayValue: '$695M' },
      { label: 'World Bank', value: 641, displayValue: '$641M' },
      { label: 'EU', value: 633, displayValue: '$633M' },
    ],
  },
  {
    title: 'Category breakdown',
    chartType: 'treemap',
    prompt: 'Why is Food Security so dominant?',
    chartCaption: 'Sector allocation',
    chartTitle: 'Top sectors by actual disbursements',
    stat: '42%',
    statLabel: 'of all disbursements go to Food Security',
    body: 'Sector funding is heavily skewed. Food Security absorbs $3.80B — more than the next seven sectors combined — reflecting recurring drought and famine response.',
    bullets: [
      'Food Security: $3.80B (42%)',
      'Health a distant second at $656M',
      'Governance & PFM steadily funded',
    ],
    chartData: [
      { label: 'Food Security', value: 3803, displayValue: '$3.80B' },
      { label: 'Health', value: 656, displayValue: '$656M' },
      { label: 'Social Protection', value: 406, displayValue: '$406M' },
      { label: 'Refugees', value: 304, displayValue: '$304M' },
    ],
  },
  {
    title: 'A key split',
    chartType: 'donut_split',
    prompt: 'Compare humanitarian vs development funding',
    chartCaption: 'Humanitarian vs development',
    chartTitle: 'Envelope split by marker',
    stat: '55 / 45',
    statLabel: 'humanitarian vs development split',
    body: 'Roughly $4.99B flows through humanitarian-marked projects versus $4.08B development. The country remains in a response posture more than a building one.',
    bullets: [
      'Humanitarian: $4.99B (55%)',
      'Development: $4.08B (45%)',
      '312 humanitarian-marked projects',
    ],
    chartData: [
      { label: 'Humanitarian', value: 55, displayValue: '$4.99B' },
      { label: 'Development', value: 45, displayValue: '$4.08B' },
    ],
  },
  {
    title: 'Trend over time',
    chartType: 'trend_line',
    prompt: 'Compare actual vs planned disbursements over time',
    chartCaption: 'Disbursement trend',
    chartTitle: 'Actual vs planned, 2014–2026',
    stat: '2019',
    statLabel: 'the peak year at $1.67B disbursed',
    body: 'Actual disbursements climbed sharply to 2019, then plateaued. Reporting thins after 2023 — but planned commitments spike to $1.82B in 2025, signalling a pipeline yet to land.',
    bullets: [
      'Peak actual: $1.67B in 2019',
      'Reported actuals taper after 2023',
      'Planned surge: $1.82B for 2025',
    ],
    chartData: [
      { label: '2016', value: 277 },
      { label: '2017', value: 1111 },
      { label: '2018', value: 1123 },
      { label: '2019', value: 1665 },
      { label: '2020', value: 1606 },
      { label: '2021', value: 942 },
      { label: '2022', value: 1093 },
      { label: '2023', value: 1203 },
    ],
  },
  {
    title: 'Regional breakdown',
    chartType: 'ranked_bars',
    prompt: 'Which regions are underfunded?',
    chartCaption: 'Regional allocation',
    chartTitle: 'Disbursements by region',
    stat: '$1.43B',
    statLabel: 'to Puntland — the most-funded region',
    body: 'Disbursements spread across all federal member states. Puntland leads at $1.43B, followed by federal-level (FGS) programmes and South West. Galmudug sits lowest at $558M.',
    bullets: [
      'Puntland highest: $1.43B',
      'Galmudug lowest: $558M',
      '8 regions tracked + federal',
    ],
    chartData: [
      { label: 'Puntland', value: 1426, displayValue: '$1.43B' },
      { label: 'FGS', value: 1195, displayValue: '$1.19B' },
      { label: 'South West', value: 1113, displayValue: '$1.11B' },
      { label: 'Somaliland', value: 1108, displayValue: '$1.11B' },
      { label: 'Galmudug', value: 558, displayValue: '$558M' },
    ],
  },
  {
    title: 'Who delivers it',
    chartType: 'single_stat',
    prompt: 'Analyse implementers and delivery partners',
    chartCaption: 'Implementer analysis',
    chartTitle: 'Top implementing partners',
    stat: '$3.15B',
    statLabel: 'channelled through WFP alone',
    body: 'Delivery is concentrated too. WFP moves $3.15B — a third of everything — followed by Somali federal ministries and UNICEF. The mix shows a blend of UN agencies and government systems.',
    bullets: [
      'WFP: $3.15B delivered',
      'Govt ministries rising as channels',
      'UNICEF, IOM, INGOs follow',
    ],
    chartData: [{ label: 'WFP', value: 3148, displayValue: '$3.15B' }],
  },
  {
    title: 'Cross-cutting view',
    chartType: 'donut_split',
    prompt: 'Show climate-related aid flows',
    chartCaption: 'Markers',
    chartTitle: 'Funding by cross-cutting marker',
    stat: '$3.77B',
    statLabel: 'touches climate & environment',
    body: 'Markers show how priorities thread through projects. Capacity development ($7.6B) and gender ($6.9B) are tagged most. Climate touches $3.77B across 146 projects — growing fast.',
    bullets: [
      'Capacity Dev: 713 projects',
      'Gender-marked: 635 projects',
      'Climate: 146 projects, $3.77B',
    ],
    chartData: [
      { label: 'Capacity', value: 35, displayValue: '$7.6B' },
      { label: 'Gender', value: 32, displayValue: '$6.9B' },
      { label: 'Climate', value: 18, displayValue: '$3.8B' },
      { label: 'Other', value: 15, displayValue: '—' },
    ],
  },
];

const GENERATED_FORWARD_TILES: Omit<ReportKpiTile, 'id' | 'iconKey'>[] = [
  {
    label: 'Funding gap risk',
    value: '$3.2B',
    sub: 'Planned commitments versus annualized delivery.',
    prompt: 'Flag the largest funding gap risks in the pipeline',
  },
  {
    label: 'Declining sectors',
    value: 'Health',
    sub: 'Secondary sectors taper as food security dominates.',
    prompt: 'Which sectors are declining year over year?',
  },
  {
    label: 'Underfunded regions',
    value: 'Galmudug',
    sub: 'Remains lowest among federal member states.',
    prompt: 'Highlight the most underfunded regions',
  },
  {
    label: 'Rising activity',
    value: 'Climate',
    sub: 'Climate-marked funding rising across 146 projects.',
    prompt: 'Where is activity rising fastest?',
  },
  {
    label: 'Possible overlap',
    value: 'Food + Puntland',
    sub: 'Concentration in food security and Puntland.',
    prompt: 'Flag possible programme overlap',
  },
  {
    label: 'Delivery concentration',
    value: 'WFP 35%',
    sub: 'Delivery remains concentrated through leading implementers.',
    prompt: 'Measure delivery concentration risk',
  },
];

/** Fill skeleton sections/KPIs with a drafted report from a master prompt. */
export function applyMasterPromptGeneration(
  report: ManagedReport,
  masterPrompt: string,
): ManagedReport {
  const prompt = masterPrompt.trim();
  const kpiTiles = report.kpiTiles.map((tile, i) => {
    const def = GENERATED_KPI_DEFS[i % GENERATED_KPI_DEFS.length];
    return {
      ...tile,
      ...def,
      id: tile.id,
      iconKey: tile.iconKey,
    };
  });

  const splitDefs = GENERATED_SECTION_DEFS;
  let splitIdx = 0;

  const sections = report.sections.map((section) => {
    if (section.layout === 'tile_grid') {
      return {
        ...section,
        title: 'Forward Look',
        prompt: 'Surface predictive insights and risks from the attached sources',
        tiles: (section.tiles ?? createForwardLookTiles()).map((tile, i) => {
          const def = GENERATED_FORWARD_TILES[i % GENERATED_FORWARD_TILES.length];
          return {
            ...tile,
            ...def,
            id: tile.id,
            iconKey: tile.iconKey,
          };
        }),
      };
    }

    const def = splitDefs[splitIdx % splitDefs.length];
    splitIdx += 1;
    return {
      ...section,
      title: def.title,
      chartType: def.chartType,
      prompt: def.prompt,
      chartCaption: def.chartCaption,
      chartTitle: def.chartTitle,
      stat: def.stat,
      statLabel: def.statLabel,
      body: def.body,
      bullets: def.bullets,
      chartData: def.chartData,
    };
  });

  return {
    ...report,
    creationMode: 'master_prompt',
    masterPrompt: prompt,
    reportContext: prompt,
    kpiTiles,
    sections,
    updatedAt: formatDate(new Date()),
  };
}

function pickGeneratedSectionDef(section: ReportSection) {
  const byChart = GENERATED_SECTION_DEFS.find((d) => d.chartType === section.chartType);
  if (byChart) return byChart;
  const idx =
    Math.abs(
      [...(section.prompt || section.title || section.id)].reduce(
        (acc, ch) => acc + ch.charCodeAt(0),
        0,
      ),
    ) % GENERATED_SECTION_DEFS.length;
  return GENERATED_SECTION_DEFS[idx];
}

/** Re-draft a single section from its current prompt / chart type. */
export function regenerateSectionFromPrompt(section: ReportSection): ReportSection {
  if (section.layout === 'tile_grid') {
    return {
      ...section,
      tiles: (section.tiles ?? []).map((tile, i) =>
        regenerateKpiTileFromPrompt(tile, i),
      ),
    };
  }

  const def = pickGeneratedSectionDef(section);
  return {
    ...section,
    chartCaption: def.chartCaption,
    chartTitle: def.chartTitle,
    stat: def.stat,
    statLabel: def.statLabel,
    body: def.body,
    bullets: def.bullets,
    chartData: def.chartData,
  };
}

/** Re-draft a KPI / forward-look tile from its current prompt. */
export function regenerateKpiTileFromPrompt(
  tile: ReportKpiTile,
  salt = 0,
): ReportKpiTile {
  const pool = GENERATED_KPI_DEFS;
  const idx =
    (Math.abs(
      [...(tile.prompt || tile.label || tile.id)].reduce(
        (acc, ch) => acc + ch.charCodeAt(0),
        0,
      ),
    ) +
      salt) %
    pool.length;
  const def = pool[idx];
  return {
    ...tile,
    label: def.label,
    value: def.value,
    sub: def.sub,
  };
}

export type ReportPromptKind = 'section' | 'kpi' | 'forward_tile';

const CHART_PROMPT_GUIDANCE: Record<ReportChartType, string> = {
  auto: 'Choose the clearest visual for this question.',
  ranked_bars: 'Use a ranked bar chart of the top 8–10 items with USD or count labels.',
  stat_bar: 'Lead with one hero statistic, then supporting bars for comparison.',
  donut_split: 'Show the split as a donut, with the majority share called out.',
  treemap: 'Show composition as a treemap sized by value, with the largest cells labelled.',
  trend_line: 'Plot the series over time and call out inflection points.',
  single_stat: 'Surface one standout figure with a tight caption.',
};

function expandPromptIntent(draft: string): string {
  const trimmed = draft.trim().replace(/\s+/g, ' ');
  const core = trimmed.replace(/[?!.]+$/, '');
  const lower = core.toLowerCase();

  if (/^(why|what|where|which|how|who|when)\b/.test(lower)) {
    if (lower.startsWith('why ')) return `explain ${core.slice(4)}, with the main drivers and share of the total`;
    if (lower.startsWith('what ')) return `identify ${core.slice(5)}, with the key figures behind it`;
    if (lower.startsWith('where ')) return `show where ${core.slice(6)}, ranked by magnitude`;
    if (lower.startsWith('which ')) return `identify which ${core.slice(6)}, with a ranked comparison`;
    if (lower.startsWith('how ')) return `analyse how ${core.slice(4)}, with evidence from the attached sources`;
    if (lower.startsWith('who ')) return `identify who ${core.slice(4)}, ranked by contribution`;
    if (lower.startsWith('when ')) return `show when ${core.slice(5)}, as a time series with notable shifts`;
  }

  if (
    /^(summarise|summarize|rank|show|compare|analyse|analyze|explain|list|flag|highlight|measure|surface|break down|map)\b/i.test(
      core,
    )
  ) {
    return core.charAt(0).toLowerCase() + core.slice(1);
  }

  return `analyse ${core}, with the key figures, rankings, and a short briefing`;
}

/** Expand a short user note into a full section or tile prompt. */
export function refineReportPrompt(input: {
  draft: string;
  kind: ReportPromptKind;
  title?: string;
  chartType?: ReportChartType;
}): string {
  const draft = input.draft.trim();
  if (!draft) return draft;
  if (/^using attached sources/i.test(draft) && /stay grounded in the attached data/i.test(draft)) {
    return draft;
  }

  const intent = expandPromptIntent(draft);
  const title = input.title?.trim();
  const titleClause = input.kind === 'section' && title ? ` for the section “${title}”` : '';

  if (input.kind === 'section') {
    const chartType = input.chartType ?? 'auto';
    const visual = CHART_PROMPT_GUIDANCE[chartType];
    return [
      `Using attached sources${titleClause}, ${intent}.`,
      `Visual: ${visual}`,
      'Output a headline takeaway, 2–3 sentences of analysis, and 3 evidence bullets with USD or counts where available. Stay grounded in the attached data — do not invent figures.',
    ].join('\n\n');
  }

  return [
    `Using attached sources, ${intent}.`,
    'Output a concise KPI: a short label, a primary value (USD, count, or %), and a one-line caption with the comparison or period. Stay grounded in the attached data — do not invent figures.',
  ].join('\n\n');
}