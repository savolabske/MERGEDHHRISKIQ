import type { AppView } from '../types/navigation';
import type { DashboardChatPayload } from '../utils/dashboardChatContext';
import { DashboardBriefingSection } from './dashboard/DashboardBriefingSection';
import { DashboardHeroSection } from './dashboard/DashboardHeroSection';
import { HubEmergingRisks } from './home-dashboard/HubEmergingRisks';
import { HubHumanitarianSnapshot } from './home-dashboard/HubHumanitarianSnapshot';
import { HUB_BRIEFING_UPDATES } from '../data/homeDashboardMock';
import { buildHubBriefingUpdateChatPayload } from '../utils/dashboardChatContext';
import { HubSearchRow } from './home-dashboard/HubSearchRow';
import { HubReportsSection } from './home-dashboard/HubReportsSection';
import type { HubReportHighlightId } from '../data/homeDashboardMock';

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
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pt-6 pb-6">
          <div className="max-w-[1400px] mx-auto space-y-6">
            <DashboardHeroSection
              variant="hub"
              onOpenChat={onOpenChat}
              onOpenBriefing={onOpenBriefing}
            />

            <HubSearchRow onSearch={onSearch} onNavigate={onNavigate} onOpenDocument={onOpenDocument} />

            <HubHumanitarianSnapshot />

            <HubEmergingRisks onOpenChat={onOpenChat} />

            <DashboardBriefingSection
              onOpenChat={onOpenChat}
              title="Emerging insights"
              subtitle="Flagged from climate, funding, displacement, and accountability data in your workspace"
              updates={HUB_BRIEFING_UPDATES}
              buildUpdateChatPayload={buildHubBriefingUpdateChatPayload}
              hideDescription
            />

            <HubReportsSection
              onOpenReport={(id) =>
                onOpenReport ? onOpenReport(id) : onNavigate('reports')
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
