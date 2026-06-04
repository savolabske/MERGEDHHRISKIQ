import { DASHBOARD_BRIEFING } from '../../data/dashboardMock';
import { HUB_MAIN_INSIGHT } from '../../data/homeDashboardMock';
import { CURRENT_USER } from '../../utils/mockUsers';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import { RiskIntelligenceSummaryCard } from './RiskIntelligenceSummaryCard';

type HeroVariant = 'risk' | 'hub';

interface DashboardHeroSectionProps {
  variant?: HeroVariant;
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
}

/** Greeting row + summary card — Risk IQ dashboard (risk) or Humanity Hub home (hub). */
export function DashboardHeroSection({
  variant = 'risk',
  onOpenChat,
  onOpenBriefing,
}: DashboardHeroSectionProps) {
  const firstName = CURRENT_USER.name.split(' ')[0];

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
            {variant === 'hub'
              ? HUB_MAIN_INSIGHT.subtitle
              : `Here's your risk intelligence briefing for ${DASHBOARD_BRIEFING.country}.`}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shrink-0">
          <span className="w-2 h-2 rounded-full bg-success" aria-hidden />
          <span>
            Last sync <span className="font-semibold text-foreground">{DASHBOARD_BRIEFING.lastSync}</span>
          </span>
        </div>
      </div>

      <RiskIntelligenceSummaryCard
        variant={variant}
        onOpenChat={onOpenChat}
        onOpenBriefing={onOpenBriefing}
      />
    </>
  );
}
