import { useEffect, useMemo } from 'react';
import type { AppView } from '../types/navigation';
import {
  resolveEmergingInsights,
  resolveMainInsightBody,
  resolvePredictiveInsights,
} from '../data/homeDashboardCustomize';
import type { HubReportHighlightId } from '../data/homeDashboardMock';
import { useHomeDashboardCustomize } from '../hooks/useHomeDashboardCustomize';
import type { DashboardChatPayload } from '../utils/dashboardChatContext';
import { DashboardHeroSection } from './dashboard/DashboardHeroSection';
import { DashboardCustomizeBanner } from './home-dashboard/HomeDashboardCustomizeBanner';
import { DashboardEditableSection } from './home-dashboard/HomeEditableSection';
import { HubEmergingRisks } from './home-dashboard/HubEmergingRisks';
import { HubHumanitarianSnapshot } from './home-dashboard/HubHumanitarianSnapshot';
import { HubKeyInsightsCard } from './home-dashboard/HubKeyInsightsCard';
import { HubSearchRow } from './home-dashboard/HubSearchRow';
import { HubReportsSection } from './home-dashboard/HubReportsSection';
import { DashboardSectionEditPanel } from './home-dashboard/HomeSectionEditPanel';
import { PageScrollShell } from './PageScrollShell';
import { cn } from './ui/utils';

interface HomeDashboardProps {
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
  onNavigate: (view: AppView) => void;
  onSearch: (query: string, options?: { extendedKnowledge?: boolean; privateToMe?: boolean }) => void;
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
  const customize = useHomeDashboardCustomize();

  const mainInsightBody = useMemo(
    () => resolveMainInsightBody('main-insight', customize.savedPrompts),
    [customize.savedPrompts],
  );
  const emergingInsights = useMemo(
    () => resolveEmergingInsights('emerging-insights', customize.savedPrompts),
    [customize.savedPrompts],
  );
  const predictiveInsights = useMemo(
    () => resolvePredictiveInsights('predictive-insights', customize.savedPrompts),
    [customize.savedPrompts],
  );

  const handleToggleCustomize = () => {
    if (customize.isCustomizing) {
      customize.stopCustomizing();
      return;
    }
    customize.startCustomizing();
  };

  useEffect(() => {
    if (!customize.editingSection) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        customize.closeSectionEditor();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [customize.editingSection, customize.closeSectionEditor]);

  return (
    <>
      <PageScrollShell
        innerClassName={cn(
          'space-y-6 transition-[margin] duration-300',
          customize.isPanelOpen && 'mr-0 lg:mr-[420px]',
        )}
      >
        <DashboardHeroSection
          variant="hub"
          mainInsightBody={mainInsightBody}
          summarySectionId="main-insight"
          isCustomizing={customize.isCustomizing}
          editingSection={customize.editingSection}
          isSummaryRegenerating={customize.isSectionRegenerating('main-insight')}
          onEditSection={customize.openSectionEditor}
          onToggleCustomize={handleToggleCustomize}
          customizeBanner={
            customize.isCustomizing ? <DashboardCustomizeBanner /> : undefined
          }
          onOpenChat={onOpenChat}
          onOpenBriefing={onOpenBriefing}
        />

        <HubSearchRow
          onSearch={onSearch}
          onOpenChat={onOpenChat}
          emergingInsightsSlot={
            <DashboardEditableSection
              sectionId="emerging-insights"
              isCustomizing={customize.isCustomizing}
              isActive={customize.editingSection === 'emerging-insights'}
              isRegenerating={customize.isSectionRegenerating('emerging-insights')}
              onEdit={customize.openSectionEditor}
            >
              <HubKeyInsightsCard
                insights={emergingInsights}
                interactive={!customize.isCustomizing}
                onOpenChat={onOpenChat}
              />
            </DashboardEditableSection>
          }
        />

        <DashboardEditableSection
          sectionId="predictive-insights"
          isCustomizing={customize.isCustomizing}
          isActive={customize.editingSection === 'predictive-insights'}
          isRegenerating={customize.isSectionRegenerating('predictive-insights')}
          onEdit={customize.openSectionEditor}
        >
          <HubEmergingRisks
            insights={predictiveInsights}
            interactive={!customize.isCustomizing}
            onOpenChat={onOpenChat}
          />
        </DashboardEditableSection>

        <HubHumanitarianSnapshot />

        <HubReportsSection
          onOpenReport={(id) =>
            onOpenReport ? onOpenReport(id) : onNavigate('reports')
          }
        />
      </PageScrollShell>

      {customize.editingSection && (
        <>
          <button
            type="button"
            aria-label="Close edit panel"
            className="fixed inset-0 z-[1340] bg-black/20 lg:hidden"
            onClick={() => customize.closeSectionEditor()}
          />
          <DashboardSectionEditPanel
            sections={customize.sections}
            sectionId={customize.editingSection}
            draftPrompt={customize.draftPrompt}
            isDirty={customize.isDraftDirty}
            isSaving={customize.isSaving}
            getDefaultPrompt={customize.getDefaultPrompt}
            promptDiffersFromDefault={customize.promptDiffersFromDefault}
            onDraftChange={customize.setDraftPrompt}
            onResetDraft={customize.resetDraftToDefault}
            onCancel={() => customize.closeSectionEditor()}
            onSave={() => void customize.saveSectionPrompt()}
            onClose={() => customize.closeSectionEditor()}
          />
        </>
      )}
    </>
  );
}
