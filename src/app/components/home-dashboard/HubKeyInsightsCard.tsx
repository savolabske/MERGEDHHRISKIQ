import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  HUB_KEY_INSIGHT_CATEGORIES,
  HUB_KEY_INSIGHT_PREVIEW_COUNT,
  HUB_KEY_INSIGHTS,
  type HubKeyInsight,
  type HubKeyInsightCategory,
} from '../../data/homeDashboardMock';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import { buildHubKeyInsightChatPayload } from '../../utils/dashboardChatContext';
import { hubCard } from './hubStyles';

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

function InsightTabs({
  active,
  onChange,
}: {
  active: HubKeyInsightCategory;
  onChange: (id: HubKeyInsightCategory) => void;
}) {
  return (
    <div className="flex gap-4 border-b border-border">
      {HUB_KEY_INSIGHT_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
          className={`px-0.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
            active === category.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

function InsightRow({
  insight,
  interactive,
  onOpen,
}: {
  insight: HubKeyInsight;
  interactive: boolean;
  onOpen: (insight: HubKeyInsight) => void;
}) {
  const open = () => onOpen(insight);

  if (!interactive) {
    return (
      <div className="w-full flex items-start gap-2.5 py-2.5 text-left">
        <span
          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
          style={{ backgroundColor: insight.dotColor }}
          aria-hidden
        />
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-foreground leading-snug line-clamp-1">
            {insight.headline}
          </span>
          <span className="block text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-1">
            {insight.description}
          </span>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      className="group w-full flex items-start gap-2.5 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      <span
        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
        style={{ backgroundColor: insight.dotColor }}
        aria-hidden
      />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-foreground leading-snug line-clamp-1">
          {insight.headline}
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-1">
          {insight.description}
        </span>
      </span>
      <ChevronRight
        size={14}
        className="shrink-0 mt-1 text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
    </button>
  );
}

function InsightPageNav({
  pageIndex,
  pageCount,
  totalCount,
  onPageChange,
}: {
  pageIndex: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (pageIndex: number) => void;
}) {
  const rangeStart = pageIndex * HUB_KEY_INSIGHT_PREVIEW_COUNT + 1;
  const rangeEnd = Math.min((pageIndex + 1) * HUB_KEY_INSIGHT_PREVIEW_COUNT, totalCount);
  const canGoBack = pageIndex > 0;
  const canGoForward = pageIndex < pageCount - 1;

  return (
    <div className="mt-3 flex items-center justify-between gap-3 pt-1">
      <p className="text-xs text-muted-foreground leading-snug">
        <span className="font-medium text-foreground">{totalCount}</span>{' '}
        {totalCount === 1 ? 'insight' : 'insights'} available
        {pageCount > 1 && (
          <span className="text-text-subtle">
            {' '}
            · {rangeStart}–{rangeEnd}
          </span>
        )}
      </p>

      {pageCount > 1 && (
        <nav
          className="flex items-center gap-1.5 shrink-0"
          aria-label="Browse emerging insights"
        >
          <button
            type="button"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canGoBack}
            aria-label="Previous insights"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden />
          </button>

          <div className="flex items-center gap-1.5 px-0.5" role="group" aria-label="Insight pages">
            {Array.from({ length: pageCount }, (_, index) => {
              const isActive = index === pageIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onPageChange(index)}
                  aria-label={`Show insights ${index * HUB_KEY_INSIGHT_PREVIEW_COUNT + 1}–${Math.min((index + 1) * HUB_KEY_INSIGHT_PREVIEW_COUNT, totalCount)}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`rounded-full transition-all ${
                    isActive
                      ? 'w-2 h-2 bg-primary'
                      : 'w-1.5 h-1.5 bg-border hover:bg-muted-foreground/50'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canGoForward}
            aria-label="Next insights"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={16} strokeWidth={2.25} aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
}

interface HubKeyInsightsCardProps {
  insights?: HubKeyInsight[];
  interactive?: boolean;
  onOpenChat: (payload: DashboardChatPayload) => void;
}

export function HubKeyInsightsCard({
  insights = HUB_KEY_INSIGHTS,
  interactive = true,
  onOpenChat,
}: HubKeyInsightsCardProps) {
  const [activeCategory, setActiveCategory] = useState<HubKeyInsightCategory>('climate');
  const [pageIndex, setPageIndex] = useState(0);

  const categoryInsights = useMemo(
    () => insights.filter((insight) => insight.category === activeCategory),
    [activeCategory, insights],
  );

  const pageCount = Math.max(1, Math.ceil(categoryInsights.length / HUB_KEY_INSIGHT_PREVIEW_COUNT));

  useEffect(() => {
    setPageIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageIndex, pageCount]);

  const preview = categoryInsights.slice(
    pageIndex * HUB_KEY_INSIGHT_PREVIEW_COUNT,
    (pageIndex + 1) * HUB_KEY_INSIGHT_PREVIEW_COUNT,
  );

  const openInsight = (insight: HubKeyInsight) => {
    onOpenChat(buildHubKeyInsightChatPayload(insight));
  };

  return (
    <div className={`${hubCard} p-6 flex flex-col`}>
      <div>
        <h2 className="text-sm font-semibold text-foreground">Emerging insights</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Flagged signals across climate, aid flow, and displacement
        </p>
      </div>

      <div className="mt-4">
        <InsightTabs
          active={activeCategory}
          onChange={(category) => {
            setActiveCategory(category);
          }}
        />
      </div>

      <ul className="mt-3 divide-y divide-border flex-1">
        {preview.map((insight) => (
          <li key={insight.id}>
            <InsightRow insight={insight} interactive={interactive} onOpen={openInsight} />
          </li>
        ))}
      </ul>

      <InsightPageNav
        pageIndex={pageIndex}
        pageCount={pageCount}
        totalCount={categoryInsights.length}
        onPageChange={setPageIndex}
      />
    </div>
  );
}
