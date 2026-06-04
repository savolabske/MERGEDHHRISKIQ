import type { KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import { DASHBOARD_BRIEFING_UPDATES } from '../../data/dashboardMock';
import { HUB_BRIEFING_UPDATES } from '../../data/homeDashboardMock';
import type { DashboardChatPayload } from '../../utils/dashboardChatContext';
import { buildBriefingUpdateChatPayload, dashboardCardClass } from '../../utils/dashboardChatContext';

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

function BriefingUpdateRow({
  update,
  isLast,
  onOpenChat,
  buildUpdateChatPayload,
  compactDescription = false,
  hideDescription = false,
  fillHeight = false,
}: {
  update: BriefingUpdate;
  isLast: boolean;
  onOpenChat: (payload: DashboardChatPayload) => void;
  buildUpdateChatPayload: (update: BriefingUpdate) => DashboardChatPayload;
  compactDescription?: boolean;
  hideDescription?: boolean;
  fillHeight?: boolean;
}) {
  const open = () => onOpenChat(buildUpdateChatPayload(update));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => activateOnKeyDown(e, open)}
      className={`flex gap-4 px-5 sm:px-6 text-left group ${dashboardCardClass.row} ${
        fillHeight ? 'flex-1 min-h-0' : ''
      } ${hideDescription || compactDescription ? 'py-3.5 items-center' : 'py-5'} ${
        isLast ? '' : 'border-b border-sidebar-border'
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${hideDescription ? '' : 'mt-1.5'}`}
        style={{ backgroundColor: update.dotColor }}
        aria-hidden
      />
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm text-foreground leading-snug pr-2 ${
              hideDescription ? 'font-medium' : 'font-semibold'
            }`}
          >
            {update.headline}
          </h3>
          {!hideDescription && (
            <p
              className={`text-sm text-muted-foreground italic ${
                compactDescription
                  ? 'mt-1.5 line-clamp-1 leading-snug'
                  : 'mt-2 leading-relaxed'
              }`}
              title={compactDescription ? update.description : undefined}
            >
              &ldquo;{update.description}&rdquo;
            </p>
          )}
        </div>
        <div className="shrink-0 sm:text-right sm:min-w-[88px]">
          <p className="text-sm font-semibold text-foreground">{update.relativeTime}</p>
          <p className="text-xs text-text-subtle mt-0.5">{update.absoluteTime}</p>
        </div>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 self-center text-text-subtle opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      />
    </div>
  );
}

type BriefingUpdate =
  | (typeof DASHBOARD_BRIEFING_UPDATES)[number]
  | (typeof HUB_BRIEFING_UPDATES)[number];

export function DashboardBriefingSection({
  onOpenChat,
  title = 'Risk Briefing',
  subtitle = 'AI-flagged updates across the registers',
  updates = DASHBOARD_BRIEFING_UPDATES,
  buildUpdateChatPayload = buildBriefingUpdateChatPayload,
  compactDescription = false,
  hideDescription = false,
  fillHeight = false,
}: {
  onOpenChat: (payload: DashboardChatPayload) => void;
  title?: string;
  subtitle?: string;
  updates?: readonly BriefingUpdate[];
  buildUpdateChatPayload?: (update: BriefingUpdate) => DashboardChatPayload;
  /** Single-line descriptions — full text opens in chat on click */
  compactDescription?: boolean;
  /** Hide per-item description text (e.g. home Emerging insights) */
  hideDescription?: boolean;
  /** Stretch card to match a sibling column (e.g. home Reports) */
  fillHeight?: boolean;
}) {
  return (
    <div className={`space-y-4 ${fillHeight ? 'h-full flex flex-col' : ''}`}>
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
      </div>

      <div
        className={`bg-card rounded-2xl border border-border overflow-hidden ${
          fillHeight ? 'flex-1 flex flex-col min-h-0' : ''
        }`}
      >
        {updates.map((update, index) => (
          <BriefingUpdateRow
            key={update.id}
            update={update}
            isLast={index === updates.length - 1}
            onOpenChat={onOpenChat}
            buildUpdateChatPayload={buildUpdateChatPayload}
            compactDescription={compactDescription}
            hideDescription={hideDescription}
            fillHeight={fillHeight}
          />
        ))}
      </div>
    </div>
  );
}
