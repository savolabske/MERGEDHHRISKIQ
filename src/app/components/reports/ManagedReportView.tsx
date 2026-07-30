import { ChevronLeft } from 'lucide-react';
import type { ManagedReport } from '../../data/reportsAdminMock';
import { KPI_ICON_MAP } from '../../data/reportsAdminMock';
import { getReportThemeTokens } from '../../data/reportThemeTokens';
import { ChartSkeletonGraphic } from '../manage-reports/reportSkeletonGraphics';
import { PageScrollShell } from '../PageScrollShell';

interface ManagedReportViewProps {
  report: ManagedReport;
  onBack: () => void;
}

/** Read-only hub view for custom published managed reports. */
export function ManagedReportView({ report, onBack }: ManagedReportViewProps) {
  const theme = getReportThemeTokens(report.themeId);
  const sections = [...report.sections].sort((a, b) => a.order - b.order);

  return (
    <PageScrollShell paddingClassName="px-4 sm:px-8 pt-6 pb-10" maxWidth="960">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft size={16} />
        Back to Reports
      </button>

      <div
        className="rounded-2xl border p-6 sm:p-8"
        style={{
          backgroundColor: theme.pageBg,
          borderColor: theme.pageBorder,
        }}
      >
        <h1
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
          style={{ color: theme.textPrimary }}
        >
          {report.title}
        </h1>
        {report.description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
            {report.description}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {report.kpiTiles.map((tile, index) => {
            const Icon = KPI_ICON_MAP[tile.iconKey];
            const accent = theme.kpiAccents[index] ?? theme.accent;
            const iconBg = theme.kpiIconBgs[index] ?? theme.accentSubtle;
            const iconColor = theme.kpiIconColors[index] ?? theme.accent;

            return (
              <div
                key={tile.id}
                className="relative flex min-h-[108px] flex-col items-start gap-3 rounded-[14px] border p-4"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                }}
              >
                <span
                  className="absolute right-3 top-3 size-2.5 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <div
                  className="flex size-[30px] items-center justify-center rounded-[9px]"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon size={16} style={{ color: iconColor }} />
                </div>
                <p className="text-sm leading-snug" style={{ color: theme.textSecondary }}>
                  {tile.prompt.trim() || 'KPI insight'}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.cardBorder,
              }}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h2 className="text-base font-semibold" style={{ color: theme.textPrimary }}>
                  {section.title}
                </h2>
                <span className="text-xs font-medium tabular-nums" style={{ color: theme.textMuted }}>
                  {String(index + 1).padStart(2, '0')} / {String(sections.length).padStart(2, '0')}
                </span>
              </div>
              {section.prompt.trim() ? (
                <p className="mb-4 text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                  {section.prompt}
                </p>
              ) : null}
              <div
                className="overflow-hidden rounded-xl border"
                style={{ borderColor: theme.cardBorder, backgroundColor: theme.pageBg }}
              >
                <ChartSkeletonGraphic
                  chartType={section.chartType}
                  palette={theme.chartPalette}
                  muted={theme.chartMuted}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageScrollShell>
  );
}
