export type {
  ExportChartRow,
  ExportChartSpec,
  ReportExportDocument,
  ReportExportFormat,
  ReportExportKpi,
  ReportExportMeta,
  ReportExportScene,
} from './types';
export { formatExportFilename, formatExportTimestamp, exportTheme, exportThemeById } from './theme';
export { formatExportChartValue } from './formatValue';
export { downloadBlob, yieldToUi } from './downloadBlob';
export { useReportExport } from './useReportExport';
export { ReportExportButton } from './ReportExportButton';

export async function renderReportPdf(
  ...args: Parameters<typeof import('./pdf/renderReportPdf').renderReportPdf>
) {
  const mod = await import('./pdf/renderReportPdf');
  return mod.renderReportPdf(...args);
}

export async function renderReportPptx(
  ...args: Parameters<typeof import('./pptx/renderReportPptx').renderReportPptx>
) {
  const mod = await import('./pptx/renderReportPptx');
  return mod.renderReportPptx(...args);
}
