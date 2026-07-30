import { HUB_REPORT_HIGHLIGHTS } from './homeDashboardMock';
import {
  buildReportsHubCards,
} from './reportsHubCatalog';
import {
  loadReportsHubPreferences,
  partitionReportsByPreferences,
  REPORTS_HUB_LAYOUT_CHANGED_EVENT,
} from './reportsHubPreferences';
import { MANAGED_REPORTS_CHANGED_EVENT } from './reportsAdminMock';

export const HOME_REPORTS_PREVIEW_LIMIT = 3;

export const HOME_REPORTS_PREVIEW_CHANGED_EVENTS = [
  REPORTS_HUB_LAYOUT_CHANGED_EVENT,
  MANAGED_REPORTS_CHANGED_EVENT,
] as const;

export interface HomeReportPreview {
  id: string;
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  summary: string;
  available: boolean;
  iconBg?: string;
  iconColor?: string;
  iconBgHex?: string;
  iconColorHex?: string;
  IconName?: 'aid-flow' | 'migration-displacement' | 'somalia-joint-fund' | 'custom';
}

export interface HomeReportsPreviewResult {
  reports: HomeReportPreview[];
  remainingCount: number;
  totalVisible: number;
}

const TEASER_BY_ID = Object.fromEntries(
  HUB_REPORT_HIGHLIGHTS.map((teaser) => [teaser.id, teaser]),
) as Record<string, (typeof HUB_REPORT_HIGHLIGHTS)[number]>;

/** Visible hub reports in customize order, capped for the home teaser row. */
export function getHomeReportsPreview(
  limit = HOME_REPORTS_PREVIEW_LIMIT,
): HomeReportsPreviewResult {
  const prefs = loadReportsHubPreferences();
  const cards = buildReportsHubCards();
  const { visible } = partitionReportsByPreferences(cards, prefs);
  const reports = visible.slice(0, Math.max(0, limit)).map((card) => {
    const teaser = TEASER_BY_ID[card.id];
    const iconName =
      card.catalogId === 'aid-flow' ||
      card.catalogId === 'migration-displacement' ||
      card.catalogId === 'somalia-joint-fund'
        ? card.catalogId
        : ('custom' as const);

    return {
      id: card.id,
      title: card.title,
      description: card.description,
      metric: teaser?.metric,
      metricLabel: teaser?.metricLabel,
      summary: teaser?.summary ?? card.description,
      available: card.available,
      iconBg: card.iconBg,
      iconColor: card.iconColor,
      iconBgHex: card.iconBgHex,
      iconColorHex: card.iconColorHex,
      IconName: iconName,
    };
  });

  return {
    reports,
    remainingCount: Math.max(0, visible.length - reports.length),
    totalVisible: visible.length,
  };
}
