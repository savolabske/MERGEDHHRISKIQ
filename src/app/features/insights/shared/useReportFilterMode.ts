import type { ReportCustomizePhase } from './ReportDashboardCustomizeOverlay';

export type ReportFilterInteractionMode = 'explore' | 'customizing' | 'result';

export function getReportFilterInteractionMode(
  resultMode: boolean,
  customizePhase: ReportCustomizePhase,
): ReportFilterInteractionMode {
  if (customizePhase !== 'idle') return 'customizing';
  if (resultMode) return 'result';
  return 'explore';
}

export function areReportFiltersInteractive(mode: ReportFilterInteractionMode): boolean {
  return mode === 'explore';
}

export function useReportFilterMode(
  resultMode: boolean,
  customizePhase: ReportCustomizePhase,
) {
  const mode = getReportFilterInteractionMode(resultMode, customizePhase);
  return {
    mode,
    filtersInteractive: areReportFiltersInteractive(mode),
  };
}
