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

export function useAidFlowReportPrompt(options?: { onChatLaneReady?: () => void }) {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<AidFlowChatMessage[]>([]);
  const [resultMode, setResultMode] = useState(false);
  const [resultTitle, setResultTitle] = useState('Aid flow overview');
  const [activeRecipe, setActiveRecipe] = useState<AidFlowRecipeResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryingMode, setQueryingMode] = useState<ReportQueryingMode>(null);
  const [customizePhase, setCustomizePhase] = useState<ReportCustomizePhase>('idle');
  const [activeQuery, setActiveQuery] = useState('');
  const [extendedKnowledge, setExtendedKnowledge] = useState(false);

  const resultSectionRef = useRef<HTMLElement>(null);
  const kpiSectionRef = useRef<HTMLElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const isQueryingRef = useRef(false);
  const extendedRef = useRef(extendedKnowledge);
  const pendingResolutionRef = useRef<ReturnType<typeof resolveAidFlowPrompt> | null>(null);

  const timers = { queryTimeoutRef, revealTimeoutRef, isQueryingRef };

  useEffect(() => {
    extendedRef.current = extendedKnowledge;
  }, [extendedKnowledge]);

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

      const ext = extendedRef.current;
      const resolution = resolveAidFlowPrompt(q, ext);
      pendingResolutionRef.current = resolution;
      setMessages((prev) => [...prev, { role: 'user', text: q, extended: ext || undefined }]);
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
              extended: pending.recipe.extended,
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
              extended: ext || undefined,
            },
          ]);
          options?.onChatLaneReady?.();
        },
      });
    },
    [promptInput, options?.onChatLaneReady],
  );

  const toggleExtendedKnowledge = useCallback(() => {
    setExtendedKnowledge((prev) => {
      const next = !prev;
      setMessages((msgs) => [
        ...msgs,
        {
          role: 'system',
          text: `Extended Knowledge is now <b>${next ? 'ON' : 'OFF'}</b>. ${
            next
              ? 'I can compare Aid Flow against SJF, Migration & other reports.'
              : 'I will only answer from the Aid Flow dataset.'
          }`,
        },
      ]);
      return next;
    });
  }, []);

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
    extendedKnowledge,
    toggleExtendedKnowledge,
  };
}
