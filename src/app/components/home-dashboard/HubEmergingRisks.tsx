import type { KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { HUB_PREDICTIVE_INSIGHTS } from '../../data/homeDashboardMock';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import {
  buildHubPredictiveInsightChatPayload,
  dashboardCardClass,
} from '../../utils/dashboardChatContext';

interface HubPredictiveInsightsProps {
  onOpenChat: (payload: DashboardChatPayload) => void;
}

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

function PredictiveInsightCard({
  insight,
  onOpenChat,
}: {
  insight: (typeof HUB_PREDICTIVE_INSIGHTS)[number];
  onOpenChat: (payload: DashboardChatPayload) => void;
}) {
  const open = () => onOpenChat(buildHubPredictiveInsightChatPayload(insight));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      style={{ background: insight.background }}
      className={`relative flex flex-col rounded-2xl border ${insight.borderClass} p-5 sm:p-6 text-white overflow-hidden min-h-[220px] text-left group ${dashboardCardClass.gradient}`}
    >
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-card/10 blur-2xl pointer-events-none"
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-white/90 relative">
        {insight.theme} · {insight.horizon}
      </p>
      <h3 className="text-base sm:text-base font-bold leading-snug mt-3 relative">{insight.title}</h3>
      <p className="text-sm leading-relaxed text-white/90 mt-2 flex-1 relative">
        {insight.description}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-white/20 text-xs text-white/85 relative">
        {insight.footer.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
      <ChevronRight
        size={18}
        className="absolute bottom-5 right-5 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
    </div>
  );
}

/** Humanity Hub home — predictive aid, climate, and displacement cards. */
export function HubEmergingRisks({ onOpenChat }: HubPredictiveInsightsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <h2 className="text-base font-bold text-foreground">Predictive insights</h2>
        <p className="text-sm text-muted-foreground">
          Forecasts from cluster reports, displacement tracking, food security data, and funding · next 30 days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HUB_PREDICTIVE_INSIGHTS.map((insight) => (
          <PredictiveInsightCard key={insight.id} insight={insight} onOpenChat={onOpenChat} />
        ))}
      </div>
    </div>
  );
}
