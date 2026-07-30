import { DollarSign, Landmark, LayoutGrid, Users, type LucideIcon } from 'lucide-react';
import { getReportThemeTokens } from './reportThemeTokens';
import {
  loadManagedReports,
  type ReportCatalogId,
} from './reportsAdminMock';

export interface ReportsHubCard {
  id: string;
  title: string;
  description: string;
  IconComponent: LucideIcon;
  iconBg: string;
  iconColor: string;
  /** Hex overrides when theme tokens are used for custom reports */
  iconBgHex?: string;
  iconColorHex?: string;
  available: boolean;
  /** Present for the three built-in thematic reports */
  catalogId?: ReportCatalogId;
}

const CATALOG_CARD_META: Record<
  ReportCatalogId,
  {
    IconComponent: LucideIcon;
    iconBg: string;
    iconColor: string;
  }
> = {
  'aid-flow': {
    IconComponent: DollarSign,
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
  },
  'migration-displacement': {
    IconComponent: Users,
    iconBg: 'bg-chart-3/10',
    iconColor: 'text-chart-3',
  },
  'somalia-joint-fund': {
    IconComponent: Landmark,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-700',
  },
};

function customCardMeta(themeId: string): Pick<
  ReportsHubCard,
  'IconComponent' | 'iconBg' | 'iconColor' | 'iconBgHex' | 'iconColorHex'
> {
  const theme = getReportThemeTokens(themeId);
  return {
    IconComponent: theme.id === 'migration' ? Users : theme.id === 'sjf' ? Landmark : LayoutGrid,
    iconBg: 'bg-muted',
    iconColor: 'text-foreground',
    iconBgHex: theme.accentSubtle,
    iconColorHex: theme.accent,
  };
}

/**
 * Cards for the Reports hub / home preview.
 * Built-ins use catalogId as the stable hub id; custom published reports use managed id.
 */
export function buildReportsHubCards(): ReportsHubCard[] {
  const managed = loadManagedReports();
  const cards: ReportsHubCard[] = [];

  for (const report of managed) {
    if (report.catalogId) {
      const meta = CATALOG_CARD_META[report.catalogId];
      cards.push({
        id: report.catalogId,
        catalogId: report.catalogId,
        title: report.title,
        description: report.description,
        IconComponent: meta.IconComponent,
        iconBg: meta.iconBg,
        iconColor: meta.iconColor,
        available: report.status === 'published',
      });
      continue;
    }

    if (report.status !== 'published') continue;

    const meta = customCardMeta(report.themeId);
    cards.push({
      id: report.id,
      title: report.title,
      description: report.description,
      IconComponent: meta.IconComponent,
      iconBg: meta.iconBg,
      iconColor: meta.iconColor,
      iconBgHex: meta.iconBgHex,
      iconColorHex: meta.iconColorHex,
      available: true,
    });
  }

  return cards;
}

export function isBuiltinHubReportId(id: string): id is ReportCatalogId {
  return id === 'aid-flow' || id === 'migration-displacement' || id === 'somalia-joint-fund';
}

/** Map hub card id → Reports detail view key for built-ins. */
export function hubIdToActiveBuiltinReport(
  id: string,
): 'aid-flow' | 'migration-data' | 'somalia-joint-fund' | null {
  if (id === 'aid-flow') return 'aid-flow';
  if (id === 'migration-displacement') return 'migration-data';
  if (id === 'somalia-joint-fund') return 'somalia-joint-fund';
  return null;
}
