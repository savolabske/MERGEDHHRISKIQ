import type { MutableRefObject } from 'react';
import { REPORT_CHAT_QUERY_DELAY_MS, REPORT_QUERY_DELAY_MS, REPORT_REVEAL_DELAY_MS } from './constants';
import type { ReportCustomizePhase } from './ReportDashboardCustomizeOverlay';
import type { ReportPromptLane } from './classifyReportPrompt';

export type ReportQueryingMode = ReportPromptLane | null;

interface PromptTimerRefs {
  queryTimeoutRef: MutableRefObject<number | null>;
  revealTimeoutRef: MutableRefObject<number | null>;
  isQueryingRef: MutableRefObject<boolean>;
}

interface ExecuteReportPromptOptions {
  lane: ReportPromptLane;
  timers: PromptTimerRefs;
  setIsQuerying: (v: boolean) => void;
  setQueryingMode: (v: ReportQueryingMode) => void;
  setCustomizePhase: (v: ReportCustomizePhase) => void;
  setResultMode: (v: boolean) => void;
  onDashboardReady: () => void;
  onChatReady: () => void;
  /** After the searching state, show a failure instead of an answer. */
  failRequest?: boolean;
  onFailed?: () => void;
}

export function clearReportPromptTimers(timers: PromptTimerRefs) {
  if (timers.queryTimeoutRef.current !== null) {
    window.clearTimeout(timers.queryTimeoutRef.current);
    timers.queryTimeoutRef.current = null;
  }
  if (timers.revealTimeoutRef.current !== null) {
    window.clearTimeout(timers.revealTimeoutRef.current);
    timers.revealTimeoutRef.current = null;
  }
  timers.isQueryingRef.current = false;
}

export function executeReportPrompt({
  lane,
  timers,
  setIsQuerying,
  setQueryingMode,
  setCustomizePhase,
  setResultMode,
  onDashboardReady,
  onChatReady,
  failRequest = false,
  onFailed,
}: ExecuteReportPromptOptions) {
  setQueryingMode(lane);
  setIsQuerying(true);
  timers.isQueryingRef.current = true;

  const finishFailure = () => {
    onFailed?.();
    timers.isQueryingRef.current = false;
    setIsQuerying(false);
    setQueryingMode(null);
    setCustomizePhase('idle');
    timers.queryTimeoutRef.current = null;
  };

  if (lane === 'dashboard') {
    setCustomizePhase('customizing');
    requestAnimationFrame(() => {
      const scrollRoot = document.querySelector<HTMLElement>('[data-report-scroll]');
      scrollRoot?.scrollTo({ top: 0, behavior: 'smooth' });
    });

    timers.queryTimeoutRef.current = window.setTimeout(() => {
      if (failRequest) {
        finishFailure();
        return;
      }
      onDashboardReady();
      timers.isQueryingRef.current = false;
      setIsQuerying(false);
      setQueryingMode(null);
      setResultMode(true);
      setCustomizePhase('revealing');
      timers.queryTimeoutRef.current = null;

      timers.revealTimeoutRef.current = window.setTimeout(() => {
        setCustomizePhase('idle');
        timers.revealTimeoutRef.current = null;
      }, REPORT_REVEAL_DELAY_MS);
    }, REPORT_QUERY_DELAY_MS);
    return;
  }

  timers.queryTimeoutRef.current = window.setTimeout(() => {
    if (failRequest) {
      finishFailure();
      return;
    }
    onChatReady();
    timers.isQueryingRef.current = false;
    setIsQuerying(false);
    setQueryingMode(null);
    timers.queryTimeoutRef.current = null;
  }, REPORT_CHAT_QUERY_DELAY_MS);
}
