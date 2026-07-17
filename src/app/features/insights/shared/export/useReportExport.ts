import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ReportExportDocument, ReportExportFormat } from './types';

/** Only show the loading toast if generation takes longer than this. */
const LOADING_TOAST_DELAY_MS = 350;

export function useReportExport(buildDocument: () => ReportExportDocument) {
  const [isExporting, setIsExporting] = useState(false);
  const busyRef = useRef(false);
  const buildRef = useRef(buildDocument);
  buildRef.current = buildDocument;

  const exportReport = useCallback(async (format: ReportExportFormat) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsExporting(true);

    const label = format === 'pdf' ? 'PDF' : 'PowerPoint';
    let toastId: string | number | undefined;
    const loadingTimer = window.setTimeout(() => {
      toastId = toast.loading(`Generating ${label}…`);
    }, LOADING_TOAST_DELAY_MS);

    try {
      const doc = buildRef.current();
      if (format === 'pdf') {
        const { renderReportPdf } = await import('./pdf/renderReportPdf');
        await renderReportPdf(doc);
      } else {
        const { renderReportPptx } = await import('./pptx/renderReportPptx');
        await renderReportPptx(doc);
      }
      window.clearTimeout(loadingTimer);
      if (toastId !== undefined) {
        toast.success(`${label} downloaded`, { id: toastId });
      } else {
        toast.success(`${label} downloaded`);
      }
    } catch (err) {
      window.clearTimeout(loadingTimer);
      console.error('Report export failed', err);
      if (toastId !== undefined) {
        toast.error(`Could not generate ${label}. Please try again.`, { id: toastId });
      } else {
        toast.error(`Could not generate ${label}. Please try again.`);
      }
    } finally {
      busyRef.current = false;
      setIsExporting(false);
    }
  }, []);

  return { exportReport, isExporting };
}
