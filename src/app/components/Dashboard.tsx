import { type KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  CATEGORY_MAX_COUNT,
  DASHBOARD_BRIEFING,
  DASHBOARD_CATEGORIES,
  DASHBOARD_METRICS,
} from '../data/dashboardMock';
import type { DashboardChatPayload } from '../utils/dashboardChatContext';
import {
  buildCategoryChatPayload,
  buildMetricChatPayload,
  dashboardCardClass,
} from '../utils/dashboardChatContext';
import { DashboardEmergingSection } from './dashboard/DashboardEmergingSection';
import { PageScrollShell } from './PageScrollShell';
import { DashboardBriefingSection } from './dashboard/DashboardBriefingSection';
import { DashboardHeroSection } from './dashboard/DashboardHeroSection';
interface DashboardProps {
  embedded?: boolean;
  onOpenChat: (payload: DashboardChatPayload) => void;
  onOpenBriefing?: () => void;
}

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

function Sparkline({ points, stroke }: { points: readonly number[]; stroke: string }) {
  const width = 64;
  const height = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const polylinePoints = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute top-4 right-4 shrink-0 pointer-events-none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePoints}
      />
    </svg>
  );
}

function MetricCard({
  metric,
  onOpenChat,
}: {
  metric: (typeof DASHBOARD_METRICS)[number];
  onOpenChat: (payload: DashboardChatPayload) => void;
}) {
  const tintClass =
    metric.id === 'aid-diversion'
      ? 'from-destructive-subtle'
      : metric.id === 'security-incidents'
        ? 'from-warning-subtle'
        : metric.id === 'climate-issues'
          ? 'from-warning-subtle'
          : 'from-primary-subtle';

  const open = () => onOpenChat(buildMetricChatPayload(metric));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      className={`relative bg-card rounded-2xl border border-border p-5 overflow-hidden text-left group ${dashboardCardClass.white}`}
    >
      <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${tintClass} to-transparent pointer-events-none`} />
      <Sparkline points={metric.sparkline} stroke={metric.sparklineColor} />
      <p className="text-xs font-semibold text-text-subtle uppercase tracking-wider relative">
        {metric.label}
      </p>
      <p className="text-3xl font-bold text-foreground leading-none mt-2 relative">{metric.value}</p>
      <p className={`text-xs font-medium mt-2 relative ${metric.trendClass}`}>{metric.trend}</p>
      <ChevronRight
        size={16}
        className="absolute bottom-4 right-4 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
    </div>
  );
}

export function Dashboard({ embedded = false, onOpenChat, onOpenBriefing }: DashboardProps) {
  return (
    <div className="relative h-full flex flex-col bg-background overflow-hidden">
      <PageScrollShell
        className="flex-1"
        paddingClassName={`px-4 sm:px-8 ${embedded ? 'pt-4 lg:pt-4' : 'pt-6'}`}
        innerClassName="space-y-6"
      >
            <DashboardHeroSection onOpenChat={onOpenChat} onOpenBriefing={onOpenBriefing} />

            {/* Metrics + Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {DASHBOARD_METRICS.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} onOpenChat={onOpenChat} />
                ))}
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 flex flex-col">
                <h2 className="text-base font-bold text-foreground">Risk Categories</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Distribution across all {DASHBOARD_BRIEFING.activeRisksTotal} active risks
                </p>
                <div className="mt-5 space-y-5 flex-1">
                  {DASHBOARD_CATEGORIES.map((category) => {
                    const open = () => onOpenChat(buildCategoryChatPayload(category));
                    return (
                      <div
                        key={category.id}
                        role="button"
                        tabIndex={0}
                        onClick={open}
                        onKeyDown={(e) => activateOnKeyDown(e, open)}
                        className={dashboardCardClass.row}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-sm shrink-0"
                              style={{ backgroundColor: category.iconColor }}
                              aria-hidden
                            />
                            <span className="text-sm text-foreground">{category.label}</span>
                          </div>
                          <span className="text-sm font-bold text-foreground shrink-0">
                            {category.count}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              category.id === 'security'
                                ? 'from-destructive-text to-destructive'
                                : category.id === 'operational'
                                  ? 'from-warning-strong to-warning-strong'
                                  : category.id === 'compliance'
                                    ? 'from-warning to-warning'
                                    : 'from-primary to-chart-2'
                            }`}
                            style={{ width: `${(category.count / CATEGORY_MAX_COUNT) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DashboardEmergingSection onOpenChat={onOpenChat} />

            <DashboardBriefingSection onOpenChat={onOpenChat} />
      </PageScrollShell>
    </div>
  );
}
