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

export interface ReportKpiTile {
  id: string;
  prompt: string;
  iconKey: KpiIconKey;
}

export interface ReportSection {
  id: string;
  order: number;
  title: string;
  layout: ReportSectionLayout;
  chartType: ReportChartType;
  prompt: string;
  tiles?: ReportKpiTile[];
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
  /** Linked admin resource used as AI knowledge for this report */
  resourceId?: string;
}

export function hasLinkedKnowledgeSources(report: ManagedReport): boolean {
  if (report.resourceId) return true;
  return Boolean(report.catalogId);
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
  return BUILTIN_REPORT_DEFINITIONS.map((def) => createBuiltinManagedReport(def.catalogId));
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
    reportContext: '',
    status: 'draft',
    themeId: 'aid_flow',
    userGroups: input.userGroups,
    resourceId: input.resourceId,
    kpiTiles: createKpiTiles(),
    sections,
    createdAt: dateStr,
    updatedAt: dateStr,
  };
}

export const INITIAL_MANAGED_REPORTS: ManagedReport[] = buildInitialManagedReports();
