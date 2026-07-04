import type { ReportCatalogId, ReportThemeId } from './reportsAdminMock';

/** Full visual tokens applied across the report builder (and future generated view). */
export interface ReportThemeTokens {
  id: ReportThemeId;
  label: string;
  /** Page canvas behind all cards */
  pageBg: string;
  pageBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Primary brand — filters, step labels, key stats, primary chart series */
  accent: string;
  accentDark: string;
  accentSubtle: string;
  accentBorder: string;
  cardBg: string;
  cardBorder: string;
  /** Six KPI tile accent dots (top-right), matched to live report KPI cards */
  kpiAccents: [string, string, string, string, string, string];
  /** Six KPI icon container backgrounds */
  kpiIconBgs: [string, string, string, string, string, string];
  /** Six KPI icon foreground colors */
  kpiIconColors: [string, string, string, string, string, string];
  /** Default chart bar / series colors */
  chartPrimary: string;
  chartSecondary: string;
  chartTertiary: string;
  chartMuted: string;
  /** Full palette for treemap, donut segments, ranked bars */
  chartPalette: string[];
  sectionStep: string;
  sectionStat: string;
  forwardLookBg: string;
  forwardLookBorder: string;
  forwardLookTileBg: string;
  isDark: boolean;
}

const AID_FLOW: ReportThemeTokens = {
  id: 'aid_flow',
  label: 'Aid Flow',
  pageBg: '#f6f7f9',
  pageBorder: '#e6e9ef',
  textPrimary: '#0d1b2a',
  textSecondary: '#3a4a5c',
  textMuted: '#6b7a8d',
  accent: '#1f6feb',
  accentDark: '#1550b3',
  accentSubtle: '#eaf1fe',
  accentBorder: '#2a7fe0',
  cardBg: '#ffffff',
  cardBorder: '#e6e9ef',
  kpiAccents: ['#1f6feb', '#3fa85a', '#2a7fe0', '#9b59b6', '#ef6c2e', '#c97a2a'],
  kpiIconBgs: ['#eaf1fe', '#eafaf0', '#eef4ff', '#f3eefe', '#fdeeea', '#fdeeea'],
  kpiIconColors: ['#1f6feb', '#3fa85a', '#2a7fe0', '#9b59b6', '#ef6c2e', '#c97a2a'],
  chartPrimary: '#1f6feb',
  chartSecondary: '#3fa85a',
  chartTertiary: '#2a7fe0',
  chartMuted: '#9aa6b2',
  chartPalette: ['#1f6feb', '#3fa85a', '#2a7fe0', '#ef6c2e', '#9b59b6', '#16a39a', '#d8413c', '#9aa6b2'],
  sectionStep: '#1f6feb',
  sectionStat: '#1f6feb',
  forwardLookBg: '#0d1b2a',
  forwardLookBorder: '#1e293b',
  forwardLookTileBg: 'rgba(255,255,255,0.05)',
  isDark: false,
};

const MIGRATION: ReportThemeTokens = {
  id: 'migration',
  label: 'Migration',
  pageBg: '#f7f4ef',
  pageBorder: '#ece6df',
  textPrimary: '#1a1410',
  textSecondary: '#4a3f38',
  textMuted: '#8a7d72',
  accent: '#c2562a',
  accentDark: '#a3461f',
  accentSubtle: '#fbeee5',
  accentBorder: '#d8b9a2',
  cardBg: '#ffffff',
  cardBorder: '#ece6df',
  kpiAccents: ['#c2562a', '#1f7a6e', '#d98324', '#d99a21', '#c2562a', '#b23a2e'],
  kpiIconBgs: ['#fbeee5', '#e7f3f1', '#fbeede', '#fdf3df', '#fbeee5', '#fbe6e3'],
  kpiIconColors: ['#c2562a', '#1f7a6e', '#d98324', '#d99a21', '#c2562a', '#b23a2e'],
  chartPrimary: '#c2562a',
  chartSecondary: '#1f7a6e',
  chartTertiary: '#d98324',
  chartMuted: '#9a8f86',
  chartPalette: ['#d98324', '#b23a2e', '#2f7fb5', '#1f7a6e', '#d99a21', '#7a6a8a', '#c2562a', '#9a8f86'],
  sectionStep: '#c2562a',
  sectionStat: '#c2562a',
  forwardLookBg: '#1a1410',
  forwardLookBorder: '#4a3f38',
  forwardLookTileBg: 'rgba(255,255,255,0.06)',
  isDark: false,
};

