import { getReportThemeTokens, type ReportThemeTokens } from '../../data/reportThemeTokens';
import type { ReportThemeId } from '../../data/reportsAdminMock';
import { resolveThemeId } from '../../data/reportThemeTokens';

export type { ReportThemeTokens };

export function getReportBuilderTheme(themeId: string): ReportThemeTokens {
  return getReportThemeTokens(resolveThemeId(themeId));
}

export function getReportThemeOption(themeId: ReportThemeId | string) {
  return getReportThemeTokens(themeId);
}
