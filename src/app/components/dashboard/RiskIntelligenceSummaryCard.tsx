import type { KeyboardEvent, ReactNode } from 'react';
import { ChevronRight, Sparkles, Zap } from 'lucide-react';
import { DASHBOARD_BRIEFING } from '../../data/dashboardMock';
import type { HubMainInsightBody } from '../../data/homeDashboardCustomize';
import type { RiskSummaryBody } from '../../data/riskDashboardCustomize';
import { HUB_MAIN_INSIGHT } from '../../data/homeDashboardMock';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import {
  buildHubInsightChatPayload,
  buildSummaryChatPayload,
  dashboardCardClass,
} from '../../utils/dashboardChatContext';

const SUMMARY_CARD_BACKGROUND =
  'radial-gradient(120% 120% at 0% 0%, var(--chart-2) 0%, transparent 55%), radial-gradient(120% 100% at 100% 100%, var(--gradient-summary-start) 0%, transparent 60%), linear-gradient(135deg, var(--gradient-summary-start), var(--primary) 55%, var(--gradient-summary-end))';

const SUMMARY_CIRCLE_SHADOW =
  'inset 0 0 0 37px rgba(255, 255, 255, 0.04), 0 0 0 36px rgba(255, 255, 255, 0.04)';

function SummaryCardDecoration() {
  return (
    <div
      className="absolute rounded-full pointer-events-none box-border"
      style={{
        width: 360,
        height: 360,
        top: -104,
        right: -130,
        border: '1px solid rgba(255, 255, 255, 0.16)',
        background: 'transparent',
        boxShadow: SUMMARY_CIRCLE_SHADOW,
      }}
      aria-hidden
    />
  );
}

function Highlight({
  children,
  underline,
}: {
  children: ReactNode;
  underline: 'salmon' | 'white' | 'peach' | 'mint';
}) {
  const decorationClass =
    underline === 'salmon'
      ? 'decoration-destructive'
      : underline === 'white'
        ? 'decoration-white/90'
        : underline === 'peach'
          ? 'decoration-warning-strong'
          : 'decoration-success';

  return (
    <span
      className={`font-semibold underline underline-offset-[4px] decoration-2 ${decorationClass}`}
    >
      {children}
    </span>
  );
}

type SummaryCardVariant = 'risk' | 'hub';

interface RiskIntelligenceSummaryCardProps {
  variant?: SummaryCardVariant;
  mainInsightBody?: HubMainInsightBody;
  riskSummaryBody?: RiskSummaryBody;
  interactive?: boolean;
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
}

export function RiskIntelligenceSummaryCard({
  variant = 'risk',
  mainInsightBody,
  riskSummaryBody,
  interactive = true,
  onOpenChat,
  onOpenBriefing,
}: RiskIntelligenceSummaryCardProps) {
  const isHub = variant === 'hub';
  const hubBody = mainInsightBody ?? HUB_MAIN_INSIGHT.body;
  const riskBody = riskSummaryBody ?? {
    activeRisks: '247 active risks',
    region1: 'Lower Shabelle',
    region2: 'Banadir',
    drivers: 'Supply chain and security risks',
    criticalCases: '18 critical cases',
  };
  const openSummaryChat = () =>
    onOpenChat(isHub ? buildHubInsightChatPayload() : buildSummaryChatPayload());

  const onCardKeyDown = (e: KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSummaryChat();
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? openSummaryChat : undefined}
      onKeyDown={onCardKeyDown}
      className={`relative overflow-hidden rounded-2xl border border-white/20 p-6 sm:p-8 text-white shadow-sm text-left ${interactive ? dashboardCardClass.gradient : ''}`}
      style={{ background: SUMMARY_CARD_BACKGROUND }}
    >
      <SummaryCardDecoration />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-card/10 backdrop-blur-sm px-3 py-1 mb-5">
          {isHub ? (
            <Sparkles size={12} className="text-white shrink-0" strokeWidth={2.5} />
          ) : (
            <Zap size={12} className="text-white shrink-0" strokeWidth={2.5} />
          )}
          <span
            className={`text-xs font-semibold tracking-wider text-white ${isHub ? '' : 'uppercase'}`}
          >
            {isHub ? HUB_MAIN_INSIGHT.badge : 'Risk intelligence summary'}
          </span>
        </div>

        {isHub ? (
          <p className="text-xl leading-snug text-white font-semibold line-clamp-2 overflow-hidden">
            {hubBody.lead}{' '}
            <Highlight underline="salmon">{hubBody.foodInsecure}</Highlight> in{' '}
            <Highlight underline="white">{hubBody.regions}</Highlight>{' '}
            {hubBody.into}{' '}
            <Highlight underline="peach">{hubBody.idpSites}</Highlight> arrivals rose{' '}
            <Highlight underline="mint">{hubBody.displacementChange}</Highlight>{' '}
            {hubBody.tail}
          </p>
        ) : (
          <p className="text-xl leading-[1.65] text-white max-w-none font-semibold">
            There&apos;s <Highlight underline="salmon">{riskBody.activeRisks}</Highlight> across Somalia this week, with critical
            incidents rising in <Highlight underline="white">{riskBody.region1}</Highlight> and{' '}
            <Highlight underline="peach">{riskBody.region2}</Highlight>. {riskBody.drivers} are driving the
            most activity, with <Highlight underline="mint">{riskBody.criticalCases}</Highlight> currently open.
          </p>
        )}

        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-mono text-xs text-white/75 tracking-tight">
            {isHub ? HUB_MAIN_INSIGHT.meta : DASHBOARD_BRIEFING.summaryMeta}
          </p>
          <button
            type="button"
            disabled={!onOpenBriefing}
            onClick={(e) => {
              e.stopPropagation();
              onOpenBriefing?.();
            }}
            className="group/briefing relative z-20 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 self-start rounded-full border border-transparent bg-card px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all duration-150 hover:border-white/80 hover:bg-primary-subtle hover:text-primary-text hover:shadow-md hover:scale-[1.02] active:scale-[0.98] active:bg-primary-muted active:text-primary active:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--primary)] disabled:pointer-events-none disabled:opacity-50 sm:self-auto"
          >
            {isHub ? HUB_MAIN_INSIGHT.briefingCta : 'Open full briefing'}
            <ChevronRight
              size={16}
              strokeWidth={2.5}
              className="transition-transform duration-150 group-hover/briefing:translate-x-0.5 group-active/briefing:translate-x-1"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
