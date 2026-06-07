import type { AppView } from '../types/navigation';
import type { DashboardChatPayload } from '../utils/dashboardChatContext';
import { DashboardHeroSection } from './dashboard/DashboardHeroSection';
import { HubEmergingRisks } from './home-dashboard/HubEmergingRisks';
import { HubHumanitarianSnapshot } from './home-dashboard/HubHumanitarianSnapshot';
import { HubSearchRow } from './home-dashboard/HubSearchRow';
import { HubReportsSection } from './home-dashboard/HubReportsSection';
import type { HubReportHighlightId } from '../data/homeDashboardMock';
import { PageScrollShell } from './PageScrollShell';

interface HomeDashboardProps {
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
  onNavigate: (view: AppView) => void;
  onSearch: (query: string) => void;
  onOpenDocument?: (documentId: string) => void;
  onOpenReport?: (reportId: HubReportHighlightId) => void;
}

export function HomeDashboard({
  onOpenChat,
  onOpenBriefing,
  onNavigate,
  onSearch,
  onOpenDocument,
  onOpenReport,
}: HomeDashboardProps) {
  return (
    <PageScrollShell innerClassName="space-y-6">
            <DashboardHeroSection
              variant="hub"
              onOpenChat={onOpenChat}
              onOpenBriefing={onOpenBriefing}
            />

            <HubSearchRow onSearch={onSearch} onOpenChat={onOpenChat} />

            <HubEmergingRisks onOpenChat={onOpenChat} />

            <HubHumanitarianSnapshot />

            <HubReportsSection
              onOpenReport={(id) =>
                onOpenReport ? onOpenReport(id) : onNavigate('reports')
              }
            />
    </PageScrollShell>
  );
}
