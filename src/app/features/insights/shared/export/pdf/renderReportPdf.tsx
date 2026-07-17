import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { downloadBlob, yieldToUi } from '../downloadBlob';
import { formatExportFilename, exportTheme } from '../theme';
import type { ReportExportDocument } from '../types';
import { ExportPdfDocument } from './ExportPdfDocument';

export async function renderReportPdf(doc: ReportExportDocument): Promise<void> {
  await yieldToUi();
  const theme = exportTheme(doc);
  const blob = await pdf(<ExportPdfDocument doc={doc} theme={theme} />).toBlob();
  downloadBlob(blob, formatExportFilename(doc.meta.slug, 'pdf'));
}
