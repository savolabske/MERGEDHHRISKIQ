import type { KeyboardEvent } from 'react';
import { ChevronRight, Cloud, DollarSign, Landmark, Users, type LucideIcon } from 'lucide-react';
import {
  HUB_REPORT_HIGHLIGHTS,
  type HubReportHighlightId,
} from '../../data/homeDashboardMock';
import { hubCard } from './hubStyles';

const REPORT_VISUALS: Record<
  HubReportHighlightId,
  {
    Icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    metricColor: string;
    topBorder: string;
    metricTint: string;
    ctaColor: string;
  }
> = {
  'aid-flow': {
    Icon: DollarSign,
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
    metricColor: 'text-primary',
    topBorder: 'border-t-primary',
    metricTint: 'bg-primary-subtle/50',
    ctaColor: 'text-primary group-hover:text-primary-text',
  },
  'migration-displacement': {
    Icon: Users,
    iconBg: 'bg-chart-3/10',
    iconColor: 'text-chart-3',
    metricColor: 'text-chart-3',
    topBorder: 'border-t-chart-3',
    metricTint: 'bg-chart-3/10',
    ctaColor: 'text-chart-3 group-hover:opacity-90',
  },
  'somalia-joint-fund': {
    Icon: Landmark,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-700',
    metricColor: 'text-emerald-700',
    topBorder: 'border-t-emerald-600',
    metricTint: 'bg-emerald-500/10',
    ctaColor: 'text-emerald-700 group-hover:opacity-90',
  },
  'climate-hazards': {
    Icon: Cloud,
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success',
    metricColor: 'text-success',
    topBorder: 'border-t-success',
    metricTint: 'bg-success-subtle/50',
    ctaColor: 'text-success group-hover:opacity-90',
  },
};

/** Muted “coming soon” look — keeps theme tint, lowers contrast (not flat grey). */
const COMING_SOON_STYLES: Partial<
  Record<
    HubReportHighlightId,
    {
      topBorder: string;
      metricTint: string;
      iconBg: string;
      iconColor: string;
      metricColor: string;
      ctaColor: string;
    }
  >
> = {
  'climate-hazards': {
    topBorder: 'border-t-success/35',
    metricTint: 'bg-success-subtle/70',
    iconBg: 'bg-success-subtle',
    iconColor: 'text-success/50',
    metricColor: 'text-success/60',
    ctaColor: 'text-success/50',
  },
};

interface HubReportsSectionProps {
  onOpenReport: (reportId: HubReportHighlightId) => void;
}

function activateOnKeyDown(e: KeyboardEvent, onActivate: () => void) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onActivate();
  }
}

function ReportHighlightCard({
  report,
  onOpenReport,
}: {
  report: (typeof HUB_REPORT_HIGHLIGHTS)[number];
  onOpenReport: (reportId: HubReportHighlightId) => void;
}) {
  const available = report.available !== false;
  const visual = REPORT_VISUALS[report.id];
  const comingSoon = !available ? COMING_SOON_STYLES[report.id] : undefined;
  const { Icon } = visual;

  const open = () => onOpenReport(report.id);

  const cardClass = `${hubCard} flex flex-col p-5 sm:p-6 text-left border border-border border-t-2 ${
    available
      ? `group cursor-pointer transition-colors ${visual.topBorder} hover:shadow-md`
      : `cursor-default pointer-events-none ${comingSoon?.topBorder ?? 'border-t-border'}`
  }`;

  return (
    <div
      {...(available
        ? {
            role: 'button' as const,
            tabIndex: 0,
            onClick: open,
            onKeyDown: (e: KeyboardEvent) => activateOnKeyDown(e, open),
          }
        : { 'aria-disabled': true })}
      className={cardClass}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-sm font-semibold leading-snug ${
            available ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {report.title}
        </p>
        {!available && (
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Coming soon
          </span>
        )}
      </div>

      <div
        className={`mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 ${
          available ? visual.metricTint : (comingSoon?.metricTint ?? 'bg-muted/60')
        }`}
      >
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/40 ${
            available ? visual.iconBg : (comingSoon?.iconBg ?? 'bg-muted')
          }`}
          aria-hidden
        >
          <Icon
            size={22}
            className={available ? visual.iconColor : (comingSoon?.iconColor ?? 'text-muted-foreground')}
            strokeWidth={2}
          />
        </span>
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
          <span
            className={`text-2xl sm:text-[1.75rem] font-bold tabular-nums tracking-tight ${
              available ? visual.metricColor : (comingSoon?.metricColor ?? 'text-muted-foreground')
            }`}
          >
            {report.metric}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{report.metricLabel}</span>
        </p>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground line-clamp-2 flex-1">
        {report.summary}
      </p>
      {available ? (
        <span
          className={`mt-3 inline-flex items-center gap-0.5 text-sm font-semibold ${visual.ctaColor} group-hover:gap-1 transition-[gap]`}
        >
          Explore full report
          <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

/** Humanity Hub home — three report teaser cards in a row. */
export function HubReportsSection({ onOpenReport }: HubReportsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Thematic dashboards — aid flows, displacement, and more
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HUB_REPORT_HIGHLIGHTS.map((report) => (
          <ReportHighlightCard
            key={report.id}
            report={report}
            onOpenReport={onOpenReport}
          />
        ))}
      </div>
    </div>
  );
}