const SJF: ReportThemeTokens = {
  id: 'sjf',
  label: 'Joint Fund',
  pageBg: '#f4f6fa',
  pageBorder: '#e2e6ee',
  textPrimary: '#0b1a2c',
  textSecondary: '#324559',
  textMuted: '#6f8094',
  accent: '#00689D',
  accentDark: '#19486A',
  accentSubtle: '#E5F3FB',
  accentBorder: '#B8D9EE',
  cardBg: '#ffffff',
  cardBorder: '#e2e6ee',
  kpiAccents: ['#00689D', '#19486A', '#FD6925', '#DD1367', '#DDA63A', '#0A97D9'],
  kpiIconBgs: ['#E5F3FB', '#ecf2f8', '#fff0e8', '#fce8f0', '#fdf6e3', '#e8f6fc'],
  kpiIconColors: ['#00689D', '#19486A', '#FD6925', '#DD1367', '#DDA63A', '#0A97D9'],
  chartPrimary: '#00689D',
  chartSecondary: '#19486A',
  chartTertiary: '#0A97D9',
  chartMuted: '#6f8094',
  chartPalette: ['#00689D', '#19486A', '#DD1367', '#DDA63A', '#FD6925', '#0A97D9', '#6f8094', '#C5E0F1'],
  sectionStep: '#00689D',
  sectionStat: '#00689D',
  forwardLookBg: '#19486A',
  forwardLookBorder: '#00689D',
  forwardLookTileBg: 'rgba(255,255,255,0.08)',
  isDark: false,
};

const SLATE: ReportThemeTokens = {
  ...AID_FLOW,
  id: 'slate',
  label: 'Slate',
  pageBg: '#f1f5f9',
  pageBorder: '#e2e8f0',
  accent: '#475569',
  accentDark: '#334155',
  accentSubtle: '#f1f5f9',
  accentBorder: '#64748b',
  cardBorder: '#e2e8f0',
  kpiAccents: ['#475569', '#64748b', '#94a3b8', '#334155', '#78716c', '#57534e'],
  kpiIconBgs: ['#f1f5f9', '#f8fafc', '#e2e8f0', '#f1f5f9', '#fafaf9', '#f5f5f4'],
  kpiIconColors: ['#475569', '#64748b', '#94a3b8', '#334155', '#78716c', '#57534e'],
  chartPrimary: '#475569',
  chartSecondary: '#64748b',
  chartTertiary: '#94a3b8',
  chartPalette: ['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#78716c', '#57534e', '#334155', '#e2e8f0'],
  sectionStep: '#475569',
  sectionStat: '#475569',
};

const FOREST: ReportThemeTokens = {
  ...AID_FLOW,
  id: 'forest',
  label: 'Forest',
  pageBg: '#f0fdf4',
  pageBorder: '#dcfce7',
  accent: '#16a34a',
  accentDark: '#15803d',
  accentSubtle: '#f0fdf4',
  accentBorder: '#86efac',
  cardBorder: '#bbf7d0',
  kpiAccents: ['#16a34a', '#059669', '#84cc16', '#65a30d', '#0d9488', '#14b8a6'],
  kpiIconBgs: ['#f0fdf4', '#ecfdf5', '#f7fee7', '#f7fee7', '#f0fdfa', '#f0fdfa'],
  kpiIconColors: ['#16a34a', '#059669', '#84cc16', '#65a30d', '#0d9488', '#14b8a6'],
  chartPrimary: '#16a34a',
  chartSecondary: '#059669',
  chartTertiary: '#84cc16',
  chartPalette: ['#16a34a', '#059669', '#84cc16', '#65a30d', '#0d9488', '#14b8a6', '#22c55e', '#bbf7d0'],
  sectionStep: '#16a34a',
  sectionStat: '#16a34a',
};

const AMBER_FIELD: ReportThemeTokens = {
  ...MIGRATION,
  id: 'amber_field',
  label: 'Amber Field',
  pageBg: '#fffbeb',
  pageBorder: '#fde68a',
  accent: '#b45309',
  accentDark: '#92400e',
  accentSubtle: '#fffbeb',
  accentBorder: '#fbbf24',
  cardBorder: '#fde68a',
  kpiAccents: ['#b45309', '#d97706', '#f59e0b', '#ca8a04', '#a16207', '#78350f'],
  kpiIconBgs: ['#fffbeb', '#fef3c7', '#fef9c3', '#fef9c3', '#fff7ed', '#fef3c7'],
  kpiIconColors: ['#b45309', '#d97706', '#f59e0b', '#ca8a04', '#a16207', '#78350f'],
  chartPrimary: '#b45309',
  chartSecondary: '#d97706',
  chartTertiary: '#f59e0b',
  chartPalette: ['#b45309', '#d97706', '#f59e0b', '#ca8a04', '#a16207', '#78350f', '#fde68a', '#fef3c7'],
  sectionStep: '#b45309',
  sectionStat: '#b45309',
};

