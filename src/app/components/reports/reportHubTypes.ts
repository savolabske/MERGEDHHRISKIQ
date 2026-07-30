import type { LucideIcon } from 'lucide-react';
import type { ReportCatalogId } from '../../data/reportsAdminMock';

export interface ReportHubCardData {
  id: string;
  title: string;
  description: string;
  IconComponent: LucideIcon;
  iconBg: string;
  iconColor: string;
  iconBgHex?: string;
  iconColorHex?: string;
  available?: boolean;
  catalogId?: ReportCatalogId;
}
