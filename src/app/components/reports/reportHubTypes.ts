import type { DollarSign } from 'lucide-react';
import type { ReportCatalogId } from '../../data/reportsAdminMock';

export interface ReportHubCardData {
  id: ReportCatalogId;
  title: string;
  description: string;
  IconComponent: typeof DollarSign;
  iconBg: string;
  iconColor: string;
  available?: boolean;
}