const PLUM: ReportThemeTokens = {
  ...AID_FLOW,
  id: 'plum',
  label: 'Plum',
  pageBg: '#faf5ff',
  pageBorder: '#e9d5ff',
  accent: '#7c3aed',
  accentDark: '#6d28d9',
  accentSubtle: '#faf5ff',
  accentBorder: '#c4b5fd',
  cardBorder: '#e9d5ff',
  kpiAccents: ['#7c3aed', '#9333ea', '#a855f7', '#c026d3', '#db2777', '#6d28d9'],
  kpiIconBgs: ['#faf5ff', '#f3e8ff', '#faf5ff', '#fdf4ff', '#fdf2f8', '#f5f3ff'],
  kpiIconColors: ['#7c3aed', '#9333ea', '#a855f7', '#c026d3', '#db2777', '#6d28d9'],
  chartPrimary: '#7c3aed',
  chartSecondary: '#9333ea',
  chartTertiary: '#a855f7',
  chartPalette: ['#7c3aed', '#9333ea', '#a855f7', '#c026d3', '#db2777', '#6d28d9', '#e9d5ff', '#f3e8ff'],
  sectionStep: '#7c3aed',
  sectionStat: '#7c3aed',
};

const MIDNIGHT: ReportThemeTokens = {
  ...AID_FLOW,
  id: 'midnight',
  label: 'Midnight',
  pageBg: '#0f172a',
  pageBorder: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  accent: '#3b82f6',
  accentDark: '#2563eb',
  accentSubtle: 'rgba(59,130,246,0.15)',
  accentBorder: '#3b82f6',
  cardBg: '#1e293b',
  cardBorder: '#475569',
  kpiAccents: ['#3b82f6', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'],
  kpiIconBgs: ['rgba(59,130,246,0.2)', 'rgba(34,211,238,0.15)', 'rgba(167,139,250,0.2)', 'rgba(244,114,182,0.15)', 'rgba(251,191,36,0.15)', 'rgba(52,211,153,0.15)'],
  kpiIconColors: ['#60a5fa', '#22d3ee', '#c4b5fd', '#f9a8d4', '#fcd34d', '#6ee7b7'],
  chartPrimary: '#3b82f6',
  chartSecondary: '#22d3ee',
  chartTertiary: '#a78bfa',
  chartMuted: '#64748b',
  chartPalette: ['#3b82f6', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#64748b', '#475569'],
  sectionStep: '#60a5fa',
  sectionStat: '#60a5fa',
  forwardLookBg: '#020617',
  forwardLookBorder: '#334155',
  forwardLookTileBg: 'rgba(255,255,255,0.04)',
  isDark: true,
};

export const REPORT_THEME_TOKENS: Record<ReportThemeId, ReportThemeTokens> = {
  aid_flow: AID_FLOW,
  migration: MIGRATION,
  sjf: SJF,
  slate: SLATE,
  forest: FOREST,
  amber_field: AMBER_FIELD,
  plum: PLUM,
  midnight: MIDNIGHT,
};

export const REPORT_THEME_LIST: ReportThemeTokens[] = [
  AID_FLOW,
  MIGRATION,
  SJF,
  SLATE,
  FOREST,
  AMBER_FIELD,
  PLUM,
  MIDNIGHT,
];

export const CATALOG_DEFAULT_THEME: Record<ReportCatalogId, ReportThemeId> = {
  'aid-flow': 'aid_flow',
  'migration-displacement': 'migration',
  'somalia-joint-fund': 'sjf',
};

/** Legacy stored theme ids */
const THEME_ALIASES: Record<string, ReportThemeId> = {
  default: 'aid_flow',
};

export function resolveThemeId(themeId: string): ReportThemeId {
  if (themeId in REPORT_THEME_TOKENS) return themeId as ReportThemeId;
  return THEME_ALIASES[themeId] ?? 'aid_flow';
}

export function getReportThemeTokens(themeId: string): ReportThemeTokens {
  return REPORT_THEME_TOKENS[resolveThemeId(themeId)];
}
