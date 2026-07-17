import type { ReactNode } from 'react';
import { Check, Pencil } from 'lucide-react';
import { DASHBOARD_BRIEFING } from '../../data/dashboardMock';
import type { HubMainInsightBody } from '../../data/homeDashboardCustomize';
import type { RiskSummaryBody } from '../../data/riskDashboardCustomize';
import { HUB_MAIN_INSIGHT } from '../../data/homeDashboardMock';
import { CURRENT_USER } from '../../utils/mockUsers';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import { Button } from '../ui/button';
import { DashboardEditableSection } from '../home-dashboard/HomeEditableSection';
import { RiskIntelligenceSummaryCard } from './RiskIntelligenceSummaryCard';

type HeroVariant = 'risk' | 'hub';

interface DashboardHeroSectionProps {
  variant?: HeroVariant;
  mainInsightBody?: HubMainInsightBody;
  riskSummaryBody?: RiskSummaryBody;
  summarySectionId?: string;
  isCustomizing?: boolean;
  editingSection?: string | null;
  isSummaryRegenerating?: boolean;
  onEditSection?: (sectionId: string) => void;
  onToggleCustomize?: () => void;
  customizeBanner?: ReactNode;
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
}

/** Greeting row + summary card — Risk IQ dashboard (risk) or Humanity Hub home (hub). */
export function DashboardHeroSection({
  variant = 'risk',
  mainInsightBody,
  riskSummaryBody,
  summarySectionId,
  isCustomizing = false,
  editingSection = null,
  isSummaryRegenerating = false,
  onEditSection,
  onToggleCustomize,
  customizeBanner,
  onOpenChat,
  onOpenBriefing,
}: DashboardHeroSectionProps) {
  const firstName = CURRENT_USER.name.split(' ')[0];
  const isHub = variant === 'hub';

  const summaryCard = (
    <RiskIntelligenceSummaryCard
      variant={variant}
      mainInsightBody={mainInsightBody}
      riskSummaryBody={riskSummaryBody}
      interactive={!isCustomizing}
      onOpenChat={onOpenChat}
      onOpenBriefing={onOpenBriefing}
    />
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Hey, {firstName}{' '}
            <span className="wave-hand" aria-hidden>
              👋
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isHub
              ? HUB_MAIN_INSIGHT.subtitle
              : `Here's your risk intelligence briefing for ${DASHBOARD_BRIEFING.country}.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-success" aria-hidden />
            <span>
              Last sync{' '}
              <span className="font-semibold text-foreground">{DASHBOARD_BRIEFING.lastSync}</span>
            </span>
          </div>
          {onToggleCustomize && (
            <Button
              type="button"
              size="sm"
              variant={isCustomizing ? 'default' : 'outline'}
              onClick={onToggleCustomize}
              className="rounded-full"
            >
              {isCustomizing ? (
                <>
                  <Check size={14} strokeWidth={2.5} aria-hidden />
                  Done customizing
                </>
              ) : (
                <>
                  <Pencil size={14} strokeWidth={2.25} aria-hidden />
                  Customize
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {customizeBanner && <div className="mt-4">{customizeBanner}</div>}

      <div className={customizeBanner ? 'mt-4' : undefined}>
        {summarySectionId && onEditSection ? (
          <DashboardEditableSection
            sectionId={summarySectionId}
            isCustomizing={isCustomizing}
            isActive={editingSection === summarySectionId}
            isRegenerating={isSummaryRegenerating}
            onEdit={onEditSection}
          >
            {summaryCard}
          </DashboardEditableSection>
        ) : (
          summaryCard
        )}
      </div>
    </>
  );
}
