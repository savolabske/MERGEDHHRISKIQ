import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearReportPromptTimers,
  executeReportPrompt,
  REPORT_STICKY_HEADER_OFFSET,
  type ReportQueryingMode,
} from '../../shared';
import type { ReportCustomizePhase } from '../../shared/ReportDashboardCustomizeOverlay';
import { resolveAidFlowPrompt } from '../data/aidFlowPromptRecipes';
import type { AidFlowChatMessage, AidFlowRecipeResult } from '../types';

export function useAidFlowReportPrompt() {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<AidFlowChatMessage[]>([]);
  const [resultMode, setResultMode] = useState(false);
  const [resultTitle, setResultTitle] = useState('Aid flow overview');
  const [activeRecipe, setActiveRecipe] = useState<AidFlowRecipeResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryingMode, setQueryingMode] = useState<ReportQueryingMode>(null);
  const [customizePhase, setCustomizePhase] = useState<ReportCustomizePhase>('idle');
  const [activeQuery, setActiveQuery] = useState('');

  const resultSectionRef = useRef<HTMLElement>(null);
  const kpiSectionRef = useRef<HTMLElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const isQueryingRef = useRef(false);
  const pendingResolutionRef = useRef<ReturnType<typeof resolveAidFlowPrompt> | null>(null);

  const timers = { queryTimeoutRef, revealTimeoutRef, isQueryingRef };

  const cancelQuery = useCallback(() => {
    clearReportPromptTimers(timers);
    setIsQuerying(false);
    setQueryingMode(null);
    setCustomizePhase('idle');
    setActiveQuery('');
    pendingResolutionRef.current = null;
  }, []);

  const backToReport = useCallback(() => {
    cancelQuery();
    setResultMode(false);
    setActiveRecipe(null);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = kpiSectionRef.current;
        const scrollRoot =
          target?.closest<HTMLElement>('[data-report-scroll]') ??
          document.querySelector<HTMLElement>('[data-report-scroll]');
        if (!scrollRoot || !target) return;

        const rootTop = scrollRoot.getBoundingClientRect().top;
        const targetTop = target.getBoundingClientRect().top;
        const offset = targetTop - rootTop + scrollRoot.scrollTop - REPORT_STICKY_HEADER_OFFSET;
        scrollRoot.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
      });
    });
  }, [cancelQuery]);

  const runPrompt = useCallback(
    (query?: string) => {
      const q = (query ?? promptInput).trim();
      if (!q || isQueryingRef.current) return;

      const resolution = resolveAidFlowPrompt(q);
      pendingResolutionRef.current = resolution;
      setMessages((prev) => [...prev, { role: 'user', text: q }]);
      setActiveQuery(q);
      setPromptInput('');

      if (resolution.lane === 'dashboard') {
        setActiveRecipe(resolution.recipe);
        setResultTitle(resolution.recipe.title);
      }

      executeReportPrompt({
        lane: resolution.lane,
        timers,
        setIsQuerying,
        setQueryingMode,
        setCustomizePhase,
        setResultMode,
        onDashboardReady: () => {
          const pending = pendingResolutionRef.current;
          if (!pending || pending.lane !== 'dashboard') return;
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              lane: 'dashboard',
              title: pending.recipe.title,
              chips: pending.recipe.chips,
            },
          ]);
        },
        onChatReady: () => {
          const pending = pendingResolutionRef.current;
          if (!pending || pending.lane !== 'chat') return;
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              lane: 'chat',
              body: pending.body,
              chips: pending.chips,
            },
          ]);
        },
      });
    },
    [promptInput],
  );

  useEffect(() => {
    return () => clearReportPromptTimers(timers);
  }, []);

  useEffect(() => {
    if (!resultMode) return;

    const scrollResultsToTop = () => {
      const target = resultSectionRef.current;
      const scrollRoot =
        target?.closest<HTMLElement>('[data-report-scroll]') ??
        document.querySelector<HTMLElement>('[data-report-scroll]');
      if (!scrollRoot || !target) return;

      const rootTop = scrollRoot.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = targetTop - rootTop + scrollRoot.scrollTop - REPORT_STICKY_HEADER_OFFSET;
      scrollRoot.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    };

    const frame = requestAnimationFrame(scrollResultsToTop);
    return () => cancelAnimationFrame(frame);
  }, [resultMode]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isQuerying]);

  return {
    promptInput,
    setPromptInput,
    messages,
    resultMode,
    resultTitle,
    activeRecipe,
    isQuerying,
    queryingMode,
    customizePhase,
    activeQuery,
    resultSectionRef,
    kpiSectionRef,
    chatScrollRef,
    runPrompt,
    backToReport,
  };
}
