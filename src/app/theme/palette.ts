/**
 * Central color palette for charts, ADT categories, and status indicators.
 * ADT hues are intentionally distinct — not mapped to chart-1…chart-5.
 */

export const palette = {
  primary: 'var(--primary)',
  primaryHover: 'var(--primary-hover)',
  primarySubtle: 'var(--primary-subtle)',
  primaryText: 'var(--primary-text)',

  background: 'var(--background)',
  foreground: 'var(--foreground)',
  foregroundEmphasis: 'var(--foreground-emphasis)',
  muted: 'var(--muted)',
  mutedForeground: 'var(--muted-foreground)',
  textSubtle: 'var(--text-subtle)',
  border: 'var(--border)',
  borderMuted: 'var(--border-muted)',
  surfaceSubtle: 'var(--surface-subtle)',
  card: 'var(--card)',

  success: 'var(--success)',
  successSubtle: 'var(--success-subtle)',
  successText: 'var(--success-text)',

  warning: 'var(--warning)',
  warningSubtle: 'var(--warning-subtle)',
  warningText: 'var(--warning-text)',
  warningStrong: 'var(--warning-strong)',

  destructive: 'var(--destructive)',
  destructiveSubtle: 'var(--destructive-subtle)',
  destructiveText: 'var(--destructive-text)',

  info: 'var(--info)',
  infoSubtle: 'var(--info-subtle)',

  sidebarAccent: 'var(--sidebar-accent)',
  sidebarAccentForeground: 'var(--sidebar-accent-foreground)',

  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',

  gradientSummaryStart: 'var(--gradient-summary-start)',
  gradientSummaryEnd: 'var(--gradient-summary-end)',
} as const;

/** ADT category colors — 7 distinct hues (unchanged visually) */
export const adtCategoryColors = {
  economicExtortion: 'var(--warning-strong)',
  improperInfluence: '#60a5fa',
  preventionOfDelivery: 'var(--chart-3)',
  theftDamage: 'var(--success)',
  unethicalBehaviour: '#1e40af',
  finance: '#059669',
  aidSoldInMarket: 'var(--secondary-foreground)',
} as const;

export const adtAccent = palette.primary;
export const adtAccentBg = palette.primarySubtle;

export const statusColors = {
  success: palette.success,
  successBg: palette.successSubtle,
  successText: palette.successText,
  warning: palette.warning,
  warningBg: palette.warningSubtle,
  warningText: palette.warningText,
  error: palette.destructive,
  errorBg: palette.destructiveSubtle,
  errorText: palette.destructiveText,
  info: palette.info,
  infoBg: palette.infoSubtle,
  pending: palette.warning,
  processing: palette.primary,
} as const;
