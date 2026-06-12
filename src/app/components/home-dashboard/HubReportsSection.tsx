import type { KeyboardEvent } from 'react';
import { ChevronRight, DollarSign, Landmark, Users, type LucideIcon } from 'lucide-react';
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
  const visual = REPORT_VISUALS[report.id];
  const { Icon } = visual;

  const open = () => onOpenReport(report.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e: KeyboardEvent) => activateOnKeyDown(e, open)}
      className={`${hubCard} group flex cursor-pointer flex-col border border-border border-t-2 p-5 text-left transition-colors hover:shadow-md sm:p-6 ${visual.topBorder}`}
    >
      <p className="text-sm font-semibold leading-snug text-foreground">{report.title}</p>

      <div className={`mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 ${visual.metricTint}`}>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/40 ${visual.iconBg}`}
          aria-hidden
        >
          <Icon size={22} className={visual.iconColor} strokeWidth={2} />
        </span>
        <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={`text-kpi tracking-tight ${visual.metricColor}`}
          >
            {report.metric}
          </span>
          <span className="text-sm font-medium text-muted-foreground">{report.metricLabel}</span>
        </p>
      </div>

      <p className="mt-2.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {report.summary}
      </p>
      <span
        className={`mt-3 inline-flex items-center gap-0.5 text-sm font-semibold ${visual.ctaColor} transition-[gap] group-hover:gap-1`}
      >
        Explore full report
        <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
      </span>
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
