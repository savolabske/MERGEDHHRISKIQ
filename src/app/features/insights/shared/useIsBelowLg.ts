import { useEffect, useState } from 'react';

/** Phone / tablet: chat uses a bottom sheet. Matches Tailwind `lg`. */
export const REPORT_MOBILE_BREAKPOINT = 1024;

/**
 * Minimum viewport width for side-by-side report + chat.
 * Below this (but ≥ lg), chat opens as an overlay so the report keeps full width.
 * Covers common 13–14" laptop widths (1280–1440) where a 320px sidebar crushes charts.
 */
export const REPORT_CHAT_SIDEBAR_MIN_WIDTH = 1440;

export type ReportChatLayoutMode = 'sheet' | 'overlay' | 'sidebar';

function readIsBelowLg(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${REPORT_MOBILE_BREAKPOINT - 1}px)`).matches;
}

export function readReportChatLayoutMode(): ReportChatLayoutMode {
  if (typeof window === 'undefined') return 'sidebar';
  if (window.matchMedia(`(max-width: ${REPORT_MOBILE_BREAKPOINT - 1}px)`).matches) {
    return 'sheet';
  }
  if (window.matchMedia(`(max-width: ${REPORT_CHAT_SIDEBAR_MIN_WIDTH - 1}px)`).matches) {
    return 'overlay';
  }
  return 'sidebar';
}

export function useIsBelowLg() {
  const [isBelowLg, setIsBelowLg] = useState(readIsBelowLg);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${REPORT_MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsBelowLg(mql.matches);
    mql.addEventListener('change', onChange);
    onChange();
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isBelowLg;
}

/** Resolves how the report assistant should present: sheet, overlay, or in-flow sidebar. */
export function useReportChatLayoutMode(): ReportChatLayoutMode {
  const [mode, setMode] = useState(readReportChatLayoutMode);

  useEffect(() => {
    const sheetMql = window.matchMedia(`(max-width: ${REPORT_MOBILE_BREAKPOINT - 1}px)`);
    const overlayMql = window.matchMedia(
      `(min-width: ${REPORT_MOBILE_BREAKPOINT}px) and (max-width: ${REPORT_CHAT_SIDEBAR_MIN_WIDTH - 1}px)`,
    );

    const onChange = () => setMode(readReportChatLayoutMode());
    sheetMql.addEventListener('change', onChange);
    overlayMql.addEventListener('change', onChange);
    onChange();
    return () => {
      sheetMql.removeEventListener('change', onChange);
      overlayMql.removeEventListener('change', onChange);
    };
  }, []);

  return mode;
}
