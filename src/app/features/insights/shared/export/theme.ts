import { getReportThemeTokens, type ReportThemeTokens } from '../../../../data/reportThemeTokens';
import type { ReportThemeId } from '../../../../data/reportsAdminMock';
import type { ReportExportDocument } from './types';

export function exportTheme(doc: ReportExportDocument): ReportThemeTokens {
  return getReportThemeTokens(doc.meta.themeId);
}

export function exportThemeById(themeId: ReportThemeId): ReportThemeTokens {
  return getReportThemeTokens(themeId);
}

export function formatExportTimestamp(date = new Date()): string {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatExportFilename(slug: string, ext: 'pdf' | 'pptx', date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${slug}-${y}-${m}-${d}.${ext}`;
}
