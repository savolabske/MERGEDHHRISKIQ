import { useEffect, useState, type KeyboardEvent } from 'react';
import { ChevronRight, DollarSign, Landmark, LayoutGrid, Users, type LucideIcon } from 'lucide-react';
import {
  getHomeReportsPreview,
  HOME_REPORTS_PREVIEW_CHANGED_EVENTS,
  type HomeReportPreview,
} from '../../data/homeReportsPreview';
import { hubCard } from './hubStyles';

const ICON_BY_NAME: Record<NonNullable<HomeReportPreview['IconName']>, LucideIcon> = {
  'aid-flow': DollarSign,
  'migration-displacement': Users,
  'somalia-joint-fund': Landmark,
  custom: LayoutGrid,
};

const DEFAULT_VISUAL = {
  iconBg: 'bg-muted',
  iconColor: 'text-muted-foreground',
  metricColor: 'text-foreground',
  topBorder: 'border-t-border',
  metricTint: 'bg-muted/60',
  ctaColor: 'text-primary group-hover:text-primary-text',
};

const REPORT_VISUALS: Record<
  string,
  {
    iconBg: string;
    iconColor: string;
    metricColor: string;
    topBorder: string;
    metricTint: string;
    ctaColor: string;
  }
> = {
  'aid-flow': {
    iconBg: 'bg-primary-subtle',
    iconColor: 'text-primary',
    metricColor: 'text-primary',
    topBorder: 'border-t-primary',
    metricTint: 'bg-primary-subtle/50',
    ctaColor: 'text-primary group-hover:text-primary-text',
  },
  'migration-displacement': {
    iconBg: 'bg-chart-3/10',
    iconColor: 'text-chart-3',
    metricColor: 'text-chart-3',
    topBorder: 'border-t-chart-3',
    metricTint: 'bg-chart-3/10',
    ctaColor: 'text-chart-3 group-hover:opacity-90',
  },
  'somalia-joint-fund': {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-700',
    metricColor: 'text-emerald-700',
    topBorder: 'border-t-emerald-600',
    metricTint: 'bg-emerald-500/10',
    ctaColor: 'text-emerald-700 group-hover:opacity-90',
  },
};

interface HubReportsSectionProps {
  onOpenReport: (reportId: string) => void;
  onViewAllReports: () => void;
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
  report: HomeReportPreview;
  onOpenReport: (reportId: string) => void;
}) {
  const visual = REPORT_VISUALS[report.id] ?? DEFAULT_VISUAL;
  const Icon = ICON_BY_NAME[report.IconName ?? 'custom'];
  const canOpen = report.available;

  const open = () => {
    if (!canOpen) return;
    onOpenReport(report.id);
  };

  return (
    <div
      role={canOpen ? 'button' : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onClick={canOpen ? open : undefined}
      onKeyDown={canOpen ? (e: KeyboardEvent) => activateOnKeyDown(e, open) : undefined}
      className={`${hubCard} group flex flex-col border border-border border-t-2 p-5 text-left transition-colors sm:p-6 ${visual.topBorder} ${
        canOpen ? 'cursor-pointer hover:shadow-md' : 'opacity-90'
      }`}
    >
      {!canOpen && (
        <span className="mb-2 self-start rounded-full bg-muted px-2.5 py-1 text-metadata uppercase tracking-wide text-muted-foreground">
          Coming soon
        </span>
      )}

      <p className="text-sm font-semibold leading-snug text-foreground">{report.title}</p>

      <div className={`mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 ${visual.metricTint}`}>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/40 ${
            report.iconBgHex ? '' : visual.iconBg
          }`}
          style={report.iconBgHex ? { backgroundColor: report.iconBgHex } : undefined}
          aria-hidden
        >
          <Icon
            size={22}
            className={report.iconColorHex ? undefined : visual.iconColor}
            style={report.iconColorHex ? { color: report.iconColorHex } : undefined}
            strokeWidth={2}
          />
        </span>
        {report.metric ? (
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={`text-kpi tracking-tight ${visual.metricColor}`}>{report.metric}</span>
            {report.metricLabel ? (
              <span className="text-sm font-medium text-muted-foreground">{report.metricLabel}</span>
            ) : null}
          </p>
        ) : null}
      </div>

      <p className="mt-2.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {report.summary}
      </p>
      {canOpen ? (
        <span
          className={`mt-3 inline-flex items-center gap-0.5 text-sm font-semibold ${visual.ctaColor} transition-[gap] group-hover:gap-1`}
        >
          Explore full report
          <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}
    </div>
  );
}

/** Humanity Hub home — top reports from hub customize order. */
export function HubReportsSection({ onOpenReport, onViewAllReports }: HubReportsSectionProps) {
  const [preview, setPreview] = useState(() => getHomeReportsPreview());

  useEffect(() => {
    const sync = () => setPreview(getHomeReportsPreview());
    for (const eventName of HOME_REPORTS_PREVIEW_CHANGED_EVENTS) {
      window.addEventListener(eventName, sync);
    }
    window.addEventListener('focus', sync);
    return () => {
      for (const eventName of HOME_REPORTS_PREVIEW_CHANGED_EVENTS) {
        window.removeEventListener(eventName, sync);
      }
      window.removeEventListener('focus', sync);
    };
  }, []);

  const { reports, remainingCount, totalVisible } = preview;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Reports</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Thematic dashboards — aid flows, displacement, and more
          </p>
        </div>
        {remainingCount > 0 ? (
          <button
            type="button"
            onClick={onViewAllReports}
            className="inline-flex shrink-0 items-center gap-0.5 self-start text-sm font-semibold text-primary transition-[gap] hover:gap-1 hover:text-primary-text sm:self-auto"
          >
            View other {remainingCount} report{remainingCount === 1 ? '' : 's'}
            <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
          </button>
        ) : null}
      </div>

      {totalVisible === 0 ? (
        <div className={`${hubCard} border border-border p-6 text-center`}>
          <p className="text-sm text-muted-foreground">No reports are visible in your hub layout.</p>
          <button
            type="button"
            onClick={onViewAllReports}
            className="mt-3 inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:text-primary-text"
          >
            Go to Reports
            <ChevronRight size={14} strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {reports.map((report) => (
            <ReportHighlightCard key={report.id} report={report} onOpenReport={onOpenReport} />
          ))}
        </div>
      )}
    </div>
  );
}
